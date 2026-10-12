import { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Pause, Play, Grid3x3, Volume2, ArrowRightLeft, X, MoreHorizontal, Users, PhoneCall, PhoneIncoming, Square } from "lucide-react";
import { extensionAdapter } from "@/services/adapters";
import { formatPhone, formatDuration } from "@/lib/phoneUtils";
import { endCall, holdCall, resumeCall, transferCall, conferenceCall, consultTransfer, parkCall, retrieveCall, acceptCall, declineCall } from "@/lib/callActions";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import AudioDevicePicker from "@/components/dialer/AudioDevicePicker";
import WorkspaceSelector from "@/components/workspace/WorkspaceSelector";

// Full-screen in-call experience. Handles the connected/on-hold call plus
// call waiting, conference, consult transfer, park, and retrieve. The End
// button is always reachable — never hidden behind a submenu.
export default function ActiveCallScreen({ call, calls = [], onEnded }) {
  const [muted, setMuted] = useState(false);
  const [keypad, setKeypad] = useState("");
  const [panel, setPanel] = useState(null); // null | "transfer" | "conference" | "consult" | "keypad" | "audio" | "more"
  const [audioOutput, setAudioOutput] = useState("speaker");
  const [extensions, setExtensions] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const onHold = call.status === "on_hold";
  const parked = call.status === "parked";

  // Other active calls: call waiting (ringing) and parked calls to retrieve.
  const waitingCall = calls.find((c) => c.id !== call.id && c.status === "ringing");
  const parkedCalls = calls.filter((c) => c.id !== call.id && c.status === "parked");

  useEffect(() => {
    const start = call.started_at ? new Date(call.started_at).getTime() : Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [call.id, call.started_at]);

  useEffect(() => {
    extensionAdapter
      .list()
      .then((items) => setExtensions(items.filter((e) => e.assigned_user_id && e.assigned_user_id !== call.assigned_user_id)))
      .catch(() => {});
  }, [call.id]);

  const handleEnd = async () => { await endCall(call); onEnded?.(); };
  const handleHold = async () => { await holdCall(call); };
  const handleResume = async () => { await resumeCall(call); };
  const handleTransfer = async (ext) => { await transferCall(call, ext); onEnded?.(); };
  const handleConference = async (ext) => { await conferenceCall(call, ext); setPanel(null); };
  const handleConsult = async (ext) => { await consultTransfer(call, ext); setPanel(null); };
  const handlePark = async () => { await parkCall(call); onEnded?.(); };
  const handleRetrieve = async (c) => { await retrieveCall(c); };

  // Call waiting: accept puts the current call on hold, decline misses it.
  const handleAcceptWaiting = async () => { await holdCall(call); await acceptCall(waitingCall); };
  const handleDeclineWaiting = async () => { await declineCall(waitingCall, { leaveVoicemail: false }); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <div className="flex items-center gap-3"><SimulatedBadge /><WorkspaceSelector /></div>
        <div className="flex items-center gap-2">
          {call.recording && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> Rec
            </span>
          )}
          {call.conference_participant && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-200">
              <Users className="h-3 w-3" /> Conf: {call.conference_participant}
            </span>
          )}
          <span className="text-sm text-zinc-400">{onHold ? "On hold" : parked ? "Parked" : "Connected"}</span>
        </div>
      </div>

      {/* Call waiting banner */}
      {waitingCall && (
        <div className="mx-4 mt-4 flex items-center justify-between rounded-xl bg-amber-500/15 px-4 py-3 ring-1 ring-amber-400/30">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-sm font-medium text-amber-100">Call waiting</p>
              <p className="text-xs text-amber-200/70">{waitingCall.peer_name || formatPhone(waitingCall.peer_number)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDeclineWaiting} aria-label="Decline waiting call" className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500">
              <PhoneOff className="h-4 w-4" />
            </button>
            <button onClick={handleAcceptWaiting} aria-label="Accept waiting call, hold current" className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 hover:bg-green-400">
              <PhoneCall className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold ring-1 ring-white/20">
          {(call.peer_name || "?").slice(0, 1).toUpperCase()}
        </div>
        <h2 className="text-2xl font-semibold">{call.peer_name || "Unknown"}</h2>
        <p className="text-zinc-300">{formatPhone(call.peer_number)}</p>
        <p className="mt-1 font-mono text-sm text-zinc-400">{formatDuration(elapsed)}</p>
        {keypad && <p className="font-mono text-lg tracking-widest text-zinc-200">{keypad}</p>}
      </div>

      {/* Sub-panels */}
      {panel === "keypad" && (
        <div className="mx-auto mb-2 w-full max-w-xs rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-medium">Keypad</span>
            <button onClick={() => setPanel(null)} aria-label="Close keypad"><X className="h-4 w-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9","*","0","#"].map((d) => (
              <button key={d} onClick={() => setKeypad((k) => k + d)} aria-label={`Press ${d}`} className="rounded-lg bg-white/10 py-2.5 text-lg text-white hover:bg-white/20">{d}</button>
            ))}
          </div>
        </div>
      )}

      {panel === "audio" && (
        <AudioDevicePicker
          selected={audioOutput}
          onSelect={(id) => { setAudioOutput(id); setPanel(null); }}
          onClose={() => setPanel(null)}
        />
      )}

      {(panel === "transfer" || panel === "conference" || panel === "consult") && (
        <ExtensionPicker
          title={panel === "transfer" ? "Transfer to…" : panel === "conference" ? "Add to conference…" : "Consult transfer to…"}
          extensions={extensions}
          onClose={() => setPanel(null)}
          onSelect={(ext) => {
            if (panel === "transfer") handleTransfer(ext);
            else if (panel === "conference") handleConference(ext);
            else handleConsult(ext);
          }}
        />
      )}

      {panel === "more" && (
        <div className="mx-auto mb-2 w-full max-w-sm rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-medium">More</span>
            <button onClick={() => setPanel(null)} aria-label="Close more"><X className="h-4 w-4 text-zinc-400" /></button>
          </div>
          <div className="space-y-1">
            <MoreItem icon={ArrowRightLeft} label="Transfer" onClick={() => setPanel("transfer")} />
            <MoreItem icon={Users} label="Add to conference" onClick={() => setPanel("conference")} />
            <MoreItem icon={PhoneCall} label="Consult then transfer" onClick={() => setPanel("consult")} />
            {!parked && <MoreItem icon={Square} label="Park call" onClick={handlePark} />}
          </div>
          {parkedCalls.length > 0 && (
            <>
              <p className="mt-3 px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Parked calls — retrieve</p>
              <div className="space-y-1">
                {parkedCalls.map((c) => (
                  <button key={c.id} onClick={() => handleRetrieve(c)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10">
                    <span className="truncate">{c.peer_name || formatPhone(c.peer_number)}</span>
                    <span className="text-xs text-indigo-300">Retrieve</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Main controls — End is always visible */}
      <div className="mx-auto mb-10 grid w-full max-w-sm grid-cols-3 gap-4">
        <CallButton active={muted} onClick={() => setMuted((m) => !m)} icon={muted ? MicOff : Mic} label="Mute" />
        <CallButton active={onHold} onClick={onHold ? handleResume : handleHold} icon={onHold ? Play : Pause} label={onHold ? "Resume" : "Hold"} />
        <CallButton active={panel === "keypad"} onClick={() => setPanel(panel === "keypad" ? null : "keypad")} icon={Grid3x3} label="Keypad" />
        <CallButton active={panel === "audio"} onClick={() => setPanel(panel === "audio" ? null : "audio")} icon={Volume2} label="Audio" />
        <CallButton active={panel === "more"} onClick={() => setPanel(panel === "more" ? null : "more")} icon={MoreHorizontal} label="More" />
        <button
          onClick={handleEnd}
          aria-label="End call"
          className="flex h-16 flex-col items-center justify-center gap-1 rounded-full bg-red-500 transition hover:bg-red-400"
        >
          <PhoneOff className="h-6 w-6" />
          <span className="text-[10px] font-medium">End</span>
        </button>
      </div>
    </div>
  );
}

function ExtensionPicker({ title, extensions, onSelect, onClose }) {
  return (
    <div className="mx-auto mb-2 w-full max-w-md rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-medium">{title}</span>
        <button onClick={onClose} aria-label="Close"><X className="h-4 w-4 text-zinc-400" /></button>
      </div>
      <div className="max-h-52 space-y-1 overflow-y-auto">
        {extensions.length === 0 && <p className="px-2 py-3 text-sm text-zinc-400">No other extensions available.</p>}
        {extensions.map((ext) => (
          <button
            key={ext.id}
            onClick={() => onSelect(ext)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
          >
            <span>{ext.assigned_user_name || ext.label}</span>
            <span className="text-zinc-400">ext {ext.number}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MoreItem({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/10">
      <Icon className="h-4 w-4 text-zinc-300" /> {label}
    </button>
  );
}

function CallButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-16 flex-col items-center justify-center gap-1 rounded-full transition ${
        active ? "bg-white text-zinc-900" : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}