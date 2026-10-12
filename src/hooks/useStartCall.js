import { useMyExtension } from "@/hooks/useMyExtension";
import { startOutboundCall } from "@/lib/callActions";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";
import { reportDemoError } from "@/lib/demoErrors";

// Shared "start a call" action for any page. Keeps the user+extension lookup
// in one place so pages don't each repeat it.
export function useStartCall() {
  const { user, extension } = useMyExtension();
  const workspace = useWorkspace();
  return async (number, name) => {
    if (!user || !number || !isCurrentWorkspace(workspace)) return;
    try {
      await startOutboundCall({ user, extension, peerNumber: number, peerName: name });
    } catch (e) {
      reportDemoError(e);
    }
  };
}