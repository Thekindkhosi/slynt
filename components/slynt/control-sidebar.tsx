"use client";

import {
  AudioWaveform,
  ChevronDown,
  ChevronRight,
  Download,
  Image,
  Layers3,
  ListMusic,
  CircleGauge,
  MoreHorizontal,
  RotateCcw,
  SlidersHorizontal,
  Type,
  Zap,
  Diamond,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type {
  ControlValues,
  Effect,
  EffectCategory,
  ExportValues,
  Icon,
} from "@/types/editor";
import { ControlSection } from "./control-section";
import { ExportSettings } from "./export-settings";
import { RangeControl } from "./range-control";
import { SelectControl } from "./select-control";
import { ToggleControl } from "./toggle-control";
import { cn } from "./utils";

type ControlSidebarProps = {
  activeCategory: EffectCategory;
  effect: Effect;
  controlValues: ControlValues;
  exportValues: ExportValues;
  setControlValues: (values: ControlValues) => void;
  setExportValues: (values: ExportValues) => void;
  selectedVisualizer: string;
  setSelectedVisualizer: (id: string) => void;
  setTransparent: (value: boolean) => void;
  transparent: boolean;
};

type SidebarTabId = "effect" | "scene";

const visualizerTypes: Array<{
  icon: Icon;
  id: string;
  label: string;
}> = [
  { icon: AudioWaveform, id: "spectrum-bars", label: "Spectrum Bars" },
  { icon: CircleGauge, id: "circular-spectrum", label: "Circular" },
  { icon: RotateCcw, id: "radial-wave", label: "Radial" },
  { icon: AudioWaveform, id: "waveform", label: "Wave" },
];

const sectionMeta: Array<{
  category: Exclude<EffectCategory, "audio-reactives">;
  icon: Icon;
  label: string;
}> = [
  { category: "background", icon: Image, label: "Background" },
  { category: "track-progress", icon: CircleGauge, label: "Track Progress" },
  { category: "playlist", icon: ListMusic, label: "Playlist" },
  { category: "cover", icon: Image, label: "Cover" },
  { category: "text", icon: Type, label: "Text" },
  { category: "logo", icon: Diamond, label: "Logo" },
];

export function ControlSidebar({
  activeCategory,
  effect,
  controlValues,
  exportValues,
  setControlValues,
  setExportValues,
  selectedVisualizer,
  setSelectedVisualizer,
  setTransparent,
  transparent,
}: ControlSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTabId>("effect");
  const [colorStyle, setColorStyle] = useState("Dual Tone");
  const [colorGradient, setColorGradient] = useState("Violet to Cyan");
  const [openSections, setOpenSections] = useState<Record<EffectCategory, boolean>>({
    background: true,
    "audio-reactives": false,
    "track-progress": false,
    playlist: false,
    cover: false,
    text: false,
    logo: false,
  });

  const updateValue = (key: keyof ControlValues, value: number | boolean) => {
    setControlValues({ ...controlValues, [key]: value });
  };
  const toggleSection = (category: EffectCategory) => {
    setOpenSections((current) => ({
      ...current,
      [category]: !current[category],
    }));
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
            {activeCategory === "audio-reactives" ? (
              <AudioReactiveControls
                colorGradient={colorGradient}
                colorStyle={colorStyle}
                controlValues={controlValues}
                selectedVisualizer={selectedVisualizer}
                setColorGradient={setColorGradient}
                setColorStyle={setColorStyle}
                setSelectedVisualizer={setSelectedVisualizer}
                updateValue={updateValue}
              />
            ) : (
              <ControlSection icon={SlidersHorizontal} title="Category Controls">
                <p className="mb-4 text-xs leading-5 text-[var(--text-secondary)]">
                  Adjust the selected {categoryLabel(activeCategory)} layer.
                </p>
                <RangeControl
                  label="Intensity"
                  onChange={(value) => updateValue("intensity", value)}
                  value={controlValues.intensity}
                />
                <RangeControl
                  label="Speed"
                  onChange={(value) => updateValue("speed", value)}
                  value={controlValues.speed}
                />
              </ControlSection>
            )}

            <div className="space-y-2">
              {sectionMeta.map((section) => (
                <CollapsibleSection
                  icon={section.icon}
                  key={section.category}
                  label={section.label}
                  onToggle={() => toggleSection(section.category)}
                  open={openSections[section.category]}
                >
                  {section.category === "background" ? (
                    <div className="space-y-4">
                      <label className="flex items-center justify-between rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                        Transparent background
                        <input
                          checked={transparent}
                          className="h-4 w-4 accent-[var(--accent)]"
                          onChange={(event) =>
                            setTransparent(event.target.checked)
                          }
                          type="checkbox"
                        />
                      </label>
                      <RangeControl
                        label="Background Density"
                        onChange={(value) => updateValue("density", value)}
                        value={controlValues.density}
                      />
                    </div>
                  ) : (
                    <p className="text-xs leading-5 text-[var(--text-muted)]">
                      {section.label} layer settings will appear here when that
                      layer is selected.
                    </p>
                  )}
                </CollapsibleSection>
              ))}
            </div>
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

function AudioReactiveControls({
  colorGradient,
  colorStyle,
  controlValues,
  selectedVisualizer,
  setColorGradient,
  setColorStyle,
  setSelectedVisualizer,
  updateValue,
}: {
  colorGradient: string;
  colorStyle: string;
  controlValues: ControlValues;
  selectedVisualizer: string;
  setColorGradient: (value: string) => void;
  setColorStyle: (value: string) => void;
  setSelectedVisualizer: (id: string) => void;
  updateValue: (key: keyof ControlValues, value: number | boolean) => void;
}) {
  return (
    <ControlSection icon={AudioWaveform} title="AUDIO REACTIVES">
      <div className="mb-4">
        <p className="mb-2 text-xs text-[var(--text-muted)]">
          Visualizer type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {visualizerTypes.map((type) => (
            <VisualizerTypeButton
              active={selectedVisualizer === type.id}
              icon={type.icon}
              key={type.id}
              label={type.label}
              onClick={() => setSelectedVisualizer(type.id)}
            />
          ))}
        </div>
      </div>

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

      <div className="mt-4 grid gap-3">
        <SelectControl
          label="Color Style"
          onChange={setColorStyle}
          options={["Dual Tone", "Mono Violet", "Cool Cyan", "Soft White"]}
          value={colorStyle}
        />
        <SelectControl
          label="Color Gradient"
          onChange={setColorGradient}
          options={["Violet to Cyan", "Indigo to Violet", "Cyan to White"]}
          value={colorGradient}
        />
      </div>

      <div className="mt-4">
        <ToggleControl
          active={controlValues.glowEnabled}
          icon={Zap}
          label="Glow"
          onClick={() => updateValue("glowEnabled", !controlValues.glowEnabled)}
        />
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
  );
}

function VisualizerTypeButton({
  active,
  icon: IconComponent,
  label,
  onClick,
}: {
  active: boolean;
  icon: Icon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex min-h-16 flex-col items-start justify-between rounded-[8px] border p-3 text-left text-xs transition",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:text-white",
      )}
      onClick={onClick}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
      {label}
    </button>
  );
}

function CollapsibleSection({
  children,
  icon: IconComponent,
  label,
  onToggle,
  open,
}: {
  children: ReactNode;
  icon: Icon;
  label: string;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <section className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
      <button
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
        onClick={onToggle}
        type="button"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          <IconComponent className="h-4 w-4 text-[var(--accent)]" />
          {label}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        )}
      </button>
      {open ? <div className="border-t border-[var(--border-subtle)] p-3">{children}</div> : null}
    </section>
  );
}

function categoryLabel(category: EffectCategory) {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
