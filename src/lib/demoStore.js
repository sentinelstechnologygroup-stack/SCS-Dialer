// Fictional, browser-local records only. Legacy global keys are deliberately
// retained untouched: records without reliable ownership are not auto-migrated.
import { assertWorkspace, captureWorkspace, subscribeWorkspace } from "@/lib/demoWorkspace";
import { demoFailure } from "@/lib/demoErrors";

const PREFIX = "scs_demo_v2:";
const listeners = new Map();
const recordSessions = new WeakMap();
export const collectionKey = (name, context = captureWorkspace()) => `${PREFIX}${context.companyId}:${name}`;
const uid = () => crypto.randomUUID();
function readRaw(name, context) {
  assertWorkspace(context);
  try { return localStorage.getItem(collectionKey(name, context)); }
  catch { demoFailure("Demo storage could not be read. Enable browser storage and retry; existing data was not replaced."); }
}
function own(record, context, allowNew = false) {
  assertWorkspace(context);
  if (record && recordSessions.has(record) && recordSessions.get(record) !== context) demoFailure("This record came from an expired workspace session. The action was cancelled.");
  if (!record || typeof record !== "object" || Array.isArray(record)) demoFailure("Invalid demo record; existing data was not replaced.");
  if (record.companyId !== undefined && record.companyId !== context.companyId) demoFailure("A record belongs to another company. The action was blocked.");
  if (!allowNew && record.companyId !== context.companyId) demoFailure("Demo record ownership is missing; existing data was not replaced.");
  if (record.id && !String(record.id).startsWith(`${context.companyId}:`)) demoFailure("A record identifier belongs to another workspace. The action was blocked.");
  for (const field of ["assigned_user_id", "channel_id"]) {
    if (record[field] && !String(record[field]).startsWith(`${context.companyId}:`)) demoFailure("A linked record belongs to another workspace. The action was blocked.");
  }
  const owned = { ...record, companyId: context.companyId, id: record.id || `${context.companyId}:${uid()}` };
  recordSessions.set(owned, context);
  return owned;
}
export function assertRecordOwnership(record, context = captureWorkspace()) { assertWorkspace(context); own(record, context); }
export function loadCollection(name, context = captureWorkspace()) {
  const raw = readRaw(name, context);
  if (raw === null) return [];
  let items;
  try { items = JSON.parse(raw); } catch { demoFailure("Saved demo data could not be read. Existing data was retained; it was not reseeded."); }
  if (!Array.isArray(items)) demoFailure("Saved demo data is invalid. Existing data was retained.");
  return items.map((record) => own(record, context));
}
export function saveCollection(name, items, context = captureWorkspace()) {
  assertWorkspace(context);
  const previous = loadCollection(name, context);
  const records = items.map((record) => own(record, context, true));
  if (new Set(records.map((r) => r.id)).size !== records.length) demoFailure("Duplicate demo identifiers. Nothing was saved.");
  for (const record of records) {
    const old = previous.find((r) => r.id === record.id);
    if (old && old.companyId !== record.companyId) demoFailure("Company ownership cannot be changed.");
  }
  try { localStorage.setItem(collectionKey(name, context), JSON.stringify(records)); }
  catch { demoFailure("Demo changes could not be saved. Browser storage may be full or disabled; your previous data is unchanged."); }
  emit(collectionKey(name, context), records);
  return records;
}
export function ensureSeeded(name, seedFn = () => [], context = captureWorkspace()) {
  // [] is an intentional saved collection, not a signal to repopulate it.
  if (readRaw(name, context) !== null) return loadCollection(name, context);
  return saveCollection(name, seedFn(context.companyId), context);
}
export function subscribeCollection(name, fn, context = captureWorkspace()) {
  assertWorkspace(context);
  const key = collectionKey(name, context);
  if (!listeners.has(key)) listeners.set(key, new Set());
  const set = listeners.get(key); set.add(fn);
  return () => { set.delete(fn); if (!set.size && listeners.get(key) === set) listeners.delete(key); };
}
function emit(key, items) { listeners.get(key)?.forEach((fn) => fn(items)); }
subscribeWorkspace(() => listeners.clear());
export function insertItem(name, item, context = captureWorkspace()) {
  const record = own({ ...item, created_date: item.created_date || new Date().toISOString() }, context, true);
  saveCollection(name, [record, ...loadCollection(name, context)], context);
  return record;
}
export function updateItem(name, id, patch, context = captureWorkspace()) {
  const items = loadCollection(name, context); const index = items.findIndex((r) => r.id === id);
  if (index < 0) demoFailure("The demo record is no longer in this workspace. Nothing was saved.");
  if ((patch.id !== undefined && patch.id !== id) || (patch.companyId !== undefined && patch.companyId !== items[index].companyId)) demoFailure("Record identity and company ownership are immutable.");
  items[index] = own({ ...items[index], ...patch, updated_date: new Date().toISOString() }, context);
  saveCollection(name, items, context); return items[index];
}
export function removeItem(name, id, context = captureWorkspace()) {
  const items = loadCollection(name, context);
  if (!items.some((r) => r.id === id)) demoFailure("The demo record is not in this workspace. Nothing was deleted.");
  saveCollection(name, items.filter((r) => r.id !== id), context);
}
export const replaceAll = saveCollection;
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
  const context = captureWorkspace();
  if (!event.key?.startsWith(`${PREFIX}${context.companyId}:`)) return;
  const name = event.key.slice(`${PREFIX}${context.companyId}:`.length);
  emit(event.key, loadCollection(name, context));
});