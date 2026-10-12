import { useEffect, useState, useCallback } from "react";
import { Search, UserPlus, MessageSquare, Pencil, Smartphone, Download, Upload, Users } from "lucide-react";
import { contactAdapter } from "@/services/adapters";
import { formatPhone, initials, colorForName } from "@/lib/phoneUtils";
import { canPickContacts, pickContacts } from "@/lib/deviceContacts";
import ContactEditor from "@/components/dialer/ContactEditor";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace, getCompany } from "@/lib/demoWorkspace";
import { reportDemoError } from "@/lib/demoErrors";

const EMPTY = { name: "", company: "", phone: "", email: "", type: "company", department: "", notes: "" };
const FILTERS = [
  { id: "all", label: "All" },
  { id: "company", label: "Company" },
  { id: "shared", label: "Shared" },
  { id: "personal", label: "Personal" },
  { id: "business", label: "Business" },
];

function normPhone(p) { return String(p || "").replace(/[^\d+]/g, ""); }

export default function ContactsList({ onCall, onMessage }) {
  const workspace = useWorkspace();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [existing, setExisting] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const queryObj = {};
      if (filter !== "all") queryObj.type = filter;
      if (query) queryObj.name = { $regex: query, $options: "i" };
      const all = await contactAdapter.list({ query: queryObj, limit: 200 }, workspace);
      setItems(all);
      // Keep a full snapshot for dedupe on import/add (no server-side dedupe).
      const snapshot = await contactAdapter.list({ limit: 500 }, workspace);
      setExisting(snapshot);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [query, filter, workspace]);

  useEffect(() => { refresh(); }, [refresh]);

  const dedupeAgainst = (records) => {
    const phones = new Set(existing.map((c) => normPhone(c.phone)));
    return records.filter((r) => r.phone && !phones.has(normPhone(r.phone)));
  };

  const save = async (e) => {
    e.preventDefault();
    const c = editing;
    const dupes = existing.filter((x) => x.id !== c.id && normPhone(x.phone) === normPhone(c.phone));
    if (dupes.length) {
      if (!confirm(`A contact with this number already exists (${dupes[0].name}). Save anyway?`)) return;
    }
    if (c.id) await contactAdapter.update(c.id, c, workspace);
    else await contactAdapter.create(c, workspace);
    setEditing(null);
    refresh();
  };
  const remove = async (c) => { await contactAdapter.remove(c.id, workspace); setEditing(null); refresh(); };

  const importFromPhone = async () => {
    setImporting(true);
    try {
      const picked = await pickContacts();
      if (!isCurrentWorkspace(workspace)) return;
      if (picked.length) {
        const deduped = dedupeAgainst(picked.map((p) => ({ ...EMPTY, ...p, type: "personal" })));
        if (deduped.length) await contactAdapter.bulkCreate(deduped, workspace);
      }
      refresh();
    } finally {
      setImporting(false);
    }
  };

  const exportCsv = async () => {
    const all = await contactAdapter.list({ limit: 500 }, workspace);
    const header = "name,phone,email,company,department,type,notes";
    const rows = all.map((c) =>
      [c.name, c.phone, c.email, c.company, c.department, c.type, c.notes]
        .map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "scs_contacts.csv"; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const text = await file.text();
      if (!isCurrentWorkspace(workspace)) return;
      const lines = text.split(/\r?\n/).filter(Boolean);
      const [, ...rest] = lines;
      const records = rest.map((line) => {
        const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((s) => s.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
        return { name: cols[0] || "", phone: cols[1] || "", email: cols[2] || "", company: cols[3] || "", department: cols[4] || "", type: cols[5] || "company", notes: cols[6] || "" };
      }).filter((r) => r.name && r.phone);
      const deduped = dedupeAgainst(records);
      if (deduped.length) await contactAdapter.bulkCreate(deduped, workspace);
      refresh();
    } catch (error) {
      reportDemoError(error);
    }
  };

  if (loading && !items.length) return <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Loading…</div>;

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      <div className="relative mb-3 mt-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts"
          aria-label="Search contacts"
          className="w-full rounded-full bg-zinc-100 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Filter chips */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
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

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => setEditing({ ...EMPTY, company: getCompany(workspace.companyId).label, companyId: workspace.companyId })}
          aria-label="Add contact"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <UserPlus className="h-4 w-4" /> Add
        </button>
        {canPickContacts() && (
          <button
            onClick={importFromPhone}
            disabled={importing}
            aria-label="Import contacts from phone"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            <Smartphone className="h-4 w-4" /> {importing ? "…" : "Phone"}
          </button>
        )}
        <button onClick={exportCsv} aria-label="Export contacts to CSV" className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          <Download className="h-4 w-4" />
        </button>
        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          <Upload className="h-4 w-4" />
          <input type="file" accept=".csv" onChange={importCsv} className="hidden" />
        </label>
      </div>

      {!items.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
          <Users className="h-8 w-8" />
          <p className="text-sm">{query ? "No matches" : "No contacts yet"}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-2">
          {items.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-xl px-2 py-2.5 hover:bg-zinc-50">
              <button onClick={() => onCall(c.phone, c.name)} aria-label={`Call ${c.name}`} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: c.avatar_color || colorForName(c.name) }}
                >
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{c.name}</p>
                  <p className="truncate text-xs text-zinc-500">{c.company || formatPhone(c.phone)}</p>
                </div>
              </button>
              {onMessage && (
                <button
                  onClick={() => onMessage(c.phone, c.name)}
                  aria-label={`Message ${c.name}`}
                  className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setEditing({ ...c })}
                aria-label={`Edit ${c.name}`}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ContactEditor
          contact={editing}
          setContact={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
          onDelete={remove}
        />
      )}
    </div>
  );
}