import type { AudioTrack, ControlValues } from "@/types/editor";
import { CanvasVisualizer } from "./canvas-visualizer";

type PreviewStageProps = {
  audioTrack: AudioTrack | null;
  controlValues: ControlValues;
  isPlaying: boolean;
};

export function PreviewStage({
  audioTrack,
  controlValues,
  isPlaying,
}: PreviewStageProps) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="p-2 sm:p-3 xl:p-4">
        <div className="relative aspect-video overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[#050506]">
          <CanvasVisualizer
            controlValues={controlValues}
            isPlaying={isPlaying}
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
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                audioTrack ? "bg-[var(--success)]" : "bg-[var(--text-muted)]"
              }`}
            />
            {audioTrack ? "Audio connected" : "Preview"}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="translate-y-1 text-center">
              <p className="text-[26px] font-semibold leading-none tracking-[0.34em] text-white sm:text-[34px]">
                SLYNT
              </p>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.24em] text-[var(--accent)] sm:text-[12px]">
                FEEL THE FREQUENCY
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
