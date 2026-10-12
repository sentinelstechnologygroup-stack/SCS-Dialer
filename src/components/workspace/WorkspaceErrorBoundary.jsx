import { Component } from "react";
import WorkspaceSelector from "@/components/workspace/WorkspaceSelector";

export default class WorkspaceErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="mx-auto max-w-lg space-y-4 p-6 text-foreground">
      <WorkspaceSelector />
      <h1 className="text-lg font-semibold">Demo workspace could not load</h1>
      <p role="alert">{this.state.error.message}</p>
      <p className="text-sm text-muted-foreground">Existing data has not been replaced. Enable browser storage or switch workspaces, then retry.</p>
      <button onClick={() => this.setState({ error: null })} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Retry loading</button>
    </div>;
  }
}