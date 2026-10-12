import { useState } from "react";
import { Phone, X, Minus, Delete } from "lucide-react";
import { formatPhone } from "@/lib/phoneUtils";
import { useStartCall } from "@/hooks/useStartCall";
import { useActiveCalls } from "@/hooks/useActiveCalls";
import { useMyExtension } from "@/hooks/useMyExtension";
import { formatDuration } from "@/lib/phoneUtils";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

const KEYS = ["1","2","3","4","5","6","7","8","9","*","0","#"];

// Floating, minimizable desktop dialer widget. Sits over the content on
// desktop (md+) only; mobile uses the Keypad tab. Shows the active call's
// caller ID when a call is connected, and a mini dialpad to start a new call.
export default function FloatingDialer() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { user } = useMyExtension();
  const { calls } = useActiveCalls({ all: false, userId: user?.id });
  const startCall = useStartCall();

  const active = calls.find((c) => c.status === "connected" || c.status === "on_hold");
  const ringing = calls.find((c) => c.status === "ringing");

  const call = active || ringing;

  const press = (k) => setValue((v) => v + k);
  const back = () => setValue((v) => v.slice(0, -1));
  const placeCall = () => { if (value) { startCall(value); setValue(""); setOpen(false); } };

  // Minimized pill: show caller ID if a call is active, else the dialer icon.
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={call ? `Open dialer — call with ${call.peer_name || "unknown"}` : "Open dialer"}
        className="fixed bottom-20 right-4 z-30 hidden h-14 items-center gap-2 rounded-full bg-zinc-900 px-4 text-white shadow-xl transition hover:bg-zinc-800 md:flex"
      >
        {call ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="max-w-32 truncate text-sm font-medium">{call.peer_name || formatPhone(call.peer_number)}</span>
            {active && <span className="font-mono text-xs text-zinc-300">{formatDuration((Date.now() - new Date(active.started_at).getTime()) / 1000)}</span>}
          </>
        ) : (
          <>
            <Phone className="h-5 w-5" />
            <span className="text-sm font-medium">Dialer</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-30 hidden w-72 flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl md:flex">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-zinc-700" />
          <span className="text-sm font-semibold text-zinc-900">Dialer</span>
          <SimulatedBadge />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setOpen(false)} aria-label="Minimize dialer" className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={() => setOpen(false)} aria-label="Close dialer" className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {call && (
        <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            {active ? "Active call" : "Calling…"}
          </p>
          <p className="truncate text-sm font-medium text-zinc-900">{call.peer_name || "Unknown"}</p>
          <p className="text-xs text-zinc-500">{formatPhone(call.peer_number)}</p>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="mb-2 text-center text-2xl font-light tracking-wide text-zinc-900">
          {value ? formatPhone(value) : <span className="text-zinc-300">Enter number</span>}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              aria-label={`Dial ${d}`}
              className="flex h-11 items-center justify-center rounded-full bg-zinc-100 text-lg text-zinc-900 transition hover:bg-zinc-200 active:scale-95"
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <button onClick={back} disabled={!value} aria-label="Delete digit" className="flex w-12 items-center justify-center text-zinc-400 hover:text-zinc-600 disabled:opacity-0">
            <Delete className="h-5 w-5" />
          </button>
          <button
            onClick={placeCall}
            disabled={!value}
            aria-label="Call number"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-400 active:scale-95 disabled:opacity-40"
          >
            <Phone className="h-5 w-5" />
          </button>
          <div className="w-12" />
        </div>
      </div>
    </div>
  );
}