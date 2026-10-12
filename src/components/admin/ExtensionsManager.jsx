import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";

const EMPTY = { number: "", label: "", department: "", role: "employee", assigned_user_id: "", voicemail_enabled: true };

export default function ExtensionsManager() {
  const demo = useDemoEntities();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const refresh = async () => {
    const [exts, us, depts] = await Promise.all([
      demo.Extension.filter({}, { sort: "number", limit: 100 }),
      demo.User.list(),
      demo.Department.filter({}, { sort: "name", limit: 50 }),
    ]);
    setItems(exts.items);
    setUsers(us.items || []);
    setDepartments(depts.items);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const form = editing;
    const user = users.find((u) => u.id === form.assigned_user_id);
    const payload = {
      number: form.number,
      label: form.label,
      department: form.department,
      role: form.role,
      assigned_user_id: form.assigned_user_id,
      assigned_user_name: user?.full_name || user?.email || "",
      voicemail_enabled: form.voicemail_enabled,
      status: form.status || "available",
    };
    if (form.id) {
      await demo.Extension.update(form.id, payload);
    } else {
      const created = await demo.Extension.create(payload);
      form.id = created.id;
    }
    if (user) {
      await demo.User.update(user.id, { extension_number: form.number, phone_role: form.role });
    }
    setEditing(null);
    refresh();
  };

  const remove = async (ext) => {
    await demo.Extension.delete(ext.id);
    refresh();
  };

  if (loading) return <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-zinc-500">{items.length} extensions</p>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Add extension
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((ext) => (
          <div key={ext.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-900">ext {ext.number}</p>
                <p className="text-sm text-zinc-500">{ext.label || "—"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...ext })} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(ext)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <dl className="mt-3 space-y-1 text-sm">
              <Row label="Department" value={ext.department || "—"} />
              <Row label="Role" value={ext.role} cap />
              <Row label="Assigned" value={ext.assigned_user_name || "—"} />
              <Row label="Voicemail" value={ext.voicemail_enabled ? "On" : "Off"} />
            </dl>
          </div>
        ))}
      </div>

      {editing && (
        <ExtDialog
          form={editing}
          setForm={setEditing}
          users={users}
          departments={departments}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Row({ label, value, cap }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-400">{label}</dt>
      <dd className={`text-right text-zinc-700 ${cap ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}

function ExtDialog({ form, setForm, users, departments, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={onSave} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{form.id ? "Edit extension" : "Add extension"}</h2>
          <button type="button" onClick={onClose}><X className="h-5 w-5 text-zinc-400" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Number"><input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="input" /></Field>
          <Field label="Label"><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input" /></Field>
          <Field label="Department">
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input">
              <option value="">None</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
              <option value="employee">Employee</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Assigned user" full>
            <select value={form.assigned_user_id} onChange={(e) => setForm({ ...form, assigned_user_id: e.target.value })} className="input">
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
            </select>
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
          <input type="checkbox" checked={form.voicemail_enabled} onChange={(e) => setForm({ ...form, voicemail_enabled: e.target.checked })} />
          Voicemail enabled
        </label>
        <button type="submit" className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">Save</button>
      </form>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <label className={full ? "col-span-2" : ""}>
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}