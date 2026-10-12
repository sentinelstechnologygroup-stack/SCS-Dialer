import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";

const EMPTY = { inbound_number: "", label: "", destination_type: "receptionist", destination_extension: "", business_hours_only: false, ivr_options: "", enabled: true };

export default function RoutingManager() {
  const demo = useDemoEntities();
  const [items, setItems] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const refresh = async () => {
    const [rules, exts] = await Promise.all([
      demo.RoutingRule.filter({}, { sort: "-created_date", limit: 50 }),
      demo.Extension.filter({}, { sort: "number", limit: 100 }),
    ]);
    setItems(rules.items);
    setExtensions(exts.items);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (editing.id) await demo.RoutingRule.update(editing.id, editing);
    else await demo.RoutingRule.create(editing);
    setEditing(null);
    refresh();
  };
  const remove = async (r) => { await demo.RoutingRule.delete(r.id); refresh(); };
  const toggle = async (r) => { await demo.RoutingRule.update(r.id, { enabled: !r.enabled }); refresh(); };

  if (loading) return <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-zinc-500">{items.length} inbound numbers</p>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Add number
        </button>
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-zinc-900">{r.inbound_number}</p>
                {r.label && <span className="text-sm text-zinc-500">· {r.label}</span>}
              </div>
              <p className="text-xs text-zinc-500 capitalize">
                Routes to {r.destination_type}{r.destination_extension ? ` ext ${r.destination_extension}` : ""}
                {r.business_hours_only ? " · business hours" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(r)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.enabled ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {r.enabled ? "Active" : "Off"}
              </button>
              <button onClick={() => setEditing({ ...r })} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(r)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{editing.id ? "Edit routing" : "Add inbound number"}</h2>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5 text-zinc-400" /></button>
            </div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Inbound number</label>
            <input required value={editing.inbound_number} onChange={(e) => setEditing({ ...editing, inbound_number: e.target.value })} className="input mb-3" placeholder="+1 555-0100" />
            <label className="mb-1 block text-xs font-medium text-zinc-500">Label</label>
            <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className="input mb-3" placeholder="Main line" />
            <label className="mb-1 block text-xs font-medium text-zinc-500">Destination</label>
            <select value={editing.destination_type} onChange={(e) => setEditing({ ...editing, destination_type: e.target.value })} className="input mb-3">
              <option value="receptionist">Receptionist</option>
              <option value="extension">Extension</option>
              <option value="voicemail">Voicemail</option>
              <option value="ivr">IVR menu</option>
            </select>
            {editing.destination_type === "extension" && (
              <select value={editing.destination_extension} onChange={(e) => setEditing({ ...editing, destination_extension: e.target.value })} className="input mb-3">
                <option value="">Select extension</option>
                {extensions.map((ext) => <option key={ext.id} value={ext.number}>ext {ext.number} · {ext.assigned_user_name || ext.label}</option>)}
              </select>
            )}
            {editing.destination_type === "ivr" && (
              <input value={editing.ivr_options} onChange={(e) => setEditing({ ...editing, ivr_options: e.target.value })} className="input mb-3" placeholder="1: Sales, 2: Support" />
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input type="checkbox" checked={editing.business_hours_only} onChange={(e) => setEditing({ ...editing, business_hours_only: e.target.checked })} />
              Business hours only
            </label>
            <button type="submit" className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}