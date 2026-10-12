import { useEffect, useState } from "react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { initials, colorForName } from "@/lib/phoneUtils";

const STATUS_DOT = {
  available: "bg-green-500",
  busy: "bg-amber-500",
  offline: "bg-zinc-300",
};

export default function DirectoryPanel() {
  const demo = useDemoEntities();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    demo.Extension.filter({}, { sort: "number", limit: 100 })
      .then((p) => setItems(p.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      <h3 className="px-1 pb-2 text-sm font-semibold text-zinc-900">Directory</h3>
      <div className="space-y-1">
        {loading && <p className="px-2 py-3 text-sm text-zinc-400">Loading…</p>}
        {!loading && !items.length && <p className="px-2 py-3 text-sm text-zinc-400">No extensions.</p>}
        {items.map((ext) => (
          <div key={ext.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-100">
            <div className="relative">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: colorForName(ext.assigned_user_name || ext.number) }}
              >
                {initials(ext.assigned_user_name || ext.label || "?")}
              </div>
              <span className={`absolute -bottom-0 -right-0 h-3 w-3 rounded-full ring-2 ring-white ${STATUS_DOT[ext.status] || "bg-zinc-300"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{ext.assigned_user_name || ext.label}</p>
              <p className="text-xs text-zinc-500 capitalize">{ext.role} · {ext.department || "General"}</p>
            </div>
            <span className="text-xs font-medium text-zinc-400">ext {ext.number}</span>
          </div>
        ))}
      </div>
    </div>
  );
}