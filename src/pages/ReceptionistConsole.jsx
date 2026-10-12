import { useState, useEffect } from "react";
import { PhoneIncoming } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { useActiveCalls } from "@/hooks/useActiveCalls";
import { useMyExtension } from "@/hooks/useMyExtension";
import CallQueuePanel from "@/components/receptionist/CallQueuePanel";
import DirectoryPanel from "@/components/receptionist/DirectoryPanel";
import SimulateCallDialog from "@/components/receptionist/SimulateCallDialog";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

export default function ReceptionistConsole() {
  const demo = useDemoEntities();
  const { user } = useMyExtension();
  const { calls, loading } = useActiveCalls({ all: true });
  const [extensions, setExtensions] = useState([]);
  const [simOpen, setSimOpen] = useState(false);

  useEffect(() => {
    demo.Extension.filter({}, { sort: "number", limit: 100 })
      .then((p) => setExtensions(p.items))
      .catch(() => {});
  }, []);

  const ringingCount = calls.filter((c) => c.status === "ringing").length;

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      <header className="flex flex-col gap-3 border-b border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Receptionist Console</h1>
          <p className="text-sm text-zinc-500">
            {calls.length} active · {ringingCount} ringing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SimulatedBadge />
          <button
            onClick={() => setSimOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <PhoneIncoming className="h-4 w-4" /> Simulate inbound
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:overflow-hidden">
        <div className="grid grid-cols-1 gap-4 lg:h-full lg:grid-cols-3">
          <section className="lg:col-span-2 lg:overflow-y-auto">
            {loading ? (
              <p className="py-8 text-center text-sm text-zinc-400">Loading queue…</p>
            ) : (
              <CallQueuePanel calls={calls} extensions={extensions} receptionistUserId={user?.id} />
            )}
          </section>
          <aside className="rounded-xl border border-zinc-200 bg-white p-3 lg:overflow-y-auto">
            <DirectoryPanel />
          </aside>
        </div>
      </div>

      <SimulateCallDialog open={simOpen} onClose={() => setSimOpen(false)} extensions={extensions} />
    </div>
  );
}