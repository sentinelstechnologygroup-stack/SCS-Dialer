let message = "";
const listeners = new Set();
export const subscribeDemoErrors = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const getDemoError = () => message;
export function reportDemoError(error) {
  message = error?.message || String(error);
  listeners.forEach((fn) => fn());
  return error instanceof Error ? error : new Error(message);
}
export function clearDemoError() { message = ""; listeners.forEach((fn) => fn()); }
export function demoFailure(message) { throw reportDemoError(new Error(message)); }