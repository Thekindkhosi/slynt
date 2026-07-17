import { Image, Palette, Plus, SlidersHorizontal, Upload, X } from "lucide-react";
import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type {
  BackgroundValues,
  EffectCategory,
  GradientStop,
} from "@/types/editor";
import { cn } from "./utils";
import { ControlSection } from "./control-section";
import { RangeControl } from "./range-control";
import { SelectControl } from "./select-control";

type ControlSidebarProps = {
  activeCategory: EffectCategory;
  backgroundValues: BackgroundValues;
  onBackgroundImageUpload: (file: File) => void;
  setBackgroundValues: Dispatch<SetStateAction<BackgroundValues>>;
};

export function ControlSidebar({
  activeCategory,
  backgroundValues,
  onBackgroundImageUpload,
  setBackgroundValues,
}: ControlSidebarProps) {
  if (activeCategory !== "background") {
    return (
      <aside className="flex min-h-0 flex-col rounded-[10px] border border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)]">
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-[var(--text-secondary)]">
          Please select the effect you want
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-0 flex-col rounded-[10px] border border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)]">
      <div className="border-b border-[var(--border-subtle)] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Controls
        </p>
        <h2 className="text-sm font-medium text-white">Background</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {backgroundValues.mode === "image" ? (
          <ImageBackgroundControls
            backgroundValues={backgroundValues}
            onBackgroundImageUpload={onBackgroundImageUpload}
            setBackgroundValues={setBackgroundValues}
          />
        ) : (
          <GradientBackgroundControls
            backgroundValues={backgroundValues}
            setBackgroundValues={setBackgroundValues}
          />
        )}
      </div>
    </aside>
  );
}

function ImageBackgroundControls({
  backgroundValues,
  onBackgroundImageUpload,
  setBackgroundValues,
}: {
  backgroundValues: BackgroundValues;
  onBackgroundImageUpload: (file: File) => void;
  setBackgroundValues: Dispatch<SetStateAction<BackgroundValues>>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { image } = backgroundValues;

  const updateImage = (values: Partial<BackgroundValues["image"]>) => {
    setBackgroundValues((current) => ({
      ...current,
      image: {
        ...current.image,
        ...values,
      },
    }));
  };

  return (
    <>
      <ControlSection icon={Upload} title="Upload">
        <input
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onBackgroundImageUpload(file);
            }
            event.target.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] bg-[#070709] text-sm font-medium text-white transition hover:border-[var(--accent)]"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Upload image
        </button>
      </ControlSection>

      <ControlSection icon={Image} title="Preview">
        <div className="aspect-video overflow-hidden rounded-[7px] border border-[var(--border)] bg-[#050506]">
          {image.url ? (
            <div
              aria-label={
                image.name ? `Preview of ${image.name}` : "Background preview"
              }
              className="h-full w-full bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${image.url})` }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
              No image selected
            </div>
          )}
        </div>
        {image.name ? (
          <p className="mt-2 truncate text-xs text-[var(--text-secondary)]">
            {image.name}
          </p>
        ) : null}
      </ControlSection>

      <ControlSection icon={SlidersHorizontal} title="Image editing">
        <div className="space-y-4">
          <SelectControl
            label="Fit"
            onChange={(value) =>
              updateImage({ fit: value as BackgroundValues["image"]["fit"] })
            }
            options={["cover", "contain", "fill"]}
            value={image.fit}
          />
          <RangeControl
            label="Scale"
            max={160}
            min={60}
            onChange={(value) => updateImage({ scale: value })}
            value={image.scale}
          />
          <RangeControl
            label="Position X"
            onChange={(value) => updateImage({ positionX: value })}
            value={image.positionX}
          />
          <RangeControl
            label="Position Y"
            onChange={(value) => updateImage({ positionY: value })}
            value={image.positionY}
          />
          <RangeControl
            label="Opacity"
            onChange={(value) => updateImage({ opacity: value })}
            value={image.opacity}
          />
          <RangeControl
            label="Brightness"
            max={160}
            min={40}
            onChange={(value) => updateImage({ brightness: value })}
            value={image.brightness}
          />
          <RangeControl
            label="Contrast"
            max={180}
            min={40}
            onChange={(value) => updateImage({ contrast: value })}
            value={image.contrast}
          />
          <RangeControl
            label="Blur"
            max={24}
            onChange={(value) => updateImage({ blur: value })}
            suffix="px"
            value={image.blur}
          />
        </div>
      </ControlSection>
    </>
  );
}

