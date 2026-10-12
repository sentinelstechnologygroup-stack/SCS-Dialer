import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import { authService } from "@scs/platform/auth";
import { useMyExtension } from "@/hooks/useMyExtension";
import { useActiveCalls } from "@/hooks/useActiveCalls";
import IncomingCallOverlay from "@/components/dialer/IncomingCallOverlay";
import ActiveCallScreen from "@/components/dialer/ActiveCallScreen";
import NotificationsMenu from "@/components/NotificationsMenu";
import SettingsSheet from "@/components/SettingsSheet";
import Sidebar from "@/components/shell/Sidebar";
import BottomTabs from "@/components/shell/BottomTabs";
import MoreSheet from "@/components/shell/MoreSheet";
import FloatingDialer from "@/components/dialer/FloatingDialer";
import WorkspaceSelector from "@/components/workspace/WorkspaceSelector";
import { staffAdapter } from "@/services/adapters";
import { useDemoEntities } from "@/hooks/useDemoEntities";
import { useWorkspace } from "@/hooks/useWorkspace";
import { isCurrentWorkspace } from "@/lib/demoWorkspace";

const ROLE_NAV = {
  employee: { to: "/keypad", label: "Dialer" },
  receptionist: { to: "/receptionist", label: "Console" },
  admin: { to: "/admin", label: "Dashboard" },
};

export default function AppShell() {
  const { user, extension, loading } = useMyExtension();
  const workspace = useWorkspace();
  const demo = useDemoEntities();
  const { calls } = useActiveCalls({ all: false, userId: user?.id });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("scs_sidebar_collapsed") === "1"
  );

  const phoneRole = user?.phone_role || user?.data?.phone_role || (user?.role === "admin" ? "admin" : "employee");
  const ringing = calls.find((c) => c.status === "ringing");
  const connected = calls.find((c) => c.status === "connected" || c.status === "on_hold" || c.status === "parked");

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("scs_sidebar_collapsed", next ? "1" : "0");
  };

  const refreshNotif = async () => {
    if (!user) return;
    try {
      const [missed, vms, msgs] = await Promise.all([
        demo.CallLog.count({ assigned_user_id: user.id, status: "missed" }),
        demo.Voicemail.count({ assigned_user_id: user.id, listened: { $ne: true } }),
        demo.Message.count({ assigned_user_id: user.id, direction: "inbound", read: { $ne: true } }),
      ]);
      if (isCurrentWorkspace(workspace)) setNotifCount(missed + vms + msgs);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refreshNotif();
    const unsub = demo.CallLog.subscribe(refreshNotif);
    const unsub2 = demo.Voicemail.subscribe(refreshNotif);
    const unsub3 = demo.Message.subscribe(refreshNotif);
    return () => {
      if (typeof unsub === "function") unsub();
      if (typeof unsub2 === "function") unsub2();
      if (typeof unsub3 === "function") unsub3();
    };
  }, [user]);

  const switchRole = async (role) => {
    setMenuOpen(false);
    await staffAdapter.update(user.id, { phone_role: role }, workspace);
    window.location.href = ROLE_NAV[role].to;
  };
  const logout = async () => { await authService.logout(); };

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-40px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-40px)] flex-col bg-zinc-50 md:flex-row">
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setShowMore(true)} aria-label="Open more menu" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white md:hidden">
              <Menu className="h-4 w-4" />
            </button>
            <span className="hidden text-sm font-semibold text-zinc-900 sm:inline md:hidden">SCS Dialer</span>
            <WorkspaceSelector />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowNotif(true)} aria-label="Notifications" className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowSettings(true)} aria-label="Settings" className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
              <Settings className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-zinc-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                  {(user?.full_name || user?.email || "?").slice(0, 1).toUpperCase()}
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
                    <div className="border-b border-zinc-100 px-4 py-3">
                      <p className="truncate text-sm font-medium text-zinc-900">{user?.full_name || user?.email}</p>
                      <p className="text-xs text-zinc-500">
                        {phoneRole}{extension ? ` · ext ${extension.number}` : ""}
                      </p>
                    </div>
                    <p className="px-4 pb-1 pt-3 text-[10px] uppercase tracking-wide text-zinc-400">View as (demo)</p>
                    {["employee", "receptionist", "admin"].map((r) => (
                      <button
                        key={r}
                        onClick={() => switchRole(r)}
                        className={`block w-full px-4 py-2 text-left text-sm capitalize hover:bg-zinc-50 ${
                          r === phoneRole ? "font-medium text-indigo-600" : "text-zinc-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      onClick={logout}
                      className="mt-1 flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>

        <BottomTabs onMore={() => setShowMore(true)} />
      </div>

      {ringing && !connected && <IncomingCallOverlay call={ringing} />}
      {connected && <ActiveCallScreen call={connected} calls={calls} />}

      <FloatingDialer />

      {showMore && <MoreSheet onClose={() => setShowMore(false)} />}
      {showNotif && <NotificationsMenu onClose={() => setShowNotif(false)} />}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  );
}