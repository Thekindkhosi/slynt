"use client";

import {
  Activity,
  AudioLines,
  Bell,
  ChevronDown,
  Circle,
  Clock3,
  Download,
  Gauge,
  Grid2X2,
  Layers3,
  ListFilter,
  Lock,
  Maximize2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  StepBack,
  StepForward,
  Wand2,
  Waves,
  Zap,
} from "lucide-react";
import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

type EffectCategory = "Core" | "Motion" | "Reactive" | "Texture";

type Effect = {
  id: string;
  name: string;
  category: EffectCategory;
  description: string;
  icon: Icon;
  accent: string;
  intensity: number;
  motion: number;
  bloom: number;
  density: number;
};

type ExportPreset = {
  label: string;
  value: string;
};

const categories: EffectCategory[] = ["Core", "Motion", "Reactive", "Texture"];

const effects: Effect[] = [
  {
    id: "spectral-bars",
    name: "Spectral Bars",
    category: "Core",
    description: "Balanced columns with restrained low-end lift.",
    icon: AudioLines,
    accent: "#8b5cf6",
    intensity: 72,
    motion: 54,
    bloom: 18,
    density: 64,
  },
  {
    id: "orbital-ring",
    name: "Orbital Ring",
    category: "Core",
    description: "Circular analyzer with soft phase rotation.",
    icon: Circle,
    accent: "#38bdf8",
    intensity: 66,
    motion: 68,
    bloom: 22,
    density: 48,
  },
  {
    id: "wave-field",
    name: "Wave Field",
    category: "Motion",
    description: "Layered waveform ribbons with gradual drift.",
    icon: Waves,
    accent: "#a78bfa",
    intensity: 58,
    motion: 78,
    bloom: 14,
    density: 72,
  },
  {
    id: "pulse-grid",
    name: "Pulse Grid",
    category: "Reactive",
    description: "Beat-aware cells tuned for percussion edits.",
    icon: Grid2X2,
    accent: "#4ade80",
    intensity: 80,
    motion: 46,
    bloom: 16,
    density: 58,
  },
  {
    id: "phase-trace",
    name: "Phase Trace",
    category: "Reactive",
    description: "Fine signal line with transient sparkle.",
    icon: Activity,
    accent: "#38bdf8",
    intensity: 62,
    motion: 60,
    bloom: 28,
    density: 82,
  },
  {
    id: "grain-noir",
    name: "Grain Noir",
    category: "Texture",
    description: "Matte film grain and subtle signal dust.",
    icon: Sparkles,
    accent: "#8b5cf6",
    intensity: 48,
    motion: 38,
    bloom: 10,
    density: 70,
  },
];

const exportPresets: ExportPreset[] = [
  { label: "4K UHD", value: "3840 x 2160" },
  { label: "1080p", value: "1920 x 1080" },
  { label: "Square", value: "1080 x 1080" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<EffectCategory>("Core");
  const [selectedEffectId, setSelectedEffectId] = useState(effects[0].id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(42);
  const [effectValues, setEffectValues] = useState({
    intensity: effects[0].intensity,
    motion: effects[0].motion,
    bloom: effects[0].bloom,
    density: effects[0].density,
  });
  const [exportPreset, setExportPreset] = useState(exportPresets[1]);
  const [transparent, setTransparent] = useState(false);
  const [loop, setLoop] = useState(true);

  const selectedEffect = useMemo(
    () => effects.find((effect) => effect.id === selectedEffectId) ?? effects[0],
    [selectedEffectId],
  );

  const filteredEffects = useMemo(
    () => effects.filter((effect) => effect.category === activeCategory),
    [activeCategory],
  );

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 0.35));
    }, 120);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 py-3 sm:px-6 lg:px-8">
        <TopNavigation />

        <section className="grid flex-1 gap-4 py-4 xl:grid-cols-[minmax(0,1fr)_390px] lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="flex min-w-0 flex-col gap-4">
            <PreviewPanel
              effect={selectedEffect}
              effectValues={effectValues}
              isPlaying={isPlaying}
              loop={loop}
              progress={progress}
              setIsPlaying={setIsPlaying}
              setLoop={setLoop}
              setProgress={setProgress}
            />

            <EffectsBrowser
              activeCategory={activeCategory}
              effects={filteredEffects}
              selectedEffectId={selectedEffectId}
              setActiveCategory={setActiveCategory}
              setSelectedEffect={(effect) => {
                setSelectedEffectId(effect.id);
                setEffectValues({
                  intensity: effect.intensity,
                  motion: effect.motion,
                  bloom: effect.bloom,
                  density: effect.density,
                });
              }}
            />
          </div>

          <ControlPanel
            effect={selectedEffect}
            effectValues={effectValues}
            exportPreset={exportPreset}
            loop={loop}
            setEffectValues={setEffectValues}
            setExportPreset={setExportPreset}
            setLoop={setLoop}
            setTransparent={setTransparent}
            transparent={transparent}
          />
        </section>
      </div>
    </main>
  );
}

