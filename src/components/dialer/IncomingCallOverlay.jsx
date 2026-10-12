import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Voicemail } from "lucide-react";
import { formatPhone } from "@/lib/phoneUtils";
import { acceptCall, declineCall, endCall } from "@/lib/callActions";
import { playRingtone } from "@/lib/ringtones";
import { useMyExtension } from "@/hooks/useMyExtension";
import SimulatedBadge from "@/components/ui/SimulatedBadge";
import WorkspaceSelector from "@/components/workspace/WorkspaceSelector";

// Full-screen ringing overlay. Handles inbound (accept/decline/voicemail)
// and outbound (calling… with end) states. Plays the user's chosen ringtone
// for inbound calls while ringing.
export default function IncomingCallOverlay({ call }) {
  const { user } = useMyExtension();
  const stopRef = useRef(null);

  useEffect(() => {
    if (!call || call.direction !== "inbound") return;
    const soundOn = user?.sound_enabled !== false && user?.data?.sound_enabled !== false;
    const ringtone = user?.ringtone || user?.data?.ringtone || "Classic";
    if (soundOn) stopRef.current = playRingtone(ringtone);
    return () => stopRef.current?.();
  }, [call?.id, user]);

  if (!call) return null;
  const isInbound = call.direction === "inbound";

  const stopRing = () => stopRef.current?.();
  const handleAccept = async () => { stopRing(); await acceptCall(call); };
  const handleDecline = async () => { stopRing(); await declineCall(call, { leaveVoicemail: false }); };
  const handleVoicemail = async () => { stopRing(); await declineCall(call, { leaveVoicemail: true }); };
  const handleEnd = async () => { stopRing(); await endCall(call); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950/95 px-6 py-12 text-white backdrop-blur">
      <div className="flex flex-col items-center gap-3 pt-10">
        <WorkspaceSelector />
        <SimulatedBadge />
        <p className="text-sm font-medium text-zinc-400">
          {isInbound ? "Incoming call" : "Calling…"} · ext {call.extension_number}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-3xl font-semibold ring-1 ring-white/20">
          {(call.peer_name || "?").slice(0, 1).toUpperCase()}
        </div>
        <h2 className="mt-4 text-2xl font-semibold">{call.peer_name || "Unknown"}</h2>
        <p className="text-lg text-zinc-300">{formatPhone(call.peer_number)}</p>
      </div>

      <div className="flex w-full max-w-sm justify-center">
        {isInbound ? (
          <div className="flex items-center justify-between gap-4">
            <button onClick={handleDecline} className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full bg-red-500/90 text-white transition hover:bg-red-500">
              <PhoneOff className="h-6 w-6" /><span className="text-[10px] font-medium">Decline</span>
            </button>
            <button onClick={handleVoicemail} className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <Voicemail className="h-6 w-6" /><span className="text-[10px] font-medium">Voicemail</span>
            </button>
            <button onClick={handleAccept} className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full bg-green-500 text-white transition hover:bg-green-400">
              <Phone className="h-6 w-6" /><span className="text-[10px] font-medium">Accept</span>
            </button>
          </div>
        ) : (
          <button onClick={handleEnd} className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full bg-red-500 text-white transition hover:bg-red-400">
            <PhoneOff className="h-6 w-6" /><span className="text-[10px] font-medium">End</span>
          </button>
        )}
      </div>
    </div>
  );
}