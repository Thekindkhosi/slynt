import { Clock3, Maximize2 } from "lucide-react";
import type { ControlValues, Effect, Icon } from "@/types/editor";
import { CanvasVisualizer } from "./canvas-visualizer";
import { PlaybackControls } from "./playback-controls";

type PreviewStageProps = {
  currentTime: number;
  duration: number;
  effect: Effect;
  controlValues: ControlValues;
  isPlaying: boolean;
  loop: boolean;
  setIsPlaying: (value: boolean) => void;
  setLoop: (value: boolean) => void;
  setCurrentTime: (value: number) => void;
  selectedBackground: string;
  selectedVisualizer: string;
  volume: number;
};

export function PreviewStage({
  currentTime,
  duration,
  effect,
  controlValues,
  isPlaying,
  loop,
  setIsPlaying,
  setLoop,
  setCurrentTime,
  selectedBackground,
  selectedVisualizer,
  volume,
}: PreviewStageProps) {
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
          <CanvasVisualizer
            accent={effect.accent}
            density={controlValues.density}
            intensity={controlValues.intensity}
            isPlaying={isPlaying}
            speed={controlValues.speed}
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
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedBackground} / {selectedVisualizer}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-zinc-500">Peak</p>
                <p className="font-mono text-sm text-[var(--cyan)]">-3.1 dB</p>
              </div>
            </div>
            <Timeline
              currentTime={currentTime}
              duration={duration}
              setCurrentTime={setCurrentTime}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <PlaybackControls
          isPlaying={isPlaying}
          loop={loop}
          setIsPlaying={setIsPlaying}
          setLoop={setLoop}
          volume={volume}
        />

        <div className="grid grid-cols-3 gap-2 text-xs text-[var(--text-secondary)] sm:flex sm:items-center">
          <Meter label="Bass" value="72%" />
          <Meter label="Mid" value="58%" />
          <Meter label="Air" value="41%" />
        </div>
      </div>
    </section>
  );
}

function Timeline({
  currentTime,
  duration,
  setCurrentTime,
}: {
  currentTime: number;
  duration: number;
  setCurrentTime: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 font-mono text-xs text-zinc-400">
        {formatTime(currentTime)}
      </span>
      <input
        aria-label="Playback position"
        className="slynt-range flex-1"
        max={duration}
        min="0"
        onChange={(event) => setCurrentTime(Number(event.target.value))}
        type="range"
        value={currentTime}
      />
      <span className="w-10 text-right font-mono text-xs text-zinc-400">
        {formatTime(duration)}
      </span>
    </div>
  );
}

function formatTime(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