function TopNavigation() {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface-secondary)]">
          <Waves className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-[0.24em] text-white">
            SLYNT
          </h1>
          <p className="hidden text-xs text-[var(--text-muted)] sm:block">
            Afterhours Session 07
          </p>
        </div>
      </div>

      <nav className="hidden items-center rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface)] p-1 md:flex">
        {["Edit", "Mix", "Visualize", "Export"].map((item) => (
          <button
            className={cn(
              "rounded-[7px] px-4 py-2 text-xs font-medium transition",
              item === "Visualize"
                ? "bg-[var(--surface-hover)] text-white"
                : "text-[var(--text-secondary)] hover:text-white",
            )}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <IconButton icon={Bell} label="Notifications" />
        <IconButton icon={Save} label="Save" />
        <button
          className="flex h-9 items-center gap-2 rounded-[7px] bg-white px-3 text-xs font-semibold text-black transition hover:bg-zinc-200"
          type="button"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  );
}

function PreviewPanel({
  effect,
  effectValues,
  isPlaying,
  loop,
  progress,
  setIsPlaying,
  setLoop,
  setProgress,
}: {
  effect: Effect;
  effectValues: Record<"intensity" | "motion" | "bloom" | "density", number>;
  isPlaying: boolean;
  loop: boolean;
  progress: number;
  setIsPlaying: (value: boolean) => void;
  setLoop: (value: boolean) => void;
  setProgress: (value: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Preview
          </p>
          <h2 className="truncate text-sm font-medium text-white">
            Night Signal - Visualizer Master
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Pill icon={Clock3} text="03:42" />
          <IconButton icon={Maximize2} label="Fullscreen" />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="relative aspect-video overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-black">
          <VisualizerCanvas
            accent={effect.accent}
            density={effectValues.density}
            intensity={effectValues.intensity}
            isPlaying={isPlaying}
            motion={effectValues.motion}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.11),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,rgba(0,0,0,0.36))]" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-[7px] border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Live render
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Now shaping
                </p>
                <p className="mt-1 text-xl font-semibold text-white sm:text-3xl">
                  {effect.name}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-zinc-500">Peak</p>
                <p className="font-mono text-sm text-[var(--cyan)]">-3.1 dB</p>
              </div>
            </div>
            <Timeline progress={progress} setProgress={setProgress} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <IconButton icon={StepBack} label="Back" />
          <button
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
            onClick={() => setIsPlaying(!isPlaying)}
            type="button"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )}
          </button>
          <IconButton icon={StepForward} label="Forward" />
          <button
            className={cn(
              "ml-1 flex h-9 items-center gap-2 rounded-[7px] border px-3 text-xs transition",
              loop
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:text-white",
            )}
            onClick={() => setLoop(!loop)}
            type="button"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Loop
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-[var(--text-secondary)] sm:flex sm:items-center">
          <Meter label="Bass" value="72%" />
          <Meter label="Mid" value="58%" />
          <Meter label="Air" value="41%" />
        </div>
      </div>
    </section>
  );
}

