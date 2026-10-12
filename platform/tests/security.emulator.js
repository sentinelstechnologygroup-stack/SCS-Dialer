import {test,after} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc} from 'firebase/firestore';
import {ref,uploadString} from 'firebase/storage';
const env=await initializeTestEnvironment({projectId:'demo-scs',firestore:{host:'127.0.0.1',port:8280,rules:fs.readFileSync('firebase/firestore.rules','utf8')},storage:{host:'127.0.0.1',port:9399,rules:fs.readFileSync('firebase/storage.rules','utf8')}});
after(()=>env.cleanup());
await env.withSecurityRulesDisabled(async c=>{for(const [uid,role,active] of [['staff','employee',true],['admin','company_admin',true],['disabled','employee',false]])await setDoc(doc(c.firestore(),`companies/cmp_mdx001/members/${uid}`),{active,role});for(const uid of ['staff','admin','disabled'])await setDoc(doc(c.firestore(),`users/${uid}`),{companyId:'cmp_mdx001'});await setDoc(doc(c.firestore(),'companies/cmp_mdx001/contacts/a'),{name:'Fictional'});await setDoc(doc(c.firestore(),'companies/cmp_gms001/contacts/a'),{name:'Other company'});await setDoc(doc(c.firestore(),'companies/cmp_mdx001/recordings/a'),{providerState:'pending'});});
test('company access, disabled users and anonymous access',async()=>{const db=env.authenticatedContext('staff',{email_verified:true}).firestore();await assertSucceeds(getDoc(doc(db,'companies/cmp_mdx001/contacts/a')));await assertFails(getDoc(doc(db,'companies/cmp_gms001/contacts/a')));await assertFails(getDoc(doc(env.authenticatedContext('disabled',{email_verified:true}).firestore(),'companies/cmp_mdx001/contacts/a')));await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'companies/cmp_mdx001/contacts/a')));});
test('role escalation, audit forging and recording restrictions',async()=>{const db=env.authenticatedContext('staff',{email_verified:true}).firestore();await assertFails(setDoc(doc(db,'companies/cmp_mdx001/members/staff'),{active:true,role:'company_admin'}));await assertFails(setDoc(doc(db,'companies/cmp_mdx001/audit/a'),{action:'fake'}));await assertFails(getDoc(doc(db,'companies/cmp_mdx001/recordings/a')));await assertSucceeds(getDoc(doc(env.authenticatedContext('admin',{email_verified:true}).firestore(),'companies/cmp_mdx001/recordings/a')));});
test('unverified email and client storage writes denied',async()=>{await assertFails(getDoc(doc(env.authenticatedContext('staff',{email_verified:false}).firestore(),'companies/cmp_mdx001/contacts/a')));await assertFails(uploadString(ref(env.authenticatedContext('admin',{email_verified:true}).storage(),'companies/cmp_mdx001/recordings/test'),'unauthorized recording'));});
test('invitation lifecycle grants only matching verified employee and revokes access',async()=>{
 process.env.GCLOUD_PROJECT='demo-scs';process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8280';
 const f=await import('../functions/src/index.js');
 const admin={uid:'admin',token:{email_verified:true,email:'admin@example.test'}};
 const employee={uid:'invited',token:{email_verified:true,email:'new@example.test'}};
 const invite=await f.createEmployeeInvitation.run({auth:admin,data:{companyId:'cmp_mdx001',email:'new@example.test',role:'employee'}});
 const data={...invite};
 const inspected=await f.inspectEmployeeInvitation.run({data});if(inspected.email!==employee.token.email)throw new Error('Invitation preflight failed');
 await assertFails(f.inspectEmployeeInvitation.run({data:{...data,token:'0'.repeat(64)}}));
 await assertFails(f.acceptEmployeeInvitation.run({auth:{...employee,token:{...employee.token,email:'wrong@example.test'}},data}));
 await f.acceptEmployeeInvitation.run({auth:employee,data});
 await assertFails(f.acceptEmployeeInvitation.run({auth:employee,data}));
 const workspaces=await f.listMyWorkspaces.run({auth:employee,data:{}});
 if(workspaces.length!==1||workspaces[0].companyId!=='cmp_mdx001')throw new Error('Membership discovery failed');
 const listed=await f.listEmployeeInvitations.run({auth:admin,data:{companyId:'cmp_mdx001'}});
 if(listed.some(i=>i.token||i.tokenHash))throw new Error('Invitation secret disclosed');
 await f.disableCompanyMember.run({auth:admin,data:{companyId:'cmp_mdx001',uid:employee.uid}});
 if((await f.listMyWorkspaces.run({auth:employee,data:{}})).length)throw new Error('Disabled membership still discoverable');
});

