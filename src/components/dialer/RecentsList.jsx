import { useEffect, useState, useCallback } from "react";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, ChevronDown, Save } from "lucide-react";
import { callAdapter } from "@/services/adapters";
import { formatPhone, timeAgo, formatDuration } from "@/lib/phoneUtils";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";

const ICONS = {
  inbound: { icon: PhoneIncoming, color: "text-green-600" },
  outbound: { icon: PhoneOutgoing, color: "text-zinc-500" },
  missed: { icon: PhoneMissed, color: "text-red-500" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "inbound", label: "Inbound" },
  { id: "outbound", label: "Outbound" },
  { id: "missed", label: "Missed" },
  { id: "voicemail", label: "Voicemail" },
];

export default function RecentsList({ onCall }) {
  const workspace = useWorkspace();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const recent = await callAdapter.listRecent({ direction: filter, limit: 50 }, workspace);
      if (isCurrentWorkspace(workspace)) setItems(recent);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter, workspace]);

  useEffect(() => {
    refresh();
    const unsub = callAdapter.subscribe(() => { if (isCurrentWorkspace(workspace)) refresh(); }, workspace);
    return () => { if (typeof unsub === "function") unsub(); };
  }, [refresh]);

  const open = (c) => {
    const is_open = openId === c.id;
    setOpenId(is_open ? null : c.id);
    setNotes(c.notes || "");
  };

  const saveNotes = async (c) => {
    setSavingNotes(true);
    try {
      await callAdapter.update(c.id, { notes }, workspace);
    } finally {
      setSavingNotes(false);
      refresh();
    }
  };

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading…</div>;

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      {/* Filter chips */}
      <div className="mb-2 mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-label={`Filter by ${f.label}`}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === f.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!items.length ? (
        <EmptyState label="No recent calls" />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {items.map((c) => {
            const meta = ICONS[c.direction] || ICONS.outbound;
            const Icon = c.status === "voicemail" ? Voicemail : meta.icon;
            const color = c.status === "voicemail" ? "text-indigo-500" : c.status === "missed" ? "text-red-500" : meta.color;
            const is_open = openId === c.id;
            return (
              <div key={c.id} className="border-b border-zinc-100">
                <div className="flex items-center gap-3 py-3">
                  <button onClick={() => onCall(c.peer_number, c.peer_name)} aria-label={`Call back ${c.peer_name || "unknown"}`} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{c.peer_name || "Unknown"}</p>
                      <p className="truncate text-xs text-zinc-500">{formatPhone(c.peer_number)}</p>
                    </div>
                  </button>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.recording_url !== null && c.recording_url !== undefined && <span className="h-2 w-2 rounded-full bg-red-500" />}
                      <p className="text-xs text-zinc-400">{timeAgo(c.started_at || c.ended_at)}</p>
                    </div>
                    {c.duration_seconds > 0 && (
                      <p className="text-[11px] text-zinc-400">{formatDuration(c.duration_seconds)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => open(c)}
                    aria-label={is_open ? "Hide details" : "Show details"}
                    aria-expanded={is_open}
                    className="ml-1 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600"
                  >
                    <ChevronDown className={`h-4 w-4 transition ${is_open ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {is_open && (
                  <div className="mb-3 ml-8 space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 capitalize">{c.direction}</span>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 capitalize">{c.status}</span>
                      {c.assigned_user_name && <span className="rounded bg-zinc-100 px-2 py-0.5">{c.assigned_user_name}</span>}
                      {c.transferred_to && <span className="rounded bg-zinc-100 px-2 py-0.5">→ ext {c.transferred_to}</span>}
                    </div>
                    {c.transcript && (
                      <div className="whitespace-pre-line rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-700">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Transcript</p>
                        {c.transcript}
                      </div>
                    )}
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Notes</p>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Add call notes…"
                        className="input"
                      />
                      <button
                        onClick={() => saveNotes(c)}
                        disabled={savingNotes}
                        aria-label="Save call notes"
                        className="mt-1.5 flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                      >
                        <Save className="h-3 w-3" /> {savingNotes ? "Saving…" : "Save notes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
      <PhoneMissed className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}