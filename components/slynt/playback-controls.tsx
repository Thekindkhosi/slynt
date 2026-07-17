import {
  Pause,
  Play,
  Shuffle,
  StepBack,
  StepForward,
} from "lucide-react";
import type { Icon } from "@/types/editor";
import { cn } from "./utils";

type PlaybackControlsProps = {
  isPlaying: boolean;
  loop: boolean;
  setIsPlaying: (value: boolean) => void;
  setLoop: (value: boolean) => void;
  volume: number;
};

function IconButton({
  icon: IconComponent,
  label,
}: {
  icon: Icon;
  label: string;
}) {
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

export function PlaybackControls({
  isPlaying,
  loop,
  setIsPlaying,
  setLoop,
  volume,
}: PlaybackControlsProps) {
  return (
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
      <span className="hidden rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)] sm:inline-flex">
        {volume}%
      </span>
    </div>
  );
}
