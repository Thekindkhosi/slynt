import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Effect, EffectCategory } from "@/types/editor";
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
  const [searchTerm, setSearchTerm] = useState("");
  const visibleEffects = useMemo(
    () =>
      effects.filter((effect) =>
        effect.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      ),
    [effects, searchTerm],
  );

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
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
          <input
            className="h-9 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search effects"
            type="search"
            value={searchTerm}
          />
        </div>
      </div>

      <EffectTabs
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleEffects.map((effect) => (
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
