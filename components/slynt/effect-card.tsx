import type { Effect } from "@/types/editor";
import { cn } from "./utils";

type EffectCardProps = {
  effect: Effect;
  selected: boolean;
  setSelectedEffect: (effect: Effect) => void;
};

export function EffectCard({
  effect,
  selected,
  setSelectedEffect,
}: EffectCardProps) {
  const IconComponent = effect.icon;

  return (
    <button
      className={cn(
        "group min-h-36 rounded-[8px] border bg-[var(--surface-secondary)] p-4 text-left transition",
        selected
          ? "border-[var(--accent)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]",
      )}
      onClick={() => setSelectedEffect(effect)}
      type="button"
    >
      <div className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10"
          style={{ color: effect.accent }}
        >
          <IconComponent className="h-4 w-4" />
        </span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {effect.intensity}%
        </span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{effect.name}</h3>
      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
        {effect.description}
      </p>
    </button>
  );
}