function VisualizerCanvas({
  accent,
  density,
  intensity,
  isPlaying,
  motion,
}: {
  accent: string;
  density: number;
  intensity: number;
  isPlaying: boolean;
  motion: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationId = 0;
    let frame = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#050506";
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const bars = Math.round(36 + density * 0.72);
      const maxRadius = Math.min(width, height) * 0.34;
      const pulse = isPlaying ? Math.sin(frame * 0.055) * 0.5 + 0.5 : 0.36;

      context.save();
      context.translate(centerX, centerY);
      context.rotate(frame * 0.0018 * (motion / 42));

      for (let i = 0; i < bars; i += 1) {
        const angle = (Math.PI * 2 * i) / bars;
        const wave =
          Math.sin(frame * 0.045 + i * 0.72) * 0.5 +
          Math.cos(frame * 0.028 + i * 0.33) * 0.5;
        const energy = (wave + 1.1) / 2.2;
        const length = 16 * ratio + energy * intensity * 0.82 * ratio;
        const inner = maxRadius * (0.52 + pulse * 0.035);
        const outer = inner + length;

        context.strokeStyle = i % 5 === 0 ? "#38bdf8" : accent;
        context.globalAlpha = 0.24 + energy * 0.54;
        context.lineWidth = Math.max(1, 2 * ratio);
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.stroke();
      }

      context.globalAlpha = 0.32;
      context.strokeStyle = "#f5f5f7";
      context.lineWidth = 1 * ratio;
      context.beginPath();
      context.arc(0, 0, maxRadius * (0.45 + pulse * 0.04), 0, Math.PI * 2);
      context.stroke();
      context.restore();

      context.globalAlpha = 0.18;
      context.strokeStyle = accent;
      context.lineWidth = 1.2 * ratio;
      for (let layer = 0; layer < 3; layer += 1) {
        context.beginPath();
        const yBase = height * (0.32 + layer * 0.16);
        for (let x = 0; x <= width; x += 8 * ratio) {
          const y =
            yBase +
            Math.sin(x * 0.008 + frame * 0.035 + layer) *
              (18 + intensity * 0.18) *
              ratio *
              (isPlaying ? 1 : 0.45);
          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }

      context.globalAlpha = 1;
      frame += isPlaying ? 1 : 0.12;
      animationId = window.requestAnimationFrame(render);
    };

    render();

    return () => window.cancelAnimationFrame(animationId);
  }, [accent, density, intensity, isPlaying, motion]);

  return <canvas className="h-full w-full" ref={canvasRef} />;
}

function Timeline({
  progress,
  setProgress,
}: {
  progress: number;
  setProgress: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 font-mono text-xs text-zinc-400">01:34</span>
      <input
        aria-label="Playback position"
        className="slynt-range flex-1"
        max="100"
        min="0"
        onChange={(event) => setProgress(Number(event.target.value))}
        type="range"
        value={progress}
      />
      <span className="w-10 text-right font-mono text-xs text-zinc-400">
        03:42
      </span>
    </div>
  );
}

