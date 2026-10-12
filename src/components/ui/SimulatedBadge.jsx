import { Radio } from "lucide-react";

// Small pill that labels simulated calls / data throughout the prototype.
export default function SimulatedBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 ${className}`}
    >
      <Radio className="h-2.5 w-2.5" />
      Simulated
    </span>
  );
}