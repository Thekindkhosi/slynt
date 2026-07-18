import {
  AudioWaveform,
  CircleGauge,
  Diamond,
  Image,
  ImageIcon,
  ListMusic,
  Type,
} from "lucide-react";
import type { EffectCategory } from "@/types/editor";
import { categories } from "@/data/effects";
import { cn } from "./utils";

type EffectTabsProps = {
  activeCategory: EffectCategory;
  setActiveCategory: (category: EffectCategory) => void;
};

const tabMeta: Record<
  EffectCategory,
  {
    icon: typeof Image;
    label: string;
  }
> = {
  background: {
    icon: Image,
    label: "Background",
  },
  "audio-reactives": {
    icon: AudioWaveform,
    label: "Audio Reactives",
  },
  "track-progress": {
    icon: CircleGauge,
    label: "Track Progress",
  },
  playlist: {
    icon: ListMusic,
    label: "Playlist",
  },
  cover: {
    icon: ImageIcon,
    label: "Cover",
  },
  text: {
    icon: Type,
    label: "Text",
  },
  logo: {
    icon: Diamond,
    label: "Logo",
  },
};

export function EffectTabs({
  activeCategory,
  setActiveCategory,
}: EffectTabsProps) {
  return (
    <div className="border-b border-[var(--border-subtle)] px-3 sm:px-4">
      <div aria-label="Effect categories" className="flex gap-1 overflow-x-auto" role="tablist">
        {categories.map((category) => {
          const active = activeCategory === category;
          const IconComponent = tabMeta[category].icon;

          return (
            <button
              aria-selected={active}
              className={cn(
                "relative flex min-h-10 shrink-0 items-center gap-2 rounded-t-[7px] px-3 py-2.5 text-xs font-medium transition",
                active
                  ? "bg-[var(--surface-hover)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-secondary)]",
              )}
              key={category}
              onClick={() => setActiveCategory(category)}
              role="tab"
              type="button"
            >
              <IconComponent className="h-4 w-4" />
              {tabMeta[category].label}
              {active ? (
                <span className="absolute bottom-0 left-3 right-3 h-px bg-white" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
