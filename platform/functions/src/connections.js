import {createHash} from 'node:crypto';
import {FieldValue} from 'firebase-admin/firestore';
import {integrationEnvelope,reduceCallState,verifyProviderWebhook} from './providerEvents.js';

const key=value=>createHash('sha256').update(value).digest('hex');
// Only server-provisioned connection mappings determine tenant ownership.
// No provider operation or Atlas delivery is executed by this ingestion layer.
export async function ingestTelnyxEvent(db,rawBody,headers,verifier){
 const event=await verifyProviderWebhook(rawBody,headers,verifier);
 const data=event.data,payload=data.payload;
 if(typeof payload?.connection_id!=='string'||typeof payload?.call_control_id!=='string'||!Number.isFinite(Date.parse(data.occurred_at)))throw new Error('Unsupported or malformed call event');
 const mapping=await db.doc(`providerConnections/${key(payload.connection_id)}`).get();const config=mapping.data();
 if(!config?.enabled||!/^cmp_[a-zA-Z0-9_-]+$/.test(config.companyId)||typeof config.assignedUserId!=='string'||!config.assignedUserId)throw new Error('Provider connection is not assigned');
 const c=config.companyId,id=key(payload.call_control_id),eventRef=db.doc(`providerEvents/${key(data.id)}`),callRef=db.doc(`companies/${c}/calls/${id}`);
 return db.runTransaction(async tx=>{const seen=await tx.get(eventRef);if(seen.exists)return {duplicate:true};const current=await tx.get(callRef);const next=reduceCallState(current.data(),{type:data.event_type,occurredAt:data.occurred_at});
 tx.create(eventRef,{companyId:c,type:data.event_type,receivedAt:FieldValue.serverTimestamp()});
 if(next){tx.set(callRef,{...next,companyId:c,assignedUserId:config.assignedUserId});if(next.status==='ended'&&current.data()?.status!=='ended'){const envelope=integrationEnvelope({companyId:c,eventId:data.id,type:'call.completed',resourceId:id,occurredAt:data.occurred_at});tx.create(db.doc(`companies/${c}/integrationOutbox/${key(data.id)}`),{...envelope,status:'blocked',reason:'Atlas delivery disabled pending configuration and acceptance',createdAt:FieldValue.serverTimestamp()});}}
 return {duplicate:false,companyId:c};});
}

export function providerOperationGate(){throw new Error('Live provider operations are disabled pending Firebase project selection and acceptance');}