function GradientBackgroundControls({
  backgroundValues,
  setBackgroundValues,
}: {
  backgroundValues: BackgroundValues;
  setBackgroundValues: Dispatch<SetStateAction<BackgroundValues>>;
}) {
  const [showColorCreator, setShowColorCreator] = useState(false);
  const [draftColor, setDraftColor] = useState("#22c55e");
  const stops = backgroundValues.gradient.stops;
  const activeStop = useMemo(
    () =>
      stops.find((stop) => stop.id === backgroundValues.gradient.activeStopId) ??
      stops[0],
    [backgroundValues.gradient.activeStopId, stops],
  );

  const addStop = () => {
    const color = normalizeHex(draftColor);

    if (!color) {
      return;
    }

    const id = `stop-${Date.now()}`;
    setBackgroundValues((current) => ({
      ...current,
      gradient: {
        activeStopId: id,
        stops: [
          ...current.gradient.stops,
          {
            id,
            blur: 20,
            color,
            positionX: 50,
            positionY: 50,
            size: 34,
          },
        ],
      },
    }));
    setShowColorCreator(false);
  };

  const updateActiveStop = (values: Partial<GradientStop>) => {
    if (!activeStop) {
      return;
    }

    setBackgroundValues((current) => ({
      ...current,
      gradient: {
        ...current.gradient,
        stops: current.gradient.stops.map((stop) =>
          stop.id === activeStop.id ? { ...stop, ...values } : stop,
        ),
      },
    }));
  };

  const removeActiveStop = () => {
    if (!activeStop || stops.length <= 1) {
      return;
    }

    setBackgroundValues((current) => {
      const nextStops = current.gradient.stops.filter(
        (stop) => stop.id !== activeStop.id,
      );

      return {
        ...current,
        gradient: {
          activeStopId: nextStops[0].id,
          stops: nextStops,
        },
      };
    });
  };

  return (
    <>
      <ControlSection icon={Palette} title="Palette">
        <div className="flex flex-wrap gap-2">
          {stops.map((stop) => {
            const active = stop.id === activeStop?.id;

            return (
              <button
                aria-label={`Select ${stop.color}`}
                className={cn(
                  "h-10 w-10 rounded-full border transition",
                  active
                    ? "border-white shadow-[0_0_0_3px_rgba(139,92,246,0.32)]"
                    : "border-white/15 hover:border-white/45",
                )}
                key={stop.id}
                onClick={() =>
                  setBackgroundValues((current) => ({
                    ...current,
                    gradient: {
                      ...current.gradient,
                      activeStopId: stop.id,
                    },
                  }))
                }
                style={{ backgroundColor: stop.color }}
                type="button"
              />
            );
          })}

          <button
            aria-expanded={showColorCreator}
            aria-label="Add color"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-[var(--border)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-white"
            onClick={() => setShowColorCreator((current) => !current)}
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showColorCreator ? (
          <div className="mt-4 rounded-[7px] border border-[var(--border)] bg-[#070709] p-3">
            <div className="flex gap-2">
              <input
                aria-label="Pick gradient color"
                className="h-10 w-12 shrink-0 rounded-[7px] border border-[var(--border)] bg-transparent p-1"
                onChange={(event) => setDraftColor(event.target.value)}
                type="color"
                value={normalizeHex(draftColor) ?? "#22c55e"}
              />
              <input
                aria-label="Gradient color hex"
                className="h-10 min-w-0 flex-1 rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 font-mono text-sm uppercase text-white outline-none focus:border-[var(--accent)]"
                onChange={(event) => setDraftColor(event.target.value)}
                value={draftColor}
              />
              <button
                className="flex h-10 w-10 items-center justify-center rounded-[7px] bg-[var(--accent)] text-white"
                onClick={addStop}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </ControlSection>

      {activeStop ? (
        <ControlSection icon={SlidersHorizontal} title="Selected color">
          <div className="mb-4 flex items-center gap-3">
            <input
              aria-label="Selected color"
              className="h-10 w-12 rounded-[7px] border border-[var(--border)] bg-transparent p-1"
              onChange={(event) => updateActiveStop({ color: event.target.value })}
              type="color"
              value={activeStop.color}
            />
            <input
              aria-label="Selected color hex"
              className="h-10 min-w-0 flex-1 rounded-[7px] border border-[var(--border)] bg-[#070709] px-3 font-mono text-sm uppercase text-white outline-none focus:border-[var(--accent)]"
              onChange={(event) => {
                const color = normalizeHex(event.target.value);
                if (color) {
                  updateActiveStop({ color });
                }
              }}
              value={activeStop.color}
            />
            <button
              aria-label="Remove selected color"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[var(--border)] text-[var(--text-secondary)] transition hover:border-red-400/50 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={stops.length <= 1}
              onClick={removeActiveStop}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <RangeControl
            label="Color size"
            max={100}
            min={10}
            onChange={(value) => updateActiveStop({ size: value })}
            value={activeStop.size}
          />
          <RangeControl
            label="Position X"
            onChange={(value) => updateActiveStop({ positionX: value })}
            value={activeStop.positionX}
          />
          <RangeControl
            label="Position Y"
            onChange={(value) => updateActiveStop({ positionY: value })}
            value={activeStop.positionY}
          />
          <RangeControl
            label="Blur"
            max={60}
            onChange={(value) => updateActiveStop({ blur: value })}
            suffix="px"
            value={activeStop.blur}
          />
        </ControlSection>
      ) : null}
    </>
  );
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : null;
}
