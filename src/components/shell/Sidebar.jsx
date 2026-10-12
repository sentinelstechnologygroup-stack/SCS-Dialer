import { NavLink } from "react-router-dom";
import { ChevronLeft, Phone, X } from "lucide-react";
import { NAV_SECTIONS } from "@/components/shell/navSections";

// Collapsible desktop sidebar. Collapses to icon-only rail; expands to full
// labels. Persists the collapsed state in localStorage.
export default function Sidebar({ collapsed, onToggleCollapse, onClose }) {
  return (
    <aside
      className={`hidden md:flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Phone className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-zinc-900">SCS Dialer</p>
              <p className="text-[10px] text-zinc-400">Sentinels Technology Group</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Phone className="h-4 w-4" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="md:hidden rounded p-1 text-zinc-400 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <NavLink
              key={s.id}
              to={s.path}
              title={collapsed ? s.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-indigo-50 font-medium text-indigo-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{s.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center gap-2 border-t border-zinc-200 px-3 py-3 text-xs text-zinc-500 hover:bg-zinc-50"
      >
        <ChevronLeft className={`h-4 w-4 transition ${collapsed ? "rotate-180" : ""}`} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}