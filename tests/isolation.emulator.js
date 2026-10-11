import test from 'node:test';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment, assertFails, assertSucceeds} from '@firebase/rules-unit-testing';
import {doc, getDoc, setDoc} from 'firebase/firestore';
test('Firestore enforces company boundaries and forbids self-provisioning', async () => {
  const env = await initializeTestEnvironment({projectId:'demo-sentinels-phone', firestore:{host:'127.0.0.1',port:8280,rules:readFileSync('firebase/firestore.rules','utf8')}});
  try {
    await env.withSecurityRulesDisabled(async context => {
      const db=context.firestore();
      await setDoc(doc(db,'companies/mdx'),{name:'MDX'});
      await setDoc(doc(db,'companies/gms'),{name:'GMS'});
      await setDoc(doc(db,'companies/mdx/members/employee'),{status:'active'});
      await setDoc(doc(db,'companies/mdx/members/disabled'),{status:'disabled'});
      await setDoc(doc(db,'companies/mdx/calls/one'),{assignedUid:'employee'});
      await setDoc(doc(db,'companies/mdx/calls/other'),{assignedUid:'other'});
    });
    const db=env.authenticatedContext('employee').firestore();
    await assertSucceeds(getDoc(doc(db,'companies/mdx')));
    await assertSucceeds(getDoc(doc(db,'companies/mdx/calls/one')));
    await assertFails(getDoc(doc(db,'companies/gms')));
    await assertFails(getDoc(doc(db,'companies/mdx/calls/other')));
    await assertFails(setDoc(doc(db,'companies/gms/members/employee'),{status:'active'}));
    await assertFails(setDoc(doc(db,'companies/mdx/members/employee'),{status:'active',role:'admin'}));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'companies/mdx')));
    await assertFails(getDoc(doc(env.authenticatedContext('disabled').firestore(),'companies/mdx')));
  } finally {await env.cleanup();}
});
