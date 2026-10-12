import { useEffect, useState } from "react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { initials, colorForName } from "@/lib/phoneUtils";

export default function StaffManager() {
  const demo = useDemoEntities();
  const [users, setUsers] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [us, exts] = await Promise.all([
      demo.User.list(),
      demo.Extension.filter({}, { sort: "number", limit: 100 }),
    ]);
    setUsers(us.items || []);
    setExtensions(exts.items);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const update = async (user, field, value) => {
    await demo.User.update(user.id, { [field]: value });
    refresh();
  };

  if (loading) return <p className="py-8 text-center text-sm text-zinc-400">Loading…</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <div key={u.id} className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: colorForName(u.full_name || u.email) }}
            >
              {initials(u.full_name || u.email || "?")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{u.full_name || "—"}</p>
              <p className="truncate text-xs text-zinc-500">{u.email}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs">
              <span className="mb-1 block font-medium text-zinc-500">Console role</span>
              <select
                value={u.phone_role || (u.role === "admin" ? "admin" : "employee")}
                onChange={(e) => update(u, "phone_role", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="employee">Employee</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium text-zinc-500">Extension</span>
              <select
                value={u.extension_number || ""}
                onChange={(e) => update(u, "extension_number", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">None</option>
                {extensions.map((ext) => <option key={ext.id} value={ext.number}>ext {ext.number}</option>)}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}