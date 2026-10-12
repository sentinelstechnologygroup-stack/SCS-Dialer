import { useNavigate } from "react-router-dom";
import ContactsList from "@/components/dialer/ContactsList";
import { useStartCall } from "@/hooks/useStartCall";

export default function ContactsPage() {
  const handleCall = useStartCall();
  const navigate = useNavigate();

  const openConversation = (peerNumber, peerName) => {
    const params = new URLSearchParams();
    params.set("peer", peerNumber);
    if (peerName) params.set("name", peerName);
    navigate(`/messages?${params.toString()}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <ContactsList onCall={handleCall} onMessage={openConversation} />
    </div>
  );
}