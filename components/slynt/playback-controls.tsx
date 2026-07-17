import {
  Maximize2,
  Pause,
  Play,
  Settings,
  StepBack,
  StepForward,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { Icon } from "@/types/editor";

type PlaybackControlsProps = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  setIsPlaying: (value: boolean) => void;
  setVolume: (value: number) => void;
  volume: number;
};

export function PlaybackControls({
  currentTime,
  duration,
  isPlaying,
  setCurrentTime,
  setIsPlaying,
  setVolume,
  volume,
}: PlaybackControlsProps) {
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const seekBackground = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${progress}%, #1b1b22 ${progress}%, #1b1b22 100%)`;
  const volumeBackground = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${volume}%, #1b1b22 ${volume}%, #1b1b22 100%)`;

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const deltaSeconds = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      setCurrentTime((current) => {
        const next = current + deltaSeconds;
        if (next >= duration) {
          setIsPlaying(false);
          return 0;
        }

        return next;
      });

      animationRef.current = window.requestAnimationFrame(tick);
    };

    animationRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
    };
  }, [duration, isPlaying, setCurrentTime, setIsPlaying]);

  return (
    <div className="flex w-full flex-col gap-2 rounded-[8px] border border-white/10 bg-[#050506]/70 p-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <IconButton
          icon={StepBack}
          label="Previous"
          onClick={() => setCurrentTime((current) => Math.max(0, current - 10))}
        />
        <button
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
          onClick={() => setIsPlaying(!isPlaying)}
          type="button"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>
        <IconButton
          icon={StepForward}
          label="Next"
          onClick={() =>
            setCurrentTime((current) => Math.min(duration, current + 10))
          }
        />

        <span className="w-[74px] shrink-0 font-mono text-[11px] text-zinc-300 sm:w-[92px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          aria-label="Seek playback"
          className="slynt-progress h-4 min-w-0 flex-1"
          max={duration}
          min="0"
          onChange={(event) => setCurrentTime(Number(event.target.value))}
          style={{ background: seekBackground }}
          type="range"
          value={currentTime}
        />

        <div className="hidden items-center gap-2 md:flex">
          <Volume2 className="h-4 w-4 text-zinc-400" />
          <input
            aria-label="Volume"
            className="slynt-progress h-4 w-20"
            max="100"
            min="0"
            onChange={(event) => setVolume(Number(event.target.value))}
            style={{ background: volumeBackground }}
            type="range"
            value={volume}
          />
        </div>

        <IconButton icon={Maximize2} label="Fullscreen" />
        <IconButton icon={Settings} label="Settings" />
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <Volume2 className="h-4 w-4 text-zinc-400" />
        <input
          aria-label="Volume"
          className="slynt-progress h-4 flex-1"
          max="100"
          min="0"
          onChange={(event) => setVolume(Number(event.target.value))}
          style={{ background: volumeBackground }}
          type="range"
          value={volume}
        />
      </div>
    </div>
  );
}

function IconButton({
  icon: IconComponent,
  label,
  onClick,
}: {
  icon: Icon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-white/10 bg-[#050506]/55 text-zinc-300 transition hover:border-[var(--accent)] hover:text-white"
      onClick={onClick}
      title={label}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
    </button>
  );
}

function formatTime(time: number) {
  const normalizedTime = Math.max(0, Math.floor(time));
  const minutes = Math.floor(normalizedTime / 60);
  const seconds = normalizedTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
