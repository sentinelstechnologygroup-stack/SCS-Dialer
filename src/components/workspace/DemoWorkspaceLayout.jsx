import { useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { useWorkspace } from "@/hooks/useWorkspace";
import WorkspaceErrorBoundary from "@/components/workspace/WorkspaceErrorBoundary";
import WorkspaceErrorNotice from "@/components/workspace/WorkspaceErrorNotice";
import WorkspaceSelector from "@/components/workspace/WorkspaceSelector";

export default function DemoWorkspaceLayout() {
  const workspace = useWorkspace(); const location = useLocation(); const navigate = useNavigate();
  const [ready, setReady] = useState(workspace);
  // Remount only after old peer/selection query parameters have been cleared.
  useLayoutEffect(() => {
    if (ready === workspace) return;
    if (location.search) { navigate(location.pathname, { replace: true }); return; }
    setReady(workspace);
  }, [workspace, ready, location.pathname, location.search, navigate]);
  return <>
    {ready !== workspace ? <WorkspaceSelector /> : <WorkspaceErrorBoundary key={`${workspace.companyId}:${workspace.epoch}`}><AppShell /></WorkspaceErrorBoundary>}
    <WorkspaceErrorNotice />
  </>;
}