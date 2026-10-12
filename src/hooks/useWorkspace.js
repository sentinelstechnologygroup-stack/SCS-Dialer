import { useSyncExternalStore } from "react";
import { captureWorkspace, subscribeWorkspace } from "@/lib/demoWorkspace";
export function useWorkspace() { return useSyncExternalStore(subscribeWorkspace, captureWorkspace, captureWorkspace); }