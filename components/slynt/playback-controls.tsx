"use client";

import type { PlayerRef } from "@remotion/player";
import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  StepBack,
  StepForward,
  Volume2,
} from "lucide-react";
import { useEffect, type RefObject } from "react";
import { formatSmpte, formatTime } from "@/lib/slynt/time";
import type { Icon, SlyntProject } from "@/types/editor";

type PlaybackControlsProps = {
  currentFrame: number;
  isPlaying: boolean;
  playerRef: RefObject<PlayerRef | null>;
  project: SlyntProject;
  resetProject: () => void;
  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setProject: (project: SlyntProject) => void;
};

export function PlaybackControls({
  currentFrame,
  isPlaying,
  playerRef,
  project,
  resetProject,
  setCurrentFrame,
  setIsPlaying,
  setProject,
}: PlaybackControlsProps) {
  const fps = project.canvas.fps;
  const duration = Math.max(1, project.canvas.durationInSeconds);
  const durationInFrames = Math.max(1, Math.ceil(duration * fps));
  const currentTime = currentFrame / fps;
  const progress = Math.min(100, (currentFrame / Math.max(1, durationInFrames - 1)) * 100);
  const seekBackground = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${progress}%, #1b1b22 ${progress}%, #1b1b22 100%)`;
  const volumeValue = Math.round(project.audio.volume * 100);
  const volumeBackground = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${volumeValue}%, #1b1b22 ${volumeValue}%, #1b1b22 100%)`;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFrame = (event: { detail: { frame: number } }) =>
      setCurrentFrame(event.detail.frame);

    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);
    player.addEventListener("frameupdate", handleFrame);
    return () => {
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("frameupdate", handleFrame);
    };
  }, [playerRef, setCurrentFrame, setIsPlaying]);

  const seekTo = (frame: number) => {
    const nextFrame = Math.max(0, Math.min(durationInFrames - 1, Math.round(frame)));
    playerRef.current?.seekTo(nextFrame);
    setCurrentFrame(nextFrame);
  };

  const togglePlayback = () => {
    if (!playerRef.current) {
      return;
    }

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  return (
    <section className="flex w-full flex-col gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <IconButton icon={StepBack} label="Back 10 seconds" onClick={() => seekTo(currentFrame - fps * 10)} />
        <button
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
          onClick={togglePlayback}
          type="button"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
        <IconButton icon={StepForward} label="Forward 10 seconds" onClick={() => seekTo(currentFrame + fps * 10)} />

        <span className="min-h-10 w-[118px] shrink-0 content-center font-mono text-[11px] text-zinc-300">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          aria-label="Seek playback"
          className="slynt-progress h-4 min-w-28 flex-1"
          max={durationInFrames - 1}
          min="0"
          onChange={(event) => seekTo(Number(event.target.value))}
          style={{ background: seekBackground }}
          type="range"
          value={Math.min(currentFrame, durationInFrames - 1)}
        />

        <div className="hidden items-center gap-2 md:flex">
          <Volume2 className="h-4 w-4 text-zinc-400" />
          <input
            aria-label="Volume"
            className="slynt-progress h-4 w-20"
            max="100"
            min="0"
            onChange={(event) => {
              const volume = Number(event.target.value) / 100;
              playerRef.current?.setVolume(volume);
              setProject({ ...project, audio: { ...project.audio, volume } });
            }}
            style={{ background: volumeBackground }}
            type="range"
            value={volumeValue}
          />
        </div>

        <IconButton icon={Maximize2} label="Fullscreen" onClick={() => playerRef.current?.requestFullscreen()} />
        <IconButton icon={RotateCcw} label="Reset project" onClick={resetProject} />
      </div>
      <div className="flex justify-between gap-3 font-mono text-[11px] text-[var(--text-muted)]">
        <span>SMPTE {formatSmpte(currentTime, fps)}</span>
        <span>{project.audio.asset ? project.audio.asset.fileName : "Upload audio to export"}</span>
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

