import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MessagesTab from "@/components/dialer/MessagesTab";

export default function MessagesPage() {
  const [params, setParams] = useSearchParams();
  const [initialConv, setInitialConv] = useState(null);

  useEffect(() => {
    const peer = params.get("peer");
    if (peer) {
      setInitialConv({ peerNumber: peer, peerName: params.get("name") || "" });
    }
  }, [params]);

  const onConsumed = () => {
    setInitialConv(null);
    if (params.get("peer")) {
      params.delete("peer");
      params.delete("name");
      setParams(params, { replace: true });
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <MessagesTab initialConv={initialConv} onConsumed={onConsumed} />
    </div>
  );
}