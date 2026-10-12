import { useEffect, useState } from "react";
import { Volume2, Headphones, Bluetooth, Phone, ChevronRight, X, WifiOff, ShieldAlert, Mic } from "lucide-react";
import { probeAudioCapability, requestMicPermission } from "@/lib/audioCapability";

const QUICK = [
  { id: "speaker", label: "Speaker", icon: Volume2 },
  { id: "headset", label: "Headset", icon: Headphones },
  { id: "bluetooth", label: "Bluetooth", icon: Bluetooth },
  { id: "voip", label: "VoIP Device", icon: Phone },
];

// Capability-aware audio output picker. Probes the device honestly and
// reports offline / unsupported / no-permission / no-devices / ready states
// instead of implying a live audio bridge exists. Real routing is wired up
// at production time alongside the Telnyx audio bridge.
export default function AudioDevicePicker({ selected, onSelect, onClose }) {
  const [cap, setCap] = useState({ state: "probing", devices: [], label: "" });
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    let alive = true;
    probeAudioCapability().then((c) => { if (alive) setCap(c); });
    const onOnline = () => probeAudioCapability().then((c) => { if (alive) setCap(c); });
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline);
    return () => { alive = false; window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOnline); };
  }, []);

  const grant = async () => {
    const ok = await requestMicPermission();
    if (ok) setCap(await probeAudioCapability());
  };

  const ready = cap.state === "ready";
  const offline = cap.state === "offline";

  return (
    <div className="mx-auto mb-6 w-full max-w-md rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-medium">Audio output</span>
        <button onClick={onClose} aria-label="Close audio picker"><X className="h-4 w-4 text-zinc-400" /></button>
      </div>

      {offline && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-200">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <span>You are offline. Audio devices are unavailable until the device reconnects.</span>
        </div>
      )}

      {cap.state === "unsupported" && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>This browser does not expose audio devices. The native app build will use the device audio picker.</span>
        </div>
      )}

      {cap.state === "no-permission" && (
        <div className="mb-2 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-200">
          <p className="mb-2">{cap.label}</p>
          <button onClick={grant} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/20">
            <Mic className="h-3.5 w-3.5" /> Grant microphone access
          </button>
        </div>
      )}

      {cap.state === "no-devices" && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{cap.label}</span>
        </div>
      )}

      <div className={`grid grid-cols-2 gap-2 ${!ready ? "opacity-40" : ""}`}>
        {QUICK.map((o) => {
          const Icon = o.icon;
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              onClick={() => ready && onSelect(o.id)}
              disabled={!ready}
              aria-label={`Select ${o.label}`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                active ? "bg-white text-zinc-900" : "bg-white/10 text-white hover:bg-white/20"
              } ${!ready ? "cursor-not-allowed" : ""}`}
            >
              <Icon className="h-4 w-4" /> {o.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowMore((s) => !s)}
        disabled={!ready}
        aria-label="Toggle device list"
        className="mt-2 flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-40"
      >
        <span>More</span>
        <ChevronRight className={`h-4 w-4 transition ${showMore ? "rotate-90" : ""}`} />
      </button>

      {showMore && ready && (
        <div className="mt-2 space-y-1">
          {cap.devices.length === 0 && (
            <p className="px-2 py-1 text-xs text-zinc-400">No additional devices detected.</p>
          )}
          {cap.devices.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              aria-label={`Select ${d.label}`}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
            >
              <span className="truncate">{d.label}</span>
              {selected === d.id && <span className="text-xs text-indigo-300">Selected</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}