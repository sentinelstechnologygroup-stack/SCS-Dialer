import { useState, useEffect } from "react";
import ConversationList from "@/components/dialer/ConversationList";
import ConversationView from "@/components/dialer/ConversationView";

export default function MessagesTab({ initialConv, onConsumed }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (initialConv) {
      setActive(initialConv);
      onConsumed?.();
    }
  }, [initialConv]);

  if (active) {
    return (
      <ConversationView
        key={active.peerNumber}
        peerNumber={active.peerNumber}
        peerName={active.peerName}
        onBack={() => setActive(null)}
      />
    );
  }
  return <ConversationList onOpen={(n, name) => setActive({ peerNumber: n, peerName: name })} />;
}