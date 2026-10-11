export const PRODUCT_OWNER = 'Sentinels Technology Group';
const idPattern = /^[a-zA-Z0-9_-]{1,128}$/;
export function workspacePath(companyId, collection, recordId) {
  if (![companyId, collection, recordId].every(value => idPattern.test(value || ''))) throw new Error('Invalid workspace path');
  return `companies/${companyId}/${collection}/${recordId}`;
}
export function canAccessWorkspace(membership, companyId) {
  return membership?.companyId === companyId && membership?.status === 'active';
}
const transitions = {
  idle: ['ringing'], ringing: ['connected', 'ended', 'failed'],
  connected: ['held', 'ended', 'failed'], held: ['connected', 'ended', 'failed'], ended: [], failed: [],
};
export function transitionCall(call, next) {
  if (!transitions[call.status]?.includes(next)) throw new Error(`Cannot change ${call.status} to ${next}`);
  return {...call, status: next};
}
// Integrations reference records; each adapter must independently authorize its company.
export function integrationEvent(companyId, callId, outcome) {
  workspacePath(companyId, 'calls', callId);
  return {version: 1, type: 'phone.call.completed', companyId, callId, outcome};
}
