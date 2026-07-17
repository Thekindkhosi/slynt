"use client";

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
import { useState } from "react";
import type { ControlValues, Effect, ExportValues, Icon } from "@/types/editor";
import { ControlSection } from "./control-section";
import { ExportSettings } from "./export-settings";
import { RangeControl } from "./range-control";
import { ToggleControl } from "./toggle-control";
import { cn } from "./utils";

type ControlSidebarProps = {
  effect: Effect;
  controlValues: ControlValues;
  exportValues: ExportValues;
  setControlValues: (values: ControlValues) => void;
  setExportValues: (values: ExportValues) => void;
  setTransparent: (value: boolean) => void;
  transparent: boolean;
};

type SidebarTabId = "effect" | "scene";

export function ControlSidebar({
  effect,
  controlValues,
  exportValues,
  setControlValues,
  setExportValues,
  setTransparent,
  transparent,
}: ControlSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTabId>("effect");
  const updateValue = (key: keyof ControlValues, value: number | boolean) => {
    setControlValues({ ...controlValues, [key]: value });
  };

  return (
    <aside className="flex min-h-0 flex-col rounded-[10px] border border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
      <div className="grid grid-cols-2 border-b border-[var(--border-subtle)] p-1">
        <SidebarTab
          active={activeTab === "effect"}
          label="EFFECT CONTROLS"
          onClick={() => setActiveTab("effect")}
        />
        <SidebarTab
          active={activeTab === "scene"}
          label="SCENE & EXPORT"
          onClick={() => setActiveTab("scene")}
        />
      </div>

      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Inspector
          </p>
          <h2 className="text-sm font-medium text-white">{effect.name}</h2>
        </div>
        <IconButton icon={MoreHorizontal} label="More options" />
      </div>

      <div className="flex-1 space-y-4 p-4">
        {activeTab === "effect" ? (
          <>
            <ControlSection icon={SlidersHorizontal} title="Effect Controls">
              <RangeControl
                label="Intensity"
                onChange={(value) => updateValue("intensity", value)}
                value={controlValues.intensity}
              />
              <RangeControl
                label="Sensitivity"
                onChange={(value) => updateValue("sensitivity", value)}
                value={controlValues.sensitivity}
              />
              <RangeControl
                label="Bar Height"
                onChange={(value) => updateValue("barHeight", value)}
                value={controlValues.barHeight}
              />
              <RangeControl
                label="Speed"
                onChange={(value) => updateValue("speed", value)}
                value={controlValues.speed}
              />
              <RangeControl
                label="Smoothing"
                onChange={(value) => updateValue("smoothing", value)}
                value={controlValues.smoothing}
              />
              <RangeControl
                label="Density"
                onChange={(value) => updateValue("density", value)}
                value={controlValues.density}
              />
            </ControlSection>

            <ControlSection icon={Wand2} title="Reactive Mapping">
              <div className="grid grid-cols-2 gap-2">
                <ToggleControl active icon={Zap} label="Beat sync" />
                <ToggleControl
                  active={controlValues.glowEnabled}
                  icon={RotateCcw}
                  label="Glow"
                  onClick={() =>
                    updateValue("glowEnabled", !controlValues.glowEnabled)
                  }
                />
                <ToggleControl active icon={Gauge} label="Peak hold" />
                <ToggleControl icon={Lock} label="Lock seed" />
              </div>
              <div className="mt-4">
                <RangeControl
                  label="Glow Intensity"
                  onChange={(value) => updateValue("glowIntensity", value)}
                  value={controlValues.glowIntensity}
                />
                <RangeControl
                  label="Glow Blur"
                  onChange={(value) => updateValue("glowBlur", value)}
                  value={controlValues.glowBlur}
                />
              </div>
            </ControlSection>
          </>
        ) : (
          <>
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
                exportValues={exportValues}
                setExportValues={setExportValues}
              />
            </ControlSection>
          </>
        )}
      </div>
    </aside>
  );
}

function SidebarTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-[7px] px-3 py-2 text-[11px] font-semibold tracking-[0.08em] transition",
        active
          ? "bg-[var(--surface-hover)] text-white"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
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
