import { demoFailure, reportDemoError, clearDemoError } from "@/lib/demoErrors";

export const DEMO_COMPANIES = Object.freeze([
  Object.freeze({ id: "mdx", label: "MDX Communications" }),
  Object.freeze({ id: "gms", label: "GMS Telecom" }),
]);
const SELECTION_KEY = "scs_demo_workspace_v2";
const listeners = new Set();
const pending = new Set();
let session;
export function captureWorkspace() {
  if (!session) {
    const configured=import.meta.env.VITE_SCS_CUSTOMER_ID||'mdx';
    const id=DEMO_COMPANIES.some(c=>c.id===configured)?configured:'mdx';
    session = Object.freeze({ companyId: id, epoch: 0 });
  }
  return session;
}
export const getCompany = (id = captureWorkspace().companyId) => DEMO_COMPANIES.find((c) => c.id === id);
export const isCurrentWorkspace = (context) => context === captureWorkspace();
export function assertWorkspace(context) {
  if (!isCurrentWorkspace(context)) demoFailure("Workspace changed. The previous action was cancelled; nothing was saved to another company.");
}
export const subscribeWorkspace = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
function changeWorkspace(companyId) {
  const old = captureWorkspace();
  if (old.companyId === companyId) return;
  pending.forEach(clearTimeout); pending.clear();
  clearDemoError();
  session = Object.freeze({ companyId, epoch: old.epoch + 1 });
  listeners.forEach((fn) => fn());
}
export function selectWorkspace(companyId) {
  if (!getCompany(companyId)) demoFailure("Unknown fictional workspace.");
  try { localStorage.setItem(SELECTION_KEY, companyId); }
  catch { demoFailure("Could not save the workspace selection. Enable browser storage and try again."); }
  changeWorkspace(companyId);
}
export function scheduleWorkspaceAction(context, action, delay) {
  assertWorkspace(context);
  const timer = setTimeout(async () => {
    pending.delete(timer);
    if (!isCurrentWorkspace(context)) return;
    try { await action(context); } catch (error) { reportDemoError(error); }
  }, delay);
  pending.add(timer);
  return () => { clearTimeout(timer); pending.delete(timer); };
}
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
  if (event.key === SELECTION_KEY && getCompany(event.newValue)) changeWorkspace(event.newValue);
});