function EffectsBrowser({
  activeCategory,
  effects,
  selectedEffectId,
  setActiveCategory,
  setSelectedEffect,
}: {
  activeCategory: EffectCategory;
  effects: Effect[];
  selectedEffectId: string;
  setActiveCategory: (category: EffectCategory) => void;
  setSelectedEffect: (effect: Effect) => void;
}) {
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

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {effects.map((effect) => {
          const IconComponent = effect.icon;
          const selected = selectedEffectId === effect.id;

          return (
            <button
              className={cn(
                "group min-h-36 rounded-[8px] border bg-[var(--surface-secondary)] p-4 text-left transition",
                selected
                  ? "border-[var(--accent)]"
                  : "border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]",
              )}
              key={effect.id}
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
              <h3 className="mt-4 text-sm font-semibold text-white">
                {effect.name}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                {effect.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ControlPanel({
  effect,
  effectValues,
  exportPreset,
  loop,
  setEffectValues,
  setExportPreset,
  setLoop,
  setTransparent,
  transparent,
}: {
  effect: Effect;
  effectValues: Record<"intensity" | "motion" | "bloom" | "density", number>;
  exportPreset: ExportPreset;
  loop: boolean;
  setEffectValues: (
    values: Record<"intensity" | "motion" | "bloom" | "density", number>,
  ) => void;
  setExportPreset: (preset: ExportPreset) => void;
  setLoop: (value: boolean) => void;
  setTransparent: (value: boolean) => void;
  transparent: boolean;
}) {
  const updateValue = (
    key: keyof typeof effectValues,
    value: number,
  ) => {
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
        <PanelSection icon={SlidersHorizontal} title="Effect Controls">
          <Slider
            label="Intensity"
            onChange={(value) => updateValue("intensity", value)}
            value={effectValues.intensity}
          />
          <Slider
            label="Motion"
            onChange={(value) => updateValue("motion", value)}
            value={effectValues.motion}
          />
          <Slider
            label="Bloom"
            onChange={(value) => updateValue("bloom", value)}
            value={effectValues.bloom}
          />
          <Slider
            label="Density"
            onChange={(value) => updateValue("density", value)}
            value={effectValues.density}
          />
        </PanelSection>

        <PanelSection icon={Wand2} title="Reactive Mapping">
          <div className="grid grid-cols-2 gap-2">
            <ToggleCard active icon={Zap} label="Beat sync" />
            <ToggleCard active={loop} icon={RotateCcw} label="Loop phase" onClick={() => setLoop(!loop)} />
            <ToggleCard active icon={Gauge} label="Peak hold" />
            <ToggleCard icon={Lock} label="Lock seed" />
          </div>
        </PanelSection>

        <PanelSection icon={Layers3} title="Style">
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
        </PanelSection>

        <PanelSection icon={Download} title="Export Settings">
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-xs text-[var(--text-muted)]">
                Resolution
              </label>
              <div className="relative">
                <select
                  className="h-10 w-full appearance-none rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
                  onChange={(event) => {
                    const preset =
                      exportPresets.find(
                        (item) => item.label === event.target.value,
                      ) ?? exportPresets[1];
                    setExportPreset(preset);
                  }}
                  value={exportPreset.label}
                >
                  {exportPresets.map((preset) => (
                    <option key={preset.label}>{preset.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {exportPreset.value} / H.264 / 24 fps
              </p>
            </div>
            <button
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              type="button"
            >
              <Download className="h-4 w-4" />
              Export render
            </button>
          </div>
        </PanelSection>
      </div>
    </aside>
  );
}

function PanelSection({
  children,
  icon: IconComponent,
  title,
}: {
  children: React.ReactNode;
  icon: Icon;
  title: string;
}) {
  return (
    <section className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <IconComponent className="h-4 w-4 text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Slider({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="mb-4 block last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-xs text-white">{value}%</span>
      </div>
      <input
        className="slynt-range w-full"
        max="100"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

function ToggleCard({
  active = false,
  icon: IconComponent,
  label,
  onClick,
}: {
  active?: boolean;
  icon: Icon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "flex min-h-20 flex-col items-start justify-between rounded-[8px] border p-3 text-left text-xs transition",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:text-white",
      )}
      onClick={onClick}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
      <span>{label}</span>
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

function Pill({ icon: IconComponent, text }: { icon: Icon; text: string }) {
  return (
    <span className="hidden h-9 items-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-xs text-[var(--text-secondary)] sm:flex">
      <IconComponent className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[7px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="font-mono text-xs text-white">{value}</p>
    </div>
  );
}
