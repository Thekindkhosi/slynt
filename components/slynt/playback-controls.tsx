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
import type { AudioTrack, Icon } from "@/types/editor";

type PlaybackControlsProps = {
  audioTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  setDuration: (value: number) => void;
  setIsPlaying: (value: boolean) => void;
  setVolume: (value: number) => void;
  volume: number;
};

export function PlaybackControls({
  audioTrack,
  currentTime,
  duration,
  isPlaying,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setVolume,
  volume,
}: PlaybackControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const seekBackground = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${progress}%, #1b1b22 ${progress}%, #1b1b22 100%)`;
  const volumeBackground = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${volume}%, #1b1b22 ${volume}%, #1b1b22 100%)`;

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume / 100;
  }, [volume, audioTrack?.url]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audioTrack) {
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [
    audioTrack,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  ]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audioTrack) {
      return;
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
      return;
    }

    audio.pause();
  }, [audioTrack, isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioTrack) {
      lastFrameRef.current = null;
      return;
    }

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
  }, [audioTrack, duration, isPlaying, setCurrentTime, setIsPlaying]);

  const seekTo = (value: number) => {
    const nextTime = Math.max(0, Math.min(duration, value));

    if (audioRef.current && audioTrack) {
      audioRef.current.currentTime = nextTime;
    }

    setCurrentTime(nextTime);
  };

  return (
    <section className="flex w-full flex-col gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
      {audioTrack ? (
        <audio ref={audioRef} src={audioTrack.url} />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <IconButton
          icon={StepBack}
          label="Previous"
          onClick={() => seekTo(currentTime - 10)}
        />
        <button
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
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
          onClick={() => seekTo(currentTime + 10)}
        />

        <span className="min-h-10 w-[74px] shrink-0 content-center font-mono text-[11px] text-zinc-300 sm:w-[92px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          aria-label="Seek playback"
          className="slynt-progress h-4 min-w-28 flex-1"
          max={duration}
          min="0"
          onChange={(event) => seekTo(Number(event.target.value))}
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
    </section>
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-white"
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
