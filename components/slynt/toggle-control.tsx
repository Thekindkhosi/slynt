import type { Icon } from "@/types/editor";
import { cn } from "./utils";

type ToggleControlProps = {
  active?: boolean;
  icon: Icon;
  label: string;
  onClick?: () => void;
};

export function ToggleControl({
  active = false,
  icon: IconComponent,
  label,
  onClick,
}: ToggleControlProps) {
  return (
    <button
      className={cn(
        "flex min-h-20 flex-col items-start justify-between rounded-[8px] border p-3 text-left text-xs transition",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:text-white",
      )}
      onClick={onClick}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
