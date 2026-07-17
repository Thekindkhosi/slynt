import {
  Download,
  Gauge,
  Layers3,
  Lock,
  MoreHorizontal,
  RotateCcw,
  SlidersHorizontal,
  Wand2,
  Zap,
} from "lucide-react";
import type { Effect, EffectValues, ExportPreset, Icon } from "@/types/editor";
import { ControlSection } from "./control-section";
import { ExportSettings } from "./export-settings";
import { RangeControl } from "./range-control";
import { ToggleControl } from "./toggle-control";
import { cn } from "./utils";

type ControlSidebarProps = {
  effect: Effect;
  effectValues: EffectValues;
  exportPreset: ExportPreset;
  loop: boolean;
  setEffectValues: (values: EffectValues) => void;
  setExportPreset: (preset: ExportPreset) => void;
  setLoop: (value: boolean) => void;
  setTransparent: (value: boolean) => void;
  transparent: boolean;
};

export function ControlSidebar({
  effect,
  effectValues,
  exportPreset,
  loop,
  setEffectValues,
  setExportPreset,
  setLoop,
  setTransparent,
  transparent,
}: ControlSidebarProps) {
  const updateValue = (key: keyof EffectValues, value: number) => {
    setEffectValues({ ...effectValues, [key]: value });
  };

  return (
    <aside className="flex min-h-0 flex-col rounded-[10px] border border-[var(--border)] bg-[var(--surface)] lg:max-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Inspector
          </p>
          <h2 className="text-sm font-medium text-white">{effect.name}</h2>
        </div>
        <IconButton icon={MoreHorizontal} label="More options" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <ControlSection icon={SlidersHorizontal} title="Effect Controls">
          <RangeControl
            label="Intensity"
            onChange={(value) => updateValue("intensity", value)}
            value={effectValues.intensity}
          />
          <RangeControl
            label="Motion"
            onChange={(value) => updateValue("motion", value)}
            value={effectValues.motion}
          />
          <RangeControl
            label="Bloom"
            onChange={(value) => updateValue("bloom", value)}
            value={effectValues.bloom}
          />
          <RangeControl
            label="Density"
            onChange={(value) => updateValue("density", value)}
            value={effectValues.density}
          />
        </ControlSection>

        <ControlSection icon={Wand2} title="Reactive Mapping">
          <div className="grid grid-cols-2 gap-2">
            <ToggleControl active icon={Zap} label="Beat sync" />
            <ToggleControl
              active={loop}
              icon={RotateCcw}
              label="Loop phase"
              onClick={() => setLoop(!loop)}
            />
            <ToggleControl active icon={Gauge} label="Peak hold" />
            <ToggleControl icon={Lock} label="Lock seed" />
          </div>
        </ControlSection>

        <ControlSection icon={Layers3} title="Style">
          <div className="grid grid-cols-4 gap-2">
            {["#8b5cf6", "#38bdf8", "#4ade80", "#f5f5f7"].map((color) => (
              <button
                aria-label={`Color ${color}`}
                className={cn(
                  "h-10 rounded-[7px] border transition hover:scale-[1.02]",
                  color === effect.accent
                    ? "border-white"
                    : "border-[var(--border)]",
                )}
                key={color}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>
          <label className="mt-3 flex items-center justify-between rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-3 text-sm text-[var(--text-secondary)]">
            Transparent background
            <input
              checked={transparent}
              className="h-4 w-4 accent-[var(--accent)]"
              onChange={(event) => setTransparent(event.target.checked)}
              type="checkbox"
            />
          </label>
        </ControlSection>

        <ControlSection icon={Download} title="Export Settings">
          <ExportSettings
            exportPreset={exportPreset}
            setExportPreset={setExportPreset}
          />
        </ControlSection>
      </div>
    </aside>
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
