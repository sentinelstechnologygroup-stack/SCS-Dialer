import {test} from 'node:test';import assert from 'node:assert/strict';import {authorizeMember,validateInvite,validateCompany,validateContact} from '../src/authorization.js';
const auth={uid:'employee',token:{email_verified:true}};
test('unverified, disabled and insufficient role denied',()=>{assert.throws(()=>authorizeMember({...auth,token:{}},{active:true}));assert.throws(()=>authorizeMember(auth,{active:false,role:'company_admin'}));assert.throws(()=>authorizeMember(auth,{active:true,role:'employee'},['company_admin']));});
test('authorized admin and valid invite accepted',()=>{assert.equal(authorizeMember(auth,{active:true,role:'company_admin'},['company_admin']),'employee');assert.deepEqual(validateInvite({email:'Employee@company.example',role:'employee'}),{email:'employee@company.example',role:'employee'});});
test('invalid paths and privilege roles denied',()=>{assert.throws(()=>validateCompany('cmp_a/b'));assert.throws(()=>validateInvite({email:'a@b.example',role:'platform_owner'}));});

test('contact fields reject ownership injection and invalid international phone',()=>{assert.throws(()=>validateContact({name:'Alice',companyId:'cmp_other'}));assert.throws(()=>validateContact({name:'Alice',phone:'555-0123'}));assert.deepEqual(validateContact({name:' Alice ',email:'A@Example.test',phone:'+13125550188'}),{name:'Alice',email:'a@example.test',phone:'+13125550188'});});
