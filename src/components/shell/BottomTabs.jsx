import { NavLink } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { PRIMARY_SECTIONS } from "@/components/shell/navSections";

// Mobile bottom tab bar — shows the 5 primary sections + a More button that
// opens the secondary sections in a sheet.
export default function BottomTabs({ onMore }) {
  return (
    <nav className="flex shrink-0 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {PRIMARY_SECTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <NavLink
            key={s.id}
            to={s.path}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                isActive ? "text-indigo-600" : "text-zinc-400"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {s.label}
          </NavLink>
        );
      })}
      <button
        onClick={onMore}
        aria-label="More navigation"
        className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] text-zinc-400"
      >
        <MoreHorizontal className="h-5 w-5" />
        More
      </button>
    </nav>
  );
}