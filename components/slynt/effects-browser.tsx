import { ListFilter, Plus } from "lucide-react";
import type { Effect, EffectCategory, Icon } from "@/types/editor";
import { EffectCard } from "./effect-card";
import { EffectTabs } from "./effect-tabs";

type EffectsBrowserProps = {
  activeCategory: EffectCategory;
  effects: Effect[];
  selectedEffectId: string;
  setActiveCategory: (category: EffectCategory) => void;
  setSelectedEffect: (effect: Effect) => void;
};

export function EffectsBrowser({
  activeCategory,
  effects,
  selectedEffectId,
  setActiveCategory,
  setSelectedEffect,
}: EffectsBrowserProps) {
  return (
    <section className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Effects
          </p>
          <h2 className="text-sm font-medium text-white">
            Browser and presets
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <IconButton icon={ListFilter} label="Filter effects" />
          <button
            className="flex h-9 items-center gap-2 rounded-[7px] border border-[var(--border)] px-3 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-white"
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            Add layer
          </button>
        </div>
      </div>

      <EffectTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {effects.map((effect) => (
          <EffectCard
            effect={effect}
            key={effect.id}
            selected={selectedEffectId === effect.id}
            setSelectedEffect={setSelectedEffect}
          />
        ))}
      </div>
    </section>
  );
}

function IconButton({ icon: IconComponent, label }: { icon: Icon; label: string }) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-white"
      title={label}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
    </button>
  );
}
