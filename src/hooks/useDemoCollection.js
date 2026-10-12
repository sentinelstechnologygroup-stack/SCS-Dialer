import { useEffect, useState } from "react";
import { ensureSeeded, subscribeCollection } from "@/lib/demoStore";
import { useWorkspace } from "@/hooks/useWorkspace";

// The enclosing workspace layout remounts all consumers on a session change.
export function useDemoCollection(name, seedFn) {
  const workspace = useWorkspace();
  const [items, setItems] = useState(() => ensureSeeded(name, seedFn, workspace));
  useEffect(() => {
    setItems(ensureSeeded(name, seedFn, workspace));
    return subscribeCollection(name, setItems, workspace);
  }, [name, seedFn, workspace]);
  return items;
}