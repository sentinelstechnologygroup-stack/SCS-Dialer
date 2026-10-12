// Fictional MDX/GMS company-scoped seed data for the SCS Dialer demo.
// All names, numbers, channels, and content are invented for demonstration;
// none represent real people, organizations, or services.

import { captureWorkspace, getCompany } from "@/lib/demoWorkspace";
import { companyPeople } from "@/lib/demoDirectoryFixtures";

function scoped(items, companyId) {
  return items.map((item) => ({ ...item, id: `${companyId}:${item.id || uid()}`, companyId, simulated: true }));
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function iso(daysAgo, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ── Favorites (speed-dial pins) ──────────────────────────────────────────
export function seedFavorites(companyId = captureWorkspace().companyId) {
  const company = getCompany(companyId).label;
  const roles = companyId === "gms" ? ["Field Ops Lead", "Dispatch"] : ["Network Engineer", "Account Manager"];
  return scoped([...companyPeople(companyId).map((p, i) => ({ name: p.name, number: p.phone, company, role: roles[i], color: i ? "#14b8a6" : "#6366f1", order: i + 1 })),
    { name: "Voicemail Box", number: "*86", role: "Voicemail", company, color: "#64748b", order: 3 }], companyId);
}

// ── Team Chat channels ───────────────────────────────────────────────────
export function seedTeamChannels(companyId = captureWorkspace().companyId) {
  const special = companyId === "gms" ? "field-ops" : "network-eng";
  return scoped([
    { id: "channel:general", name: "general", type: "channel", description: `${getCompany(companyId).label} company-wide chatter`, members: 3, unread: 2, last_activity: iso(0, 14) },
    { id: `channel:${special}`, name: special, type: "channel", description: companyId === "gms" ? "GMS field operations" : "MDX network engineering", members: 3, unread: 1, last_activity: iso(0, 11) },
    { id: "channel:billing-support", name: "billing-support", type: "channel", description: "Billing & invoicing", members: 3, unread: 0, last_activity: iso(2, 15) },
    { id: "channel:leadership", name: "leadership", type: "group", description: "Leads and managers", members: 3, unread: 0, last_activity: iso(1, 16) },
  ], companyId);
}

export function seedTeamMessages(companyId = captureWorkspace().companyId) {
  const people = companyPeople(companyId); const code = companyId.toUpperCase();
  return scoped([
    { channel_id: `${companyId}:channel:general`, author: people[0].name, body: `Morning team, ${code} standup notes are in the doc.`, at: iso(0, 9), reactions: ["👍"] },
    { channel_id: `${companyId}:channel:general`, author: people[1].name, body: `Thanks! I'll review the ${code} tickets after standup.`, at: iso(0, 14), reactions: [] },
    { channel_id: `${companyId}:channel:${companyId === "gms" ? "field-ops" : "network-eng"}`, author: people[0].name, body: `${code} maintenance window is confirmed for tonight.`, at: iso(1, 10), reactions: [] },
  ], companyId);
}

// ── Fax inbox ─────────────────────────────────────────────────────────────
export function seedFaxInbox(companyId = captureWorkspace().companyId) {
  const code = companyId.toUpperCase();
  return scoped([
    { direction: "inbound", from_name: `${code} Procurement`, from_number: companyId === "gms" ? "+1 (415) 555-0301" : "+1 (415) 555-0302", subject: `Purchase Order #${code}-2231`, pages: 3, received_at: iso(0, 10), status: "unread", preview: "Please find attached purchase order for Q4 network hardware…" },
    { direction: "inbound", from_name: `${code} Legal`, from_number: "+1 (415) 555-0303", subject: "Contract Amendment", pages: 7, received_at: iso(1, 13), status: "read", preview: "Enclosed is the amended service agreement for review and signature…" },
    { direction: "outbound", from_name: "You", from_number: companyId === "mdx" ? "+1 (415) 555-0100" : "+1 (415) 555-0200", subject: `Service Quote — ${code}-77832`, pages: 2, received_at: iso(2, 9), status: "sent", preview: "Quote for conferencing services as requested…" },
  ], companyId);
}

// ── Meetings ──────────────────────────────────────────────────────────────
export function seedMeetings(companyId = captureWorkspace().companyId) {
  const people = companyPeople(companyId).map((p) => p.name);
  return scoped([
    { title: companyId === "gms" ? "GMS Field Ops Standup" : "MDX Network Review", type: "scheduled", starts_at: iso(0, 9), duration_minutes: 30, room: "Room A", room_id: `${companyId}-standup`, participants: [...people, "You"], status: "upcoming" },
    { title: "Weekly Leadership Sync", type: "permanent", starts_at: null, duration_minutes: 45, room: "Permanent Room", room_id: `${companyId}-leadership-sync`, participants: [...people, "You"], status: "permanent" },
    { title: "Billing Q&A", type: "recent", starts_at: iso(2, 11), duration_minutes: 30, room: "Room C", room_id: `${companyId}-billing-qa`, participants: [people[1], "You"], status: "ended" },
  ], companyId);
}

// ── Integrations (modeled, not connected) ─────────────────────────────────
// No integration is actually connected in the prototype. Statuses reflect
// that honestly: "not_connected" (no link established) or "planned" (on the
// roadmap but not yet wired). Never "Linked" or "Available".
export function seedIntegrations(companyId = captureWorkspace().companyId) {
  return scoped([
    { id: uid(), name: "Telnyx Voice & SMS", category: "Telephony", stack: "Telnyx", status: "planned", description: "Live calling, SMS, and fax. Planned for production; no live calls are placed in the prototype." },
    { id: uid(), name: "Firebase Firestore", category: "Sync", stack: "Firebase Firestore", status: "planned", description: "Presence, messages, and call state sync. Local demo persistence is in use until Firestore is wired." },
    { id: uid(), name: "Google Calendar", category: "Calendar", stack: "Google Calendar", status: "not_connected", description: "Meeting scheduling and reminders. Not connected." },
    { id: uid(), name: "Slack", category: "Messaging", stack: "Slack", status: "not_connected", description: "Team notifications and alert routing. Not connected." },
    { id: uid(), name: "SCS Admin Console", category: "Management", stack: "React / Firebase", status: "not_connected", description: "Standalone SCS administration console. Integration is pending." },
  ], companyId);
}

// ── Voicemail greetings ───────────────────────────────────────────────────
export function seedVoicemailGreeting(companyId = captureWorkspace().companyId) {
  return {
    text: `You've reached the ${getCompany(companyId).label} demo voicemail. Please leave a message after the tone. (This is a fictional greeting — no real mailbox exists.)`,
    enabled: true,
  };
}