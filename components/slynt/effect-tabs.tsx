import type { EffectCategory } from "@/types/editor";
import { categories } from "@/data/effects";
import { cn } from "./utils";

type EffectTabsProps = {
  activeCategory: EffectCategory;
  setActiveCategory: (category: EffectCategory) => void;
};

export function EffectTabs({
  activeCategory,
  setActiveCategory,
}: EffectTabsProps) {
  return (
    <div className="border-b border-[var(--border-subtle)] px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className={cn(
              "shrink-0 rounded-[7px] border px-4 py-2 text-xs font-medium transition",
              activeCategory === category
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-white",
            )}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
