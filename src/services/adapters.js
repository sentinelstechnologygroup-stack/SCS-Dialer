// All prototype adapters are browser-local and share the selected fictional
// company workspace. Backend resources are retained but never used here.
import localEntity from "@/services/localEntity";
import { seedStaff, seedExtensions, seedContacts, seedDepartments, seedRouting } from "@/lib/demoDirectoryFixtures";
import { captureWorkspace } from "@/lib/demoWorkspace";

export const demoEntities = {
  CallLog: localEntity("calls"), Voicemail: localEntity("voicemails"), Message: localEntity("messages"),
  Contact: localEntity("contacts", seedContacts), Extension: localEntity("extensions", seedExtensions),
  User: localEntity("staff", seedStaff), Department: localEntity("departments", seedDepartments), RoutingRule: localEntity("routing", seedRouting),
};
const active = ["ringing", "connected", "on_hold", "parked"];
const recent = ["ended", "missed", "voicemail"];
const pageItems = (promise) => promise.then((page) => page.items);
const assigned = (userId) => userId ? { assigned_user_id: userId } : {};
const calls = demoEntities.CallLog; const messages = demoEntities.Message; const voicemails = demoEntities.Voicemail;
export const callAdapter = {
  listActive: ({ all = false, userId } = {}, context = captureWorkspace()) => pageItems(calls.filter({ status: { $in: active }, ...(!all ? assigned(userId) : {}) }, { sort: "-started_at", limit: 50 }, context)),
  listRecent: ({ userId, limit = 50, direction } = {}, context = captureWorkspace()) => pageItems(calls.filter({ status: direction === "voicemail" ? "voicemail" : { $in: recent }, ...assigned(userId), ...(direction && direction !== "all" && direction !== "voicemail" ? { direction } : {}) }, { sort: "-started_at", limit }, context)),
  listParked: ({ userId } = {}, context = captureWorkspace()) => pageItems(calls.filter({ status: "parked", ...assigned(userId) }, { sort: "-parked_at", limit: 50 }, context)),
  countMissed: (userId, context) => calls.count({ ...assigned(userId), status: "missed" }, context),
  get: calls.get, create: calls.create, update: calls.update, subscribe: calls.subscribe,
};
export const voicemailAdapter = {
  list: ({ userId, limit = 50 } = {}, context = captureWorkspace()) => pageItems(voicemails.filter(assigned(userId), { sort: "-received_at", limit }, context)),
  countUnread: (userId, context) => voicemails.count({ ...assigned(userId), listened: { $ne: true } }, context),
  create: voicemails.create, update: voicemails.update, remove: voicemails.delete, subscribe: voicemails.subscribe,
};
export const messageAdapter = {
  list: (peer, context = captureWorkspace()) => pageItems(messages.filter({ conversation_id: peer }, { sort: "created_date", limit: 200 }, context)),
  listConversations: (userId, context = captureWorkspace()) => pageItems(messages.filter(assigned(userId), { sort: "-created_date", limit: 200 }, context)),
  countUnread: (userId, context) => messages.count({ ...assigned(userId), direction: "inbound", read: { $ne: true } }, context),
  create: messages.create, update: messages.update, remove: messages.delete,
  markRead: (userId, peer, context) => messages.updateMany({ ...assigned(userId), conversation_id: peer, direction: "inbound", read: { $ne: true } }, { $set: { read: true } }, context),
  subscribe: messages.subscribe,
};
export const contactAdapter = {
  list: ({ query = {}, limit = 200 } = {}, context = captureWorkspace()) => pageItems(demoEntities.Contact.filter(query, { sort: "name", limit }, context)),
  create: demoEntities.Contact.create, bulkCreate: demoEntities.Contact.bulkCreate, update: demoEntities.Contact.update, remove: demoEntities.Contact.delete,
};
export const extensionAdapter = {
  list: (context = captureWorkspace()) => pageItems(demoEntities.Extension.filter({}, { sort: "number", limit: 100 }, context)),
  forUser: (id, context = captureWorkspace()) => demoEntities.Extension.filter({ assigned_user_id: id }, { limit: 1 }, context).then((p) => p.items[0] || null),
  byNumber: (number, context = captureWorkspace()) => demoEntities.Extension.filter({ number }, { limit: 1 }, context).then((p) => p.items[0] || null),
};
export const staffAdapter = demoEntities.User;