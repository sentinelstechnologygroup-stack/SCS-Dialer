import { Plug, Circle, CalendarClock } from "lucide-react";
import { useDemoCollection } from "@/hooks/useDemoCollection";
import { seedIntegrations } from "@/lib/demoFixtures";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

// Integrations overview. No integration is actually connected in the
// prototype. Statuses read "Not connected" or "Planned" — never "Linked"
// or "Available" — so the UI never implies a live connection was established.
const STATUS_META = {
  planned: { icon: CalendarClock, color: "text-amber-600 bg-amber-50", label: "Planned" },
  not_connected: { icon: Circle, color: "text-zinc-500 bg-zinc-100", label: "Not connected" },
};

export default function Integrations() {
  const integrations = useDemoCollection("integrations", seedIntegrations);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Integrations</h1>
            <p className="text-xs text-zinc-400">Connected services and modeled providers</p>
          </div>
          <SimulatedBadge />
        </div>

        {integrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center">
            <Plug className="h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-sm text-zinc-400">No integrations configured</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {integrations.map((it) => {
              const meta = STATUS_META[it.status] || STATUS_META.not_connected;
              const Icon = meta.icon;
              return (
                <div key={it.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
                      <Plug className="h-5 w-5" />
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.color}`}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-zinc-900">{it.name}</p>
                  <p className="text-xs text-zinc-400">{it.category} · {it.stack}</p>
                  <p className="mt-2 text-xs text-zinc-500">{it.description}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          No live provider operations are performed in the prototype. Telnyx calling, SMS, and fax are planned; Firebase Firestore sync uses local demo persistence until wired.
        </div>
      </div>
    </div>
  );
}