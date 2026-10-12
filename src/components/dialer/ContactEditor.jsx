import { X, Trash2, Smartphone } from "lucide-react";
import { downloadVCard } from "@/lib/vcard";

export default function ContactEditor({ contact, setContact, onSave, onClose, onDelete }) {
  const c = contact;
  const set = (k) => (e) => setContact({ ...c, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={onSave} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{c.id ? "Edit contact" : "Add contact"}</h2>
          <button type="button" onClick={onClose} aria-label="Close editor"><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" full>
            <input required value={c.name} onChange={set("name")} className="input" />
          </Field>
          <Field label="Phone">
            <input required value={c.phone} onChange={set("phone")} className="input" />
          </Field>
          <Field label="Email">
            <input value={c.email} onChange={set("email")} className="input" />
          </Field>
          <Field label="Company">
            <input value={c.company} onChange={set("company")} className="input" />
          </Field>
          <Field label="Department">
            <input value={c.department} onChange={set("department")} className="input" />
          </Field>
          <Field label="Type" full>
            <select value={c.type} onChange={set("type")} className="input">
              <option value="company">Company</option>
              <option value="shared">Shared</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </Field>
          <Field label="Notes" full>
            <textarea value={c.notes} onChange={set("notes")} rows={2} className="input" />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {c.id && (
            <button
              type="button"
              onClick={() => downloadVCard(c)}
              aria-label="Save contact to phone as vCard"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Smartphone className="h-4 w-4" /> Save to phone
            </button>
          )}
          {c.id && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(c)}
              aria-label="Delete contact"
              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          <button type="submit" className="ml-auto rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
            Save
          </button>
        </div>
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