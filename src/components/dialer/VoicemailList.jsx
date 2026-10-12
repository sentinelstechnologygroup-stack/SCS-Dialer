import { useEffect, useState, useCallback, useRef } from "react";
import { Voicemail as VoicemailIcon, Play, Pause, Trash2, Check, PhoneCall, Pencil, Volume2 } from "lucide-react";
import { voicemailAdapter } from "@/services/adapters";
import { formatPhone, timeAgo, formatDuration } from "@/lib/phoneUtils";
import { playTone } from "@/lib/ringtones";
import { ensureSeeded, saveCollection } from "@/lib/demoStore";
import { seedVoicemailGreeting } from "@/lib/demoFixtures";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";

const GREETING_KEY = "voicemail_greeting";

export default function VoicemailList({ onCall }) {
  const workspace = useWorkspace();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [greeting, setGreeting] = useState(() => ensureSeeded(GREETING_KEY, () => [seedVoicemailGreeting()])[0] || { text: "", enabled: true });
  const [editingGreeting, setEditingGreeting] = useState(false);
  const playTimer = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const vms = await voicemailAdapter.list({ limit: 50 }, workspace);
      if (isCurrentWorkspace(workspace)) setItems(vms);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    refresh();
    const unsub = voicemailAdapter.subscribe(() => { if (isCurrentWorkspace(workspace)) refresh(); }, workspace);
    return () => { if (typeof unsub === "function") unsub(); };
  }, [refresh]);

  useEffect(() => () => { if (playTimer.current) clearTimeout(playTimer.current); }, []);

  const markListened = async (vm) => {
    if (!vm.listened) await voicemailAdapter.update(vm.id, { listened: true }, workspace);
  };
  const remove = async (vm) => { await voicemailAdapter.remove(vm.id, workspace); };

  // Demo test tone: a synthesized tone for the voicemail duration. This is
  // NOT voicemail speech or a recording — it is a labeled demo test tone.
  const playSample = (vm) => {
    if (playingId === vm.id) { setPlayingId(null); if (playTimer.current) clearTimeout(playTimer.current); return; }
    setPlayingId(vm.id);
    markListened(vm);
    playTone("message");
    const dur = Math.max(2, Math.min(vm.duration_seconds || 8, 15)) * 1000;
    playTimer.current = setTimeout(() => setPlayingId(null), dur);
  };

  const saveGreeting = () => {
    saveCollection(GREETING_KEY, [greeting], workspace);
    setEditingGreeting(false);
  };

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading…</div>;

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      {/* Greeting card */}
      <div className="mt-2 mb-3 rounded-xl border border-zinc-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-900">Voicemail greeting</p>
          </div>
          <button onClick={() => setEditingGreeting((e) => !e)} aria-label="Edit voicemail greeting" className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        {editingGreeting ? (
          <div className="mt-2">
            <textarea value={greeting.text} onChange={(e) => setGreeting({ ...greeting, text: e.target.value })} rows={3} className="input" />
            <button onClick={saveGreeting} className="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Save greeting</button>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-zinc-500">{greeting.text}</p>
        )}
      </div>

      {!items.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
          <VoicemailIcon className="h-8 w-8" />
          <p className="text-sm">No voicemails</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-1">
          {items.map((vm) => (
            <div key={vm.id} className="mb-2 rounded-xl bg-white p-3 ring-1 ring-zinc-200">
              <button
                onClick={() => { setOpenId(openId === vm.id ? null : vm.id); markListened(vm); }}
                aria-label={`Open voicemail from ${vm.from_name || "unknown"}`}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${vm.listened ? "bg-zinc-100" : "bg-indigo-100"}`}>
                  <Play className={`h-4 w-4 ${vm.listened ? "text-zinc-400" : "text-indigo-600"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{vm.from_name || "Unknown"}</p>
                  <p className="text-xs text-zinc-500">{formatPhone(vm.from_number)} · {timeAgo(vm.received_at)}</p>
                </div>
                {!vm.listened && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
              </button>
              {openId === vm.id && (
                <div className="mt-3 border-t border-zinc-100 pt-3">
                  <div className="mb-2 flex items-center gap-2">
                    <SimulatedBadge />
                    <span className="text-xs text-zinc-400">{formatDuration(vm.duration_seconds)}</span>
                  </div>
                  <p className="mb-1 text-xs text-zinc-400">Demo test tone — not a real recording.</p>
                  <p className="text-sm text-zinc-600">{vm.transcript}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => playSample(vm)}
                      aria-label={playingId === vm.id ? "Stop demo test tone" : "Play demo test tone"}
                      className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-600 hover:bg-indigo-100"
                    >
                      {playingId === vm.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {playingId === vm.id ? "Stop tone" : "Play demo tone"}
                    </button>
                    {onCall && (
                      <button
                        onClick={() => onCall(vm.from_number, vm.from_name)}
                        aria-label={`Call back ${vm.from_name || "unknown"}`}
                        className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs text-green-600 hover:bg-green-100"
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> Callback
                      </button>
                    )}
                    <button onClick={() => markListened(vm)} aria-label="Mark voicemail read" className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200">
                      <Check className="h-3.5 w-3.5" /> Mark read
                    </button>
                    <button onClick={() => remove(vm)} aria-label="Delete voicemail" className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}