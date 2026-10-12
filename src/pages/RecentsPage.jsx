import RecentsList from "@/components/dialer/RecentsList";
import { useStartCall } from "@/hooks/useStartCall";

export default function RecentsPage() {
  const handleCall = useStartCall();
  return (
    <div className="h-full overflow-y-auto">
      <RecentsList onCall={handleCall} />
    </div>
  );
}