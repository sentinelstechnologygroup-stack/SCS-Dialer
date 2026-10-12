import {URLSearchParams} from 'node:url';
// Server-only Telnyx adapter. Callers must enforce company permissions and
// save search quotes, limits and idempotent order records before enabling it.
export function telnyxNumbers({apiKey,enabled=false,transport=globalThis.fetch}){
 async function request(path,options={}){
  if(!enabled||!apiKey)throw new Error('Live number operations are disabled');
  const response=await transport(`https://api.telnyx.com/v2/${path}`,{...options,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'}});
  if(!response.ok)throw new Error(`Telnyx number operation failed (${response.status})`);
  return response.json();
 }
 return {
  search({country='US',areaCode='',limit=10}){
   if(!/^[A-Z]{2}$/.test(country)||!Number.isInteger(limit)||limit<1||limit>20||!/^\d{0,6}$/.test(areaCode))throw new Error('Invalid number search');
   const params=new URLSearchParams({'filter[country_code]':country,'filter[limit]':String(limit)});if(areaCode)params.set('filter[national_destination_code]',areaCode);
   return request(`available_phone_numbers?${params}`);
  },
  // Deliberately no public order method until quote ownership, spending policy,
  // regulatory requirements and ambiguous-order recovery are tested.
 };
}
