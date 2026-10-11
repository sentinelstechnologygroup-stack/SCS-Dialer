import test from 'node:test';
import assert from 'node:assert/strict';
import {workspacePath, canAccessWorkspace, transitionCall, integrationEvent} from '../src/domain.js';
test('company boundaries reject inactive or other-company memberships and unsafe paths', () => {
  assert.equal(canAccessWorkspace({companyId:'mdx', status:'active'}, 'gms'), false);
  assert.equal(canAccessWorkspace({companyId:'mdx', status:'disabled'}, 'mdx'), false);
  assert.throws(() => workspacePath('../gms','calls','one'));
  assert.equal(workspacePath('mdx','calls','one'), 'companies/mdx/calls/one');
});
test('late connection cannot resurrect a terminated call', () => {
  const ended = transitionCall({status:'ringing'}, 'ended');
  assert.throws(() => transitionCall(ended, 'connected'));
  assert.throws(() => transitionCall({status:'failed'}, 'ringing'));
});
test('integration events retain company context', () => {
  assert.equal(integrationEvent('mdx','call1','answered').companyId,'mdx');
});
