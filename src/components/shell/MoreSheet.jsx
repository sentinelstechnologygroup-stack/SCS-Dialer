import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { SECONDARY_SECTIONS } from "@/components/shell/navSections";

// Mobile "More" sheet — secondary navigation not shown in the bottom tabs.
export default function MoreSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full rounded-t-2xl bg-white p-3 pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between px-2 pt-1">
          <p className="text-sm font-semibold text-zinc-900">More</p>
          <button onClick={onClose} aria-label="Close more menu" className="rounded p-1 text-zinc-400 hover:bg-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SECONDARY_SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <NavLink
                key={s.id}
                to={s.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50 font-medium text-indigo-700"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`
                }
              >
                <Icon className="h-6 w-6" />
                {s.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}