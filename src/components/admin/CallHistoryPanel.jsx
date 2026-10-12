import { useEffect, useState } from "react";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail, FileText, Circle } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { formatPhone, timeAgo, formatDuration } from "@/lib/phoneUtils";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

const ICONS = {
  inbound: { icon: PhoneIncoming, color: "text-green-600" },
  outbound: { icon: PhoneOutgoing, color: "text-zinc-500" },
  missed: { icon: PhoneMissed, color: "text-red-500" },
};

export default function CallHistoryPanel() {
  const demo = useDemoEntities();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, missed: 0, voicemail: 0 });
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [page, total, missed, vm] = await Promise.all([
          demo.CallLog.filter({ status: { $in: ["ended", "missed", "voicemail"] } }, { sort: "-started_at", limit: 50 }),
          demo.CallLog.count({ status: { $in: ["ended", "missed", "voicemail"] } }),
          demo.CallLog.count({ disposition: "missed" }),
          demo.CallLog.count({ status: "voicemail" }),
        ]);
        setItems(page.items);
        setStats({ total, missed, voicemail: vm });
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Total calls" value={stats.total} />
        <Stat label="Missed" value={stats.missed} tone="text-red-600" />
        <Stat label="Voicemails" value={stats.voicemail} tone="text-indigo-600" />
      </div>

      <div className="mb-3"><SimulatedBadge /></div>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>
      ) : !items.length ? (
        <p className="py-8 text-center text-sm text-zinc-400">No calls yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((c) => {
            const meta = ICONS[c.direction] || ICONS.outbound;
            const Icon = c.status === "voicemail" ? Voicemail : meta.icon;
            const color = c.status === "voicemail" ? "text-indigo-500" : c.status === "missed" ? "text-red-500" : meta.color;
            const open = openId === c.id;
            return (
              <div key={c.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{c.peer_name || "Unknown"}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {formatPhone(c.peer_number)} · ext {c.extension_number || "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-400">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.recording_url && <Circle className="h-2 w-2 fill-red-500 text-red-500" />}
                      <p>{timeAgo(c.started_at || c.ended_at)}</p>
                    </div>
                    <p>{c.duration_seconds ? formatDuration(c.duration_seconds) : "—"}</p>
                  </div>
                  {c.transcript && (
                    <button
                      onClick={() => setOpenId(open ? null : c.id)}
                      aria-label={open ? "Hide transcript" : "Show transcript"}
                      className="ml-1 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {open && c.transcript && (
                  <div className="mt-3 whitespace-pre-line rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-700">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Transcript</p>
                    {c.transcript}
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

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone || "text-zinc-900"}`}>{value}</p>
    </div>
  );
}