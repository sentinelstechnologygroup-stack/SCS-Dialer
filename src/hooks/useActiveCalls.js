import { useEffect, useState, useCallback } from "react";
import { callAdapter } from "@/services/adapters";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";

export function useActiveCalls({ all = false, userId } = {}) {
  const workspace = useWorkspace();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const items = await callAdapter.listActive({ all, userId }, workspace);
      if (isCurrentWorkspace(workspace)) setCalls(items);
    } finally { if (isCurrentWorkspace(workspace)) setLoading(false); }
  }, [all, userId, workspace]);
  useEffect(() => {
    let mounted = true;
    const update = () => { if (mounted && isCurrentWorkspace(workspace)) refresh(); };
    update();
    const unsubscribe = callAdapter.subscribe(update, workspace);
    return () => { mounted = false; unsubscribe(); };
  }, [refresh, workspace]);
  return { calls, loading, refresh };
}