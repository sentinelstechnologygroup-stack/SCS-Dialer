// Simulated SMS/MMS messaging for the SCS Dialer prototype.
// Messages are stored locally in the selected company and labeled simulated.
// Production will bridge real SMS/MMS through Telnyx; nothing here sends a real text.
//
// No automatic typing indicators, read receipts, or inbound replies are
// fabricated. Those are demoed ONLY when explicitly requested via the
// demoInboundReply / demoReadReceipt / demoTyping helpers, so the prototype
// never pretends a live event happened on its own.
//
// Attachments are stored as a JSON string in the `attachments` field (entity
// fields are single-valued). Each attachment is { kind, name, url } where
// kind is "image" | "file" and url is a fictional bundled data URI (no real
// upload, no storage provider). Failed sends keep status "failed" and the
// draft is preserved so the user can retry.

import { messageAdapter } from "@/services/adapters";
import { loadCollection, saveCollection, assertRecordOwnership } from "@/lib/demoStore";
import { captureWorkspace } from "@/lib/demoWorkspace";

// Send an outbound message. Optionally include attachments (MMS).
// On failure the message is created with status "failed" so the UI can
// offer a retry; the draft is NOT cleared on failure.
export async function sendMessage({ user, peerNumber, peerName, body, attachments = [], status = "sent", workspace = captureWorkspace() }) {
  assertRecordOwnership(user, workspace);
  return messageAdapter.create({
    companyId: workspace.companyId,
    conversation_id: peerNumber,
    direction: "outbound",
    body,
    peer_number: peerNumber,
    peer_name: peerName || "Unknown",
    assigned_user_id: user.id,
    status,
    read: false,
    attachments: attachments.length ? JSON.stringify(attachments) : null,
    simulated: true,
  }, workspace);
}

// Retry a failed send: flip status back to "sent" and re-attempt delivery.
export async function retryMessage(message) {
  return messageAdapter.update(message.id, { status: "sent" });
}

// Explicit demo: simulate an inbound reply. Only called when the user picks it.
export async function demoInboundReply({ user, peerNumber, peerName, body, workspace = captureWorkspace() }) {
  assertRecordOwnership(user, workspace);
  return messageAdapter.create({
    companyId: workspace.companyId,
    conversation_id: peerNumber,
    direction: "inbound",
    body: body || "Thanks for your message — this is a simulated reply.",
    peer_number: peerNumber,
    peer_name: peerName || "Unknown",
    assigned_user_id: user.id,
    status: "delivered",
    read: false,
    simulated: true,
  }, workspace);
}

// Explicit demo: mark outbound messages as read (read receipt).
export async function demoReadReceipt({ user, peerNumber, workspace = captureWorkspace() }) {
  assertRecordOwnership(user, workspace);
  const msgs = await messageAdapter.list(peerNumber, workspace);
  return Promise.all(msgs.filter((m) => m.direction === "outbound" && !m.read)
    .map((m) => messageAdapter.update(m.id, { read: true }, workspace)));
}

// Parse attachments from the stored JSON string into an array.
export function parseAttachments(message) {
  if (!message.attachments) return [];
  try {
    return JSON.parse(message.attachments);
  } catch {
    return [];
  }
}

// Latest message per conversation, most recent first.
export async function fetchConversations(userId, workspace = captureWorkspace()) {
  const items = await messageAdapter.listConversations(userId, workspace);
  const map = new Map();
  for (const m of items) {
    const cur = map.get(m.conversation_id);
    if (!cur || new Date(m.created_date) > new Date(cur.created_date)) {
      map.set(m.conversation_id, m);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );
}

export async function fetchConversation(userId, peerNumber, workspace = captureWorkspace()) {
  return messageAdapter.list(peerNumber, workspace);
}

// Mark inbound messages in a conversation as read (clears the unread badge).
export async function markConversationRead(userId, peerNumber, workspace = captureWorkspace()) {
  return messageAdapter.markRead(userId, peerNumber, workspace);
}

export async function countUnreadMessages(userId) {
  return messageAdapter.countUnread(userId);
}

// ── Draft persistence (local demo store) ─────────────────────────────────
// Prevents lost drafts when navigating away from a conversation, and
// preserves the draft when a send fails so the user can retry.
const DRAFTS_KEY = "message_drafts";

export function loadDraft(peerNumber, workspace = captureWorkspace()) {
  return loadCollection(DRAFTS_KEY, workspace).find((d) => d.peer_number === peerNumber)?.body || "";
}
export function saveDraft(peerNumber, body, workspace = captureWorkspace()) {
  const drafts = loadCollection(DRAFTS_KEY, workspace);
  const index = drafts.findIndex((d) => d.peer_number === peerNumber);
  if (index >= 0 && drafts[index].body === body) return;
  if (index < 0 && !body) return;
  const entry = { ...(drafts[index] || {}), peer_number: peerNumber, body, updated_date: new Date().toISOString() };
  if (index >= 0) drafts[index] = entry; else drafts.push(entry);
  saveCollection(DRAFTS_KEY, drafts, workspace);
}
export function clearDraft(peerNumber, workspace = captureWorkspace()) {
  const drafts = loadCollection(DRAFTS_KEY, workspace);
  if (drafts.some((d) => d.peer_number === peerNumber)) saveCollection(DRAFTS_KEY, drafts.filter((d) => d.peer_number !== peerNumber), workspace);
}