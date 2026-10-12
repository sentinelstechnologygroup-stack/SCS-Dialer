import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Phone, PhoneMissed, Voicemail, Users } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

const STATUS_COLORS = { available: "#22c55e", busy: "#f59e0b", offline: "#d4d4d8" };
const DIR_COLORS = ["#22c55e", "#6366f1", "#ef4444"];

export default function OverviewPanel() {
  const demo = useDemoEntities();
  const [stats, setStats] = useState({ total: 0, missed: 0, voicemail: 0, active: 0 });
  const [perDay, setPerDay] = useState([]);
  const [byDirection, setByDirection] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [total, missed, vm, active, dayAgg, dirAgg, extPage] = await Promise.all([
          demo.CallLog.count({ status: { $in: ["ended", "missed", "voicemail"] } }),
          demo.CallLog.count({ disposition: "missed" }),
          demo.CallLog.count({ status: "voicemail" }),
          demo.CallLog.count({ status: { $in: ["ringing", "connected", "on_hold", "parked"] } }),
          demo.CallLog.aggregate({ dateBucket: { field: "created_date", unit: "day" }, limit: 7, sort: "-_id" }),
          demo.CallLog.aggregate({ groupBy: "direction" }),
          demo.Extension.filter({}, { sort: "number", limit: 100 }),
        ]);
        setStats({ total, missed, voicemail: vm, active });
        const days = (dayAgg.rows || []).slice().reverse().map((r) => ({
          date: (r._id || r.date || "").slice(5),
          calls: r.count,
        }));
        setPerDay(days);
        setByDirection((dirAgg.rows || []).map((r) => ({ name: r.direction || "unknown", value: r.count })));
        setExtensions(extPage.items || []);
      } catch (e) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="py-8 text-center text-sm text-zinc-400">Loading overview…</p>;

  return (
    <div className="space-y-6">
      <div className="mb-3"><SimulatedBadge /></div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Phone} label="Total calls" value={stats.total} />
        <Stat icon={PhoneMissed} label="Missed" value={stats.missed} tone="text-red-600" />
        <Stat icon={Voicemail} label="Voicemails" value={stats.voicemail} tone="text-indigo-600" />
        <Stat icon={Users} label="Active now" value={stats.active} tone="text-green-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Calls — last 7 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={perDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By direction">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byDirection} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {byDirection.map((_, i) => (
                  <Cell key={i} fill={DIR_COLORS[i % DIR_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Live extension status">
        {extensions.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">No extensions configured</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {extensions.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[e.status] || "#d4d4d8" }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{e.assigned_user_name || e.label || "Unassigned"}</p>
                  <p className="text-xs text-zinc-500">ext {e.number} · {e.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-400" />
        <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      </div>
      <p className={`mt-1 text-2xl font-semibold ${tone || "text-zinc-900"}`}>{value}</p>
    </div>
  );
}

function Card({ title, className = "", children }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-4 ${className}`}>
      <p className="mb-3 text-sm font-semibold text-zinc-900">{title}</p>
      {children}
    </div>
  );
}