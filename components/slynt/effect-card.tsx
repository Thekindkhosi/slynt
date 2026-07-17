import { Check } from "lucide-react";
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
  return (
    <button
      className={cn(
        "group relative min-h-40 rounded-[8px] border bg-[var(--surface-secondary)] p-2 text-left transition",
        selected
          ? "border-[var(--accent)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]",
      )}
      onClick={() => setSelectedEffect(effect)}
      type="button"
    >
      <Thumbnail effect={effect} />
      <div className="mt-3 flex items-center justify-between gap-2 px-1 pb-1">
        <span className="truncate text-[13px] font-medium text-white">
          {effect.name}
        </span>
        {selected ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
    </button>
  );
}

function Thumbnail({ effect }: { effect: Effect }) {
  const IconComponent = effect.icon;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[7px] border border-white/10 bg-[#070709]">
      <div className={thumbnailBackground(effect.id)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.12),transparent_42%)]" />
      <ThumbnailShape effect={effect} />
      <IconComponent
        className="absolute right-2 top-2 h-4 w-4 text-white/35"
        strokeWidth={1.8}
      />
    </div>
  );
}

function ThumbnailShape({ effect }: { effect: Effect }) {
  if (effect.category === "audio-reactives") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-16 w-16 rounded-full border border-cyan-300/40">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              className="absolute left-1/2 top-1/2 h-6 w-px origin-bottom rounded-full bg-[var(--accent)]"
              key={index}
              style={{
                backgroundColor: index < 9 ? "#8b5cf6" : "#38bdf8",
                transform: `rotate(${index * 20}deg) translateY(-34px)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (effect.category === "track-progress") {
    return (
      <div className="absolute inset-x-5 bottom-6">
        <div className="h-px rounded-full bg-white/15">
          <div className="h-px w-2/3 rounded-full bg-[var(--accent)]" />
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 8 }, (_, index) => (
            <span
              className={cn(
                "h-1 flex-1 rounded-full",
                index < 5 ? "bg-cyan-300/60" : "bg-white/10",
              )}
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (effect.category === "playlist") {
    return (
      <div className="absolute left-5 right-5 top-5 space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="flex items-center gap-2" key={index}>
            <span className="h-5 w-5 rounded-[4px] bg-white/10" />
            <span
              className={cn(
                "h-1.5 rounded-full",
                index === 0 ? "w-24 bg-[var(--accent)]" : "w-16 bg-white/14",
              )}
            />
          </div>
        ))}
      </div>
    );
  }

  if (effect.category === "cover") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "h-16 w-16 border border-white/20 bg-[linear-gradient(135deg,rgba(139,92,246,0.5),rgba(56,189,248,0.22))]",
            effect.id === "center-circle" ? "rounded-full" : "rounded-[8px]",
            effect.id === "left-cover" && "translate-x-[-34px]",
            effect.id === "blurred-cover" && "blur-sm",
          )}
        />
      </div>
    );
  }

  if (effect.category === "text") {
    return (
      <div className="absolute left-5 right-5 top-8 space-y-3">
        <div className="h-2 w-28 rounded-full bg-white/65" />
        <div className="h-1.5 w-20 rounded-full bg-[var(--accent)]" />
        <div className="h-1 w-16 rounded-full bg-white/20" />
      </div>
    );
  }

  if (effect.category === "logo") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "h-12 w-12 rotate-45 border border-[var(--accent)] bg-[var(--accent-soft)]",
            effect.id === "bottom-left-logo" && "translate-x-[-44px] translate-y-8",
            effect.id === "bottom-right-logo" && "translate-x-44 translate-y-8",
            effect.id === "watermark" && "opacity-30",
          )}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-16 w-28 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_64%)]" />
    </div>
  );
}

function thumbnailBackground(id: string) {
  if (id === "black" || id === "none") {
    return "absolute inset-0 bg-black";
  }

  if (id.includes("gradient")) {
    return "absolute inset-0 bg-[linear-gradient(135deg,#050506,#15151b_48%,#080810)]";
  }

  if (id.includes("particles")) {
    return "absolute inset-0 bg-[radial-gradient(circle_at_30%_34%,rgba(139,92,246,0.28),transparent_22%),radial-gradient(circle_at_70%_56%,rgba(56,189,248,0.16),transparent_18%),#050506]";
  }

  if (id.includes("waves")) {
    return "absolute inset-0 bg-[repeating-linear-gradient(160deg,rgba(139,92,246,0.22)_0_1px,transparent_1px_12px),#050506]";
  }

  return "absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(139,92,246,0.28),transparent_30%),radial-gradient(circle_at_70%_62%,rgba(56,189,248,0.12),transparent_22%),#050506]";
}
