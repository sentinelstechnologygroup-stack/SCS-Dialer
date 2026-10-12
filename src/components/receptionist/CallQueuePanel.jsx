import { useState } from "react";
import { Phone, PhoneOff, Pause, ArrowRightLeft, UserCheck } from "lucide-react";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { formatPhone } from "@/lib/phoneUtils";
import { endCall, parkCall, transferCall } from "@/lib/callActions";

const STATUS_STYLE = {
  ringing: "bg-amber-100 text-amber-700",
  connected: "bg-green-100 text-green-700",
  on_hold: "bg-zinc-100 text-zinc-600",
  parked: "bg-indigo-100 text-indigo-700",
};

export default function CallQueuePanel({ calls, extensions, receptionistUserId }) {
  const demo = useDemoEntities();
  const [transferFor, setTransferFor] = useState(null);

  const take = async (call) => {
    await demo.CallLog.update(call.id, {
      assigned_user_id: receptionistUserId,
      assigned_user_name: "Receptionist",
      status: "connected",
      started_at: call.started_at || new Date().toISOString(),
    });
  };

  const doTransfer = async (call, ext) => {
    await transferCall(call, ext);
    setTransferFor(null);
  };

  if (!calls.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
        <Phone className="h-8 w-8" />
        <p className="text-sm">No active calls in the queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {calls.map((call) => {
        const isTransfer = transferFor === call.id;
        const others = extensions.filter((e) => e.assigned_user_id && e.assigned_user_id !== call.assigned_user_id);
        return (
          <div key={call.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">{call.peer_name || "Unknown"}</p>
                <p className="text-xs text-zinc-500">{formatPhone(call.peer_number)}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLE[call.status] || "bg-zinc-100"}`}>
                {call.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              ext {call.extension_number} · {call.assigned_user_name || "Unassigned"}
            </p>

            {isTransfer ? (
              <div className="mt-3 rounded-lg bg-zinc-50 p-2">
                <p className="mb-1 px-1 text-[11px] font-medium text-zinc-500">Transfer to…</p>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {others.length === 0 && <p className="px-2 py-1 text-xs text-zinc-400">No other extensions.</p>}
                  {others.map((ext) => (
                    <button
                      key={ext.id}
                      onClick={() => doTransfer(call, ext)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-white"
                    >
                      <span>{ext.assigned_user_name || ext.label}</span>
                      <span className="text-zinc-400">ext {ext.number}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setTransferFor(null)} className="mt-1 w-full text-center text-xs text-zinc-400 hover:text-zinc-600">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {call.status === "ringing" && (
                  <Action onClick={() => take(call)} icon={UserCheck} label="Take" tone="green" />
                )}
                <Action onClick={() => setTransferFor(call.id)} icon={ArrowRightLeft} label="Transfer" />
                {call.status === "connected" && (
                  <Action onClick={() => parkCall(call)} icon={Pause} label="Park" />
                )}
                <Action onClick={() => endCall(call)} icon={PhoneOff} label="End" tone="red" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Action({ icon: Icon, label, onClick, tone }) {
  const tones = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    red: "bg-red-50 text-red-700 hover:bg-red-100",
    default: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${tones[tone] || tones.default}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}