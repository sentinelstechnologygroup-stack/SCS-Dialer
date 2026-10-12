import DialPad from "@/components/dialer/DialPad";
import { useStartCall } from "@/hooks/useStartCall";

export default function KeypadPage() {
  const handleCall = useStartCall();
  return (
    <div className="h-full overflow-y-auto">
      <DialPad onCall={handleCall} />
    </div>
  );
}