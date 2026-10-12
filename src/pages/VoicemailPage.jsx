import VoicemailList from "@/components/dialer/VoicemailList";
import { useStartCall } from "@/hooks/useStartCall";

export default function VoicemailPage() {
  const handleCall = useStartCall();
  return (
    <div className="h-full overflow-y-auto">
      <VoicemailList onCall={handleCall} />
    </div>
  );
}