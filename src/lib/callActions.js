// Fictional, local call lifecycle. Every continuation is bound to its starting
// workspace session; switching even away and back cancels old timers/actions.
import { callAdapter, voicemailAdapter } from "@/services/adapters";
import { assertRecordOwnership } from "@/lib/demoStore";
import { captureWorkspace, assertWorkspace, isCurrentWorkspace, scheduleWorkspaceAction } from "@/lib/demoWorkspace";
import { nowIso, secondsBetween } from "@/lib/phoneUtils";
import { pickDemoTranscript } from "@/lib/demoTranscripts";

const active = ["ringing", "connected", "on_hold", "parked"];
const inFlight = new Set();
async function guarded(call, operation) {
  const workspace = captureWorkspace();
  assertRecordOwnership(call, workspace);
  if (inFlight.has(call.id)) return null;
  inFlight.add(call.id);
  try {
    const current = await callAdapter.get(call.id, workspace);
    assertWorkspace(workspace);
    if (!current || !active.includes(current.status)) return null;
    return await operation(workspace, current);
  } finally { inFlight.delete(call.id); }
}
const patch = (call, data, workspace) => callAdapter.update(call.id, data, workspace);
export async function fetchActiveCalls(options = {}) { return callAdapter.listActive(options); }
export async function startOutboundCall({ user, extension, peerNumber, peerName }) {
  const workspace = captureWorkspace();
  assertRecordOwnership(user, workspace);
  if (extension) assertRecordOwnership(extension, workspace);
  const call = await callAdapter.create({
    companyId: workspace.companyId, direction: "outbound", status: "ringing",
    peer_number: peerNumber, peer_name: peerName || "Unknown", assigned_user_id: user.id,
    assigned_user_name: user.full_name, extension_number: extension?.number || user.extension_number,
    started_at: nowIso(), disposition: "completed", simulated: true,
  }, workspace);
  if (!isCurrentWorkspace(workspace)) return call;
  scheduleWorkspaceAction(workspace, async () => {
    const current = await callAdapter.get(call.id, workspace);
    if (!isCurrentWorkspace(workspace) || current?.status !== "ringing") return;
    await patch(current, { status: "connected", started_at: nowIso(), recording: true, recording_started_at: nowIso() }, workspace);
  }, 1800);
  return call;
}
export async function simulateInboundCall({ fromNumber, fromName, toExtension }) {
  const workspace = captureWorkspace(); assertRecordOwnership(toExtension, workspace);
  return callAdapter.create({
    companyId: workspace.companyId, direction: "inbound", status: "ringing", peer_number: fromNumber,
    peer_name: fromName || "Unknown Caller", assigned_user_id: toExtension.assigned_user_id,
    assigned_user_name: toExtension.assigned_user_name, extension_number: toExtension.number,
    started_at: nowIso(), disposition: "completed", simulated: true,
  }, workspace);
}
export async function acceptCall(call) {
  return guarded(call, (workspace, current) => patch(current, { status: "connected", started_at: current.started_at || nowIso(), recording: true, recording_started_at: nowIso() }, workspace));
}
export async function endCall(call) {
  return guarded(call, (workspace, current) => {
    const ended_at = nowIso();
    return patch(current, { status: "ended", ended_at, duration_seconds: secondsBetween(current.started_at || current.created_date, ended_at), conference_participant: null, consulting_with: null,
      ...(current.recording ? pickDemoTranscript(current) : {}) }, workspace);
  });
}
export async function holdCall(call) { return guarded(call, (workspace) => patch(call, { status: "on_hold" }, workspace)); }
export async function resumeCall(call) { return guarded(call, (workspace) => patch(call, { status: "connected" }, workspace)); }
export async function parkCall(call) { return guarded(call, (workspace) => patch(call, { status: "parked", parked_at: nowIso() }, workspace)); }
export async function retrieveCall(call) { return guarded(call, (workspace) => patch(call, { status: "connected", parked_at: null }, workspace)); }
function transferPatch(extension) {
  return { assigned_user_id: extension.assigned_user_id, assigned_user_name: extension.assigned_user_name, extension_number: extension.number, status: "ringing", transferred_to: extension.number, disposition: "transferred", consulting_with: null };
}
export async function transferCall(call, extension) {
  return guarded(call, (workspace) => { assertRecordOwnership(extension, workspace); return patch(call, transferPatch(extension), workspace); });
}
export async function conferenceCall(call, extension) {
  return guarded(call, (workspace) => { assertRecordOwnership(extension, workspace); return patch(call, { conference_participant: extension.assigned_user_name || extension.label, status: "connected" }, workspace); });
}
export async function consultTransfer(call, extension) {
  return guarded(call, async (workspace) => {
    assertRecordOwnership(extension, workspace);
    await patch(call, { consulting_with: extension.assigned_user_name || extension.label }, workspace);
    if (!isCurrentWorkspace(workspace)) return;
    scheduleWorkspaceAction(workspace, async () => {
      const current = await callAdapter.get(call.id, workspace);
      if (!isCurrentWorkspace(workspace) || !current?.consulting_with || !active.includes(current.status)) return;
      await patch(current, transferPatch(extension), workspace);
    }, 2500);
  });
}
export async function declineCall(call, { leaveVoicemail = false } = {}) {
  return guarded(call, async (workspace, current) => {
    if (leaveVoicemail) {
      await voicemailAdapter.create({ companyId: workspace.companyId, from_number: current.peer_number, from_name: current.peer_name,
        assigned_user_id: current.assigned_user_id, assigned_user_name: current.assigned_user_name, extension_number: current.extension_number,
        duration_seconds: 12, received_at: nowIso(), transcript: "[DEMO — fictional voicemail transcript. No real audio was recorded.] The caller requested a callback.", listened: false, simulated: true }, workspace);
    }
    return patch(current, { status: leaveVoicemail ? "voicemail" : "missed", ended_at: nowIso(), disposition: leaveVoicemail ? "voicemail" : "missed", consulting_with: null }, workspace);
  });
}