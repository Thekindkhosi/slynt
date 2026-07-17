import type { ControlValues } from "@/types/editor";
import { CanvasVisualizer } from "./canvas-visualizer";
import { PlaybackControls } from "./playback-controls";

type PreviewStageProps = {
  currentTime: number;
  duration: number;
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
  controlValues,
  isPlaying,
  loop,
  setIsPlaying,
  setLoop,
  setCurrentTime,
  volume,
}: PreviewStageProps) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="p-3 sm:p-4">
        <div className="relative aspect-video overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-black">
          <CanvasVisualizer
            density={controlValues.density}
            intensity={controlValues.intensity}
            isPlaying={isPlaying}
            speed={controlValues.speed}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_18%,rgba(0,0,0,0.28))]" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-[7px] border border-white/10 bg-black/45 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300">
              1280 × 720
            </span>
            <span className="rounded-[7px] border border-white/10 bg-black/45 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300">
              16:9
            </span>
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-[7px] border border-white/10 bg-black/45 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Preview
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="translate-y-1 text-center">
              <p className="text-3xl font-semibold tracking-[0.34em] text-white sm:text-5xl">
                SLYNT
              </p>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.24em] text-[var(--accent)] sm:text-sm">
                FEEL THE FREQUENCY
              </p>
            </div>
          </div>

          <div className="absolute bottom-5 left-5 right-5">
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