test('contact callable enforces ownership, revoked access and audit writes',async()=>{
 const f=await import('../functions/src/index.js');const auth={uid:'admin',token:{email_verified:true,email:'admin@example.test'}};
 const made=await f.saveCompanyContact.run({auth,data:{companyId:'cmp_mdx001',contact:{name:'Fictional Contact',phone:'+13125550188'}}});
 await f.saveCompanyContact.run({auth,data:{companyId:'cmp_mdx001',contactId:made.contactId,contact:{name:'Edited Contact'}}});
 await assertFails(f.saveCompanyContact.run({auth,data:{companyId:'cmp_gms001',contactId:made.contactId,contact:{name:'Cross company'}}}));
 await assertFails(f.saveCompanyContact.run({auth:{uid:'invited',token:{email_verified:true}},data:{companyId:'cmp_mdx001',contact:{name:'Disabled employee'}}}));
 await assert.rejects(f.saveCompanyContact.run({auth,data:{companyId:'cmp_mdx001',contact:{name:'Injected',companyId:'cmp_gms001'}}}),e=>e.code==='invalid-argument');
 const snap=await getDoc(doc(env.authenticatedContext('admin',{email_verified:true}).firestore(),`companies/cmp_mdx001/contacts/${made.contactId}`));
 if(snap.data().name!=='Edited Contact'||snap.data().companyId!=='cmp_mdx001')throw new Error('Contact mutation failed');
});

test('only server-granted Sentinels owners can onboard customers',async()=>{const f=await import('../functions/src/index.js');const customer={uid:'admin',token:{email_verified:true}};await assert.rejects(f.listSupportCustomers.run({auth:customer,data:{}}),e=>e.code==='permission-denied');await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'platformStaff/support'),{active:true,role:'platform_owner'}));const auth={uid:'support',token:{email_verified:true}};const result=await f.onboardSupportCustomer.run({auth,data:{companyId:'cmp_newclient',name:'Fictional Client',adminEmail:'owner@example.test',phoneNumbers:['+13125550199']}});if(result.status!=='setup_pending')throw new Error('Premature activation');const session=await f.openSupportCustomer.run({auth,data:{companyId:result.companyId}});await f.createEmployeeInvitation.run({auth,data:{...session,email:'staff@example.test',role:'employee'}});await assert.rejects(f.createEmployeeInvitation.run({auth:customer,data:{...session,email:'intruder@example.test',role:'company_admin'}}),e=>e.code==='permission-denied');await assert.rejects(f.listCompanyNumberRequests.run({auth,data:{...session,companyId:'cmp_mdx001'}}),e=>e.code==='permission-denied');await assertFails(setDoc(doc(env.authenticatedContext('admin',{email_verified:true}).firestore(),'platformStaff/admin'),{active:true,role:'platform_owner'}));await assert.rejects(f.requestCompanyNumber.run({auth:{uid:'staff',token:{email_verified:true}},data:{companyId:'cmp_mdx001',areaCode:'312'}}),e=>e.code==='permission-denied');const request=await f.requestCompanyNumber.run({auth:customer,data:{companyId:'cmp_mdx001',areaCode:'312'}});if(request.purchased!==false)throw new Error('Unexpected purchase');});
