import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";

const EMPTY = { name: "", description: "" };

export default function DepartmentsManager() {
  const demo = useDemoEntities();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const refresh = async () => {
    const p = await demo.Department.filter({}, { sort: "name", limit: 50 });
    setItems(p.items);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (editing.id) await demo.Department.update(editing.id, { name: editing.name, description: editing.description });
    else await demo.Department.create({ name: editing.name, description: editing.description });
    setEditing(null);
    refresh();
  };
  const remove = async (d) => { await demo.Department.delete(d.id); refresh(); };

  if (loading) return <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-zinc-500">{items.length} departments</p>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Add department
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <div key={d.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-zinc-900">{d.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...d })} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(d)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{d.description || "No description"}</p>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{editing.id ? "Edit department" : "Add department"}</h2>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5 text-zinc-400" /></button>
            </div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Name</label>
            <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input mb-3" />
            <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="input mb-4" />
            <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}