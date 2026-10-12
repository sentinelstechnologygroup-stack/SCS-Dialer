import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { getDemoError, subscribeDemoErrors, clearDemoError } from "@/lib/demoErrors";

export default function WorkspaceErrorNotice() {
  const message = useSyncExternalStore(subscribeDemoErrors, getDemoError, getDemoError);
  if (!message) return null;
  return <div role="alert" className="fixed inset-x-2 bottom-3 z-[60] mx-auto flex max-w-xl items-start gap-3 rounded-lg border border-destructive bg-background p-4 text-sm text-foreground shadow-lg">
    <div className="flex-1"><p className="font-semibold">Demo action not saved</p><p>{message}</p></div>
    <button onClick={clearDemoError} aria-label="Dismiss persistence error" className="rounded-md p-1 focus-visible:outline focus-visible:outline-ring"><X className="h-5 w-5" /></button>
  </div>;
}