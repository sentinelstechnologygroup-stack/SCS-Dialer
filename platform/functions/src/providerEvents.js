// Contract matches Telnyx's documented Node SDK webhooks.unwrap(rawBody,{headers}).
// Inject an SDK client configured with server-only secrets. Never unsafeUnwrap.
export function verifyProviderWebhook(rawBody,headers,client,now=Date.now()) {
 const timestamp=Number(headers['telnyx-timestamp']);
 if(!Number.isInteger(timestamp)||Math.abs(now/1000-timestamp)>300)throw new Error('Webhook timestamp outside replay window');
 if(typeof rawBody!=='string'||!client?.webhooks?.unwrap)throw new Error('Raw body and signature verifier required');
 const event=client.webhooks.unwrap(rawBody,{headers});
 if(!event?.data?.id||!event.data.event_type)throw new Error('Invalid provider event envelope');
 return event;
}
export function reduceCallState(current,event){
 const terminal=new Set(['ended','missed','voicemail','failed']);
 if(current && terminal.has(current.status))return current;
 if(current?.lastOccurredAt && event.occurredAt<=current.lastOccurredAt)return current;
 const next={'call.initiated':'ringing','call.answered':'connected','call.hangup':'ended'}[event.type];
 if(!next)return current;
 return {...current,status:next,lastOccurredAt:event.occurredAt};
}
export function integrationEnvelope({companyId,eventId,type,resourceId,occurredAt}){
 if(!/^cmp_[a-zA-Z0-9_-]+$/.test(companyId)||typeof eventId!=='string'||!eventId||typeof resourceId!=='string'||!resourceId||!Number.isFinite(Date.parse(occurredAt)))throw new Error('Invalid integration event');
 if(!['call.completed','voicemail.received','message.updated','contact.updated'].includes(type))throw new Error('Unsupported integration event');
 // No raw recording URL, transcript, private contact or provider payload is sent by default.
 return {schemaVersion:1,companyId,eventId,type,resourceId,occurredAt};
}
