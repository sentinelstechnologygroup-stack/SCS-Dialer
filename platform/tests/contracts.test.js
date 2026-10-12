import {test} from 'node:test';import assert from 'node:assert/strict';import {companyId,requireActive,canAdmin} from '../src/contracts.js';
test('canonical IDs align both models and reject invalid paths',()=>{assert.equal(companyId('mdx'),'cmp_mdx001');assert.equal(companyId('gms'),'cmp_gms001');assert.throws(()=>companyId('../other'));});
test('disabled members and employee admin escalation fail',()=>{assert.throws(()=>requireActive({active:false,role:'company_admin'}));assert.equal(canAdmin({active:true,role:'employee'}),false);});
