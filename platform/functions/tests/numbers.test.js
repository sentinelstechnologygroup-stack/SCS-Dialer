import {test} from 'node:test';
import assert from 'node:assert/strict';
import {telnyxNumbers} from '../src/numberProvider.js';
test('number search never sends a request while disabled',async()=>{let called=false;await assert.rejects(telnyxNumbers({apiKey:'test',transport:()=>{called=true;}}).search({areaCode:'312'}));assert.equal(called,false);});
test('enabled injected search uses official endpoint and bounded filters',async()=>{let captured;const provider=telnyxNumbers({apiKey:'test-only',enabled:true,transport:async(url,options)=>{captured={url,options};return {ok:true,json:async()=>({data:[]})};}});await provider.search({country:'US',areaCode:'312',limit:5});assert.match(captured.url,/available_phone_numbers/);assert.equal(captured.options.headers.Authorization,'Bearer test-only');assert.throws(()=>provider.search({country:'US',limit:100}));});
