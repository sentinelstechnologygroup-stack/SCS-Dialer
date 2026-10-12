import {initializeApp} from 'firebase-admin/app';
import {getFirestore,FieldValue,Timestamp} from 'firebase-admin/firestore';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {randomBytes,createHash} from 'node:crypto';
import {authorizeMember,validateCompany,validateInvite,validateContact} from './authorization.js';
initializeApp();const db=getFirestore();const options={region:'us-central1',enforceAppCheck:true};
export const listMyWorkspaces=onCall(options,async request=>{
 if(!request.auth?.uid||request.auth.token.email_verified!==true)throw new HttpsError('unauthenticated','Verify your employee email first');
 const profile=await db.doc(`users/${request.auth.uid}`).get();
 if(!profile.data()?.companyId)return [];
 const index=await db.collection(`users/${request.auth.uid}/workspaces`).where('companyId','==',profile.data().companyId).get();
 const rows=await Promise.all(index.docs.map(async item=>{const c=validateCompany(item.id);const member=await db.doc(`companies/${c}/members/${request.auth.uid}`).get();return member.data()?.active===true?{companyId:c,role:member.data().role}:null;}));
 return rows.filter(Boolean);
});
export const listEmployeeInvitations=onCall(options,async request=>{
 const companyId=await membership(request,['company_admin']);const rows=await db.collection(`companies/${companyId}/invitations`).orderBy('createdAt','desc').limit(100).get();
 return rows.docs.map(row=>{const d=row.data();return {id:row.id,email:d.email,role:d.role,status:d.status,expiresAt:d.expiresAt.toDate().toISOString()};});
});
export const revokeEmployeeInvitation=onCall(options,async request=>{
 const c=await membership(request,['company_admin']);const id=request.data.invitationId;
 if(typeof id!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(id))throw new HttpsError('invalid-argument','Invalid invitation');
 await db.runTransaction(async tx=>{const ref=db.doc(`companies/${c}/invitations/${id}`);const row=await tx.get(ref);if(row.data()?.status!=='pending')throw new HttpsError('failed-precondition','Invitation is no longer pending');tx.update(ref,{status:'revoked',tokenHash:FieldValue.delete()});tx.create(db.collection(`companies/${c}/audit`).doc(),audit(c,request.auth.uid,'invitation.revoked',id));});return {status:'revoked'};
});
async function membership(request,roles){try{const companyId=validateCompany(request.data.companyId);if(request.data.supportSession){if(typeof request.data.supportSession!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(request.data.supportSession))throw new Error('Invalid support session');const actor=await support(request);const session=await db.doc(`supportSessions/${request.data.supportSession}`).get();const grant=session.data();if(!grant||grant.actor!==actor||grant.companyId!==companyId||grant.expiresAt.toMillis()<=Date.now())throw new Error('Support session is expired or does not match the customer');await db.collection('platformAudit').add(audit(companyId,actor,'support.customer.operation',companyId));return companyId;}const profile=await db.doc(`users/${request.auth?.uid||'_anonymous'}`).get();if(profile.data()?.companyId!==companyId)throw new Error('This account belongs to another company');const snap=await db.doc(`companies/${companyId}/members/${request.auth?.uid||'_anonymous'}`).get();authorizeMember(request.auth,snap.data(),roles);return companyId;}catch(error){throw new HttpsError('permission-denied',error.message);}}
async function support(request){
 if(!request.auth?.uid||request.auth.token.email_verified!==true)throw new HttpsError('unauthenticated','Verified support login required');
 const staff=await db.doc(`platformStaff/${request.auth.uid}`).get();
 if(staff.data()?.active!==true||staff.data()?.role!=='platform_owner')throw new HttpsError('permission-denied','Sentinels support authority required');
 return request.auth.uid;
}
export const listSupportCustomers=onCall(options,async request=>{await support(request);const rows=await db.collection('companies').limit(200).get();return rows.docs.map(row=>({companyId:row.id,name:row.data().name,status:row.data().status}));});
export const openSupportCustomer=onCall(options,async request=>{
 const actor=await support(request);const companyId=validateCompany(request.data.companyId);const company=await db.doc(`companies/${companyId}`).get();
 if(!company.exists)throw new HttpsError('not-found','Customer does not exist');
 const session=db.collection('supportSessions').doc();const batch=db.batch();batch.create(session,{actor,companyId,expiresAt:Timestamp.fromMillis(Date.now()+30*60000)});batch.create(db.collection('platformAudit').doc(),audit(companyId,actor,'support.customer.opened',companyId));await batch.commit();
 return {companyId,name:company.data().name,supportSession:session.id};
});
export const listCompanyNumberRequests=onCall(options,async request=>{const companyId=await membership(request,['company_admin']);const rows=await db.collection(`companies/${companyId}/numberRequests`).limit(100).get();return rows.docs.map(row=>({id:row.id,...row.data(),createdAt:row.data().createdAt?.toDate().toISOString()}));});
export const requestCompanyNumber=onCall(options,async request=>{
 const companyId=await membership(request,['company_admin']);const areaCode=request.data.areaCode;
 if(typeof areaCode!=='string'||! /^\d{3}$/.test(areaCode))throw new HttpsError('invalid-argument','Enter a three-digit US area code');
 const ref=db.collection(`companies/${companyId}/numberRequests`).doc();const batch=db.batch();
 batch.create(ref,{companyId,areaCode,status:'awaiting_support_review',requestedBy:request.auth.uid,createdAt:FieldValue.serverTimestamp()});
 batch.create(db.collection(`companies/${companyId}/audit`).doc(),audit(companyId,request.auth.uid,'number.requested',ref.id));await batch.commit();
 return {requestId:ref.id,status:'awaiting_support_review',purchased:false};
});
export const onboardSupportCustomer=onCall(options,async request=>{
 const actor=await support(request);const companyId=validateCompany(request.data.companyId);const name=request.data.name;
 if(typeof name!=='string'||!name.trim()||name.length>150)throw new HttpsError('invalid-argument','Customer name required');
 const invite=validateInvite({email:request.data.adminEmail,role:'company_admin'});
 const numbers=request.data.phoneNumbers||[];
 if(!Array.isArray(numbers)||numbers.length>200||numbers.some(n=>typeof n!=='string'||! /^\+[1-9]\d{7,14}$/.test(n))||new Set(numbers).size!==numbers.length)throw new HttpsError('invalid-argument','Invalid or duplicate phone numbers');
 const token=randomBytes(32).toString('hex'),ref=db.collection(`companies/${companyId}/invitations`).doc();const batch=db.batch();
 batch.create(db.doc(`companies/${companyId}`),{name:name.trim(),status:'setup_pending',numberPurchasing:{enabled:false},createdAt:FieldValue.serverTimestamp()});
 batch.create(ref,{...invite,companyId,tokenHash:createHash('sha256').update(token).digest('hex'),createdBy:actor,status:'pending',expiresAt:Timestamp.fromMillis(Date.now()+7*86400000),createdAt:FieldValue.serverTimestamp()});
 numbers.forEach(number=>batch.create(db.doc(`companies/${companyId}/numbers/${number}`),{companyId,phoneNumber:number,status:'ownership_verification_pending',assignedUserId:null}));
 batch.create(db.collection('platformAudit').doc(),audit(companyId,actor,'customer.created',companyId));await batch.commit();
 return {companyId,invitationId:ref.id,token,status:'setup_pending'};
});
function audit(companyId,actor,action,resourceId){return {companyId,actor,action,resourceId,createdAt:FieldValue.serverTimestamp()};}
export const saveCompanyContact=onCall(options,async request=>{
 const companyId=await membership(request);let contact;
 try{contact=validateContact(request.data.contact);}catch(e){throw new HttpsError('invalid-argument',e.message);}
 const id=request.data.contactId;
 if(id!==undefined&&(typeof id!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(id)))throw new HttpsError('invalid-argument','Invalid contact ID');
 const ref=id?db.doc(`companies/${companyId}/contacts/${id}`):db.collection(`companies/${companyId}/contacts`).doc();
 await db.runTransaction(async tx=>{
  const member=await tx.get(db.doc(`companies/${companyId}/members/${request.auth.uid}`));
  try{authorizeMember(request.auth,member.data());}catch(e){throw new HttpsError('permission-denied',e.message);}
  const existing=await tx.get(ref);
  if(id&&!existing.exists)throw new HttpsError('not-found','Contact is unavailable');
  if(existing.exists&&existing.data().companyId!==companyId)throw new HttpsError('permission-denied','Contact ownership mismatch');
  tx.set(ref,{...contact,companyId,updatedBy:request.auth.uid,updatedAt:FieldValue.serverTimestamp(),...(!id?{createdBy:request.auth.uid,createdAt:FieldValue.serverTimestamp()}:{} )},{merge:true});
  tx.create(db.collection(`companies/${companyId}/audit`).doc(),audit(companyId,request.auth.uid,id?'contact.updated':'contact.created',ref.id));
 });return {contactId:ref.id};
});
export const createEmployeeInvitation=onCall(options,async request=>{
 const companyId=await membership(request,['company_admin']);let input;try{input=validateInvite(request.data);}catch(error){throw new HttpsError('invalid-argument',error.message);}
 const token=randomBytes(32).toString('hex');const tokenHash=createHash('sha256').update(token).digest('hex');const ref=db.collection(`companies/${companyId}/invitations`).doc();const batch=db.batch();
 batch.create(ref,{...input,companyId,tokenHash,createdBy:request.auth.uid,status:'pending',expiresAt:Timestamp.fromMillis(Date.now()+7*86400000),createdAt:FieldValue.serverTimestamp()});
 batch.create(db.collection(`companies/${companyId}/audit`).doc(),audit(companyId,request.auth.uid,'invitation.created',ref.id));await batch.commit();
 // No email is sent. Admin may deliver the invite through an approved channel.
 return {invitationId:ref.id,companyId,token,expiresInDays:7};
});
export const inspectEmployeeInvitation=onCall(options,async request=>{
 const companyId=validateCompany(request.data.companyId);const {invitationId,token}=request.data;
 if(typeof invitationId!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(invitationId)||typeof token!=='string'||! /^[a-f0-9]{64}$/.test(token))throw new HttpsError('invalid-argument','Invalid invitation');
 const row=await db.doc(`companies/${companyId}/invitations/${invitationId}`).get();const data=row.data();
 if(!data||data.status!=='pending'||data.expiresAt.toMillis()<=Date.now()||data.tokenHash!==createHash('sha256').update(token).digest('hex'))throw new HttpsError('permission-denied','Invitation is unavailable');
 return {email:data.email,companyId};
});
export const acceptEmployeeInvitation=onCall(options,async request=>{
 if(!request.auth?.uid||request.auth.token.email_verified!==true)throw new HttpsError('unauthenticated','Verify your employee email first');
 const companyId=validateCompany(request.data.companyId);const {invitationId,token}=request.data;
 if(typeof invitationId!=='string'||! /^[a-zA-Z0-9_-]{1,100}$/.test(invitationId)||typeof token!=='string'||! /^[a-f0-9]{64}$/.test(token))throw new HttpsError('invalid-argument','Invalid invitation');
 const ref=db.doc(`companies/${companyId}/invitations/${invitationId}`);const memberRef=db.doc(`companies/${companyId}/members/${request.auth.uid}`);
 await db.runTransaction(async tx=>{const invitation=await tx.get(ref);const existing=await tx.get(memberRef);const profileRef=db.doc(`users/${request.auth.uid}`);const profile=await tx.get(profileRef);if(profile.exists&&profile.data().companyId!==companyId)throw new HttpsError('permission-denied','This employee account is already assigned to another company');const data=invitation.data();if(!data||data.status!=='pending'||data.expiresAt.toMillis()<Date.now()||data.email!==request.auth.token.email?.toLowerCase()||data.tokenHash!==createHash('sha256').update(token).digest('hex')||existing.exists)throw new HttpsError('permission-denied','Invitation is unavailable or does not match this employee');tx.create(memberRef,{companyId,uid:request.auth.uid,email:data.email,role:data.role,active:true,createdAt:FieldValue.serverTimestamp()});tx.set(profileRef,{companyId},{merge:true});tx.set(db.doc(`users/${request.auth.uid}/workspaces/${companyId}`),{companyId});tx.update(ref,{status:'accepted',acceptedBy:request.auth.uid,acceptedAt:FieldValue.serverTimestamp(),tokenHash:FieldValue.delete()});tx.create(db.collection(`companies/${companyId}/audit`).doc(),audit(companyId,request.auth.uid,'invitation.accepted',invitationId));});return {companyId,status:'accepted'};
});
export const disableCompanyMember=onCall(options,async request=>{
 const companyId=await membership(request,['company_admin']);const uid=request.data.uid;if(typeof uid!=='string'||uid.includes('/')||uid===request.auth.uid)throw new HttpsError('invalid-argument','Select another employee');const batch=db.batch();batch.update(db.doc(`companies/${companyId}/members/${uid}`),{active:false,disabledAt:FieldValue.serverTimestamp()});batch.create(db.collection(`companies/${companyId}/audit`).doc(),audit(companyId,request.auth.uid,'membership.disabled',uid));await batch.commit();return {status:'disabled'};
});
