import { useState, useEffect } from "react";
import { X, PhoneIncoming } from "lucide-react";
import { simulateInboundCall } from "@/lib/callActions";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

const SAMPLE_CALLERS = [
  { name: "Jordan Avery", number: "+1 (415) 555-0142" },
  { name: "Morgan Bell", number: "+1 (628) 555-0188" },
  { name: "Riley Chen", number: "+1 (212) 555-0117" },
  { name: "Unknown Caller", number: "+1 (800) 555-0199" },
];

export default function SimulateCallDialog({ open, onClose, extensions }) {
  const [extNumber, setExtNumber] = useState("");
  const [callerIdx, setCallerIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && extensions.length && !extNumber) setExtNumber(extensions[0].number);
  }, [open, extensions, extNumber]);

  if (!open) return null;
  const target = extensions.find((e) => e.number === extNumber);

  const handleSimulate = async () => {
    if (!target) return;
    setBusy(true);
    const caller = SAMPLE_CALLERS[callerIdx];
    try {
      await simulateInboundCall({ fromNumber: caller.number, fromName: caller.name, toExtension: target });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold">Simulate inbound call</h2>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-zinc-400" /></button>
        </div>

        <div className="mb-2"><SimulatedBadge /></div>

        <label className="mb-1 block text-xs font-medium text-zinc-500">Ring extension</label>
        <select
          value={extNumber}
          onChange={(e) => setExtNumber(e.target.value)}
          className="mb-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {extensions.map((e) => (
            <option key={e.id} value={e.number}>
              ext {e.number} · {e.assigned_user_name || e.label}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium text-zinc-500">Caller</label>
        <select
          value={callerIdx}
          onChange={(e) => setCallerIdx(Number(e.target.value))}
          className="mb-4 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {SAMPLE_CALLERS.map((c, i) => (
            <option key={i} value={i}>{c.name} · {c.number}</option>
          ))}
        </select>

        <button
          onClick={handleSimulate}
          disabled={busy || !target}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Ring extension"}
        </button>
      </div>
    </div>
  );
}