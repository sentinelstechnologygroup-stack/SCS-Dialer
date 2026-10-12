import { useState } from "react";
import { Star, Phone, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDemoCollection } from "@/hooks/useDemoCollection";
import { insertItem, removeItem } from "@/lib/demoStore";
import { seedFavorites } from "@/lib/demoFixtures";
import { useStartCall } from "@/hooks/useStartCall";
import { formatPhone, initials, colorForName } from "@/lib/phoneUtils";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import { captureWorkspace, getCompany } from "@/lib/demoWorkspace";

// Speed-dial favorites. Fictional MDX/GMS contacts persisted locally.
export default function Favorites() {
  const favorites = useDemoCollection("favorites", seedFavorites);
  const navigate = useNavigate();
  const handleCall = useStartCall();
  const [adding, setAdding] = useState(false);

  const sorted = [...favorites].sort((a, b) => (a.order || 0) - (b.order || 0));

  const openMessage = (f) => {
    const params = new URLSearchParams({ peer: f.number, name: f.name });
    navigate(`/messages?${params.toString()}`);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Favorites</h1>
            <p className="text-xs text-zinc-400">Tap to call or message your pinned contacts</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            aria-label="Add favorite"
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="mb-3"><SimulatedBadge /></div>

        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sorted.map((f) => (
              <div key={f.id} className="group rounded-xl border border-zinc-200 bg-white p-4 text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
                  style={{ backgroundColor: f.color || colorForName(f.name) }}
                >
                  {initials(f.name)}
                </div>
                <p className="mt-2 truncate text-sm font-medium text-zinc-900">{f.name}</p>
                <p className="truncate text-xs text-zinc-400">{f.role}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatPhone(f.number)}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCall(f.number, f.name)}
                    aria-label={`Call ${f.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openMessage(f)}
                    aria-label={`Message ${f.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem("favorites", f.id)}
                    aria-label={`Remove ${f.name} from favorites`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {adding && <AddFavorite onClose={() => setAdding(false)} />}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
      <Star className="h-8 w-8 text-zinc-300" />
      <p className="mt-2 text-sm font-medium text-zinc-600">No favorites yet</p>
      <p className="text-xs text-zinc-400">Add a contact to your speed-dial.</p>
    </div>
  );
}

function AddFavorite({ onClose }) {
  const [workspace] = useState(captureWorkspace);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [role, setRole] = useState("");

  const save = () => {
    if (!name || !number) return;
    insertItem("favorites", {
      name, number, role, company: getCompany(workspace.companyId).label, color: colorForName(name), order: Date.now(),
    }, workspace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-base font-semibold">Add favorite</h2>
        <div className="space-y-3">
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Phone number" value={number} onChange={(e) => setNumber(e.target.value)} />
          <input className="input" placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <button onClick={save} disabled={!name || !number} className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          Save
        </button>
      </div>
    </div>
  );
}