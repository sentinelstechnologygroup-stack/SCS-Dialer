import { useState } from "react";
import { Phone, Network, Route, Users, BarChart3, LayoutDashboard } from "lucide-react";
import ExtensionsManager from "@/components/admin/ExtensionsManager";
import DepartmentsManager from "@/components/admin/DepartmentsManager";
import RoutingManager from "@/components/admin/RoutingManager";
import StaffManager from "@/components/admin/StaffManager";
import CallHistoryPanel from "@/components/admin/CallHistoryPanel";
import OverviewPanel from "@/components/admin/OverviewPanel";
import SimulatedBadge from "@/components/ui/SimulatedBadge";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "extensions", label: "Extensions", icon: Phone },
  { id: "departments", label: "Departments", icon: Network },
  { id: "routing", label: "Routing", icon: Route },
  { id: "staff", label: "Staff", icon: Users },
  { id: "history", label: "Call history", icon: BarChart3 },
];

export default function AdminConsole() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500">Manage your phone system</p>
        </div>
        <SimulatedBadge />
      </header>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-200 bg-white px-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition ${
                active ? "border-indigo-600 font-medium text-indigo-600" : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {tab === "overview" && <OverviewPanel />}
        {tab === "extensions" && <ExtensionsManager />}
        {tab === "departments" && <DepartmentsManager />}
        {tab === "routing" && <RoutingManager />}
        {tab === "staff" && <StaffManager />}
        {tab === "history" && <CallHistoryPanel />}
      </div>
    </div>
  );
}