import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, PhoneMissed, Voicemail, MessageSquare, X } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { formatPhone, timeAgo } from "@/lib/phoneUtils";
import { useMyExtension } from "@/hooks/useMyExtension";

export default function NotificationsMenu({ onClose }) {
  const demo = useDemoEntities();
  const { user } = useMyExtension();
  const navigate = useNavigate();
  const [items, setItems] = useState({ missed: [], voicemails: [], messages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [missed, vms, msgs] = await Promise.all([
          demo.CallLog.filter(
            { assigned_user_id: user.id, status: "missed" },
            { sort: "-created_date", limit: 3 }
          ),
          demo.Voicemail.filter(
            { assigned_user_id: user.id, listened: { $ne: true } },
            { sort: "-received_at", limit: 3 }
          ),
          demo.Message.filter(
            { assigned_user_id: user.id, direction: "inbound", read: { $ne: true } },
            { sort: "-created_date", limit: 3 }
          ),
        ]);
        setItems({ missed: missed.items, voicemails: vms.items, messages: msgs.items });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const go = () => { navigate("/keypad"); onClose(); };
  const count = items.missed.length + items.voicemails.length + items.messages.length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-sm overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-zinc-700" />
            <h2 className="text-base font-semibold">Notifications</h2>
            {count > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">{count}</span>}
          </div>
          <button onClick={onClose} aria-label="Close notifications"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>
        ) : count === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">You're all caught up</p>
        ) : (
          <div className="space-y-4">
            <Section icon={PhoneMissed} title="Missed calls" rows={items.missed.map((c) => ({ id: c.id, title: c.peer_name || formatPhone(c.peer_number), sub: timeAgo(c.ended_at || c.created_date) }))} />
            <Section icon={Voicemail} title="Voicemails" rows={items.voicemails.map((v) => ({ id: v.id, title: v.from_name || formatPhone(v.from_number), sub: timeAgo(v.received_at) }))} />
            <Section icon={MessageSquare} title="Messages" rows={items.messages.map((m) => ({ id: m.id, title: m.peer_name || formatPhone(m.peer_number), sub: m.body }))} />
          </div>
        )}

        <button onClick={go} className="mt-4 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">
          Open dialer
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, rows }) {
  if (!rows.length) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-zinc-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
            <p className="truncate text-sm font-medium text-zinc-900">{r.title}</p>
            <p className="truncate text-xs text-zinc-500">{r.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}