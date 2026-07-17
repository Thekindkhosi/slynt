import type { PlaylistChapter } from "./project-schema";

export function formatTime(seconds: number) {
  const normalized = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const secs = normalized % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatSmpte(seconds: number, fps: number) {
  const safeFps = Math.max(1, Math.round(fps));
  const totalFrames = Math.max(0, Math.round(seconds * safeFps));
  const frames = totalFrames % safeFps;
  const totalSeconds = Math.floor(totalFrames / safeFps);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [hours, minutes, secs, frames]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

export function parseClockTime(value: string) {
  const parts = value
    .trim()
    .split(":")
    .map((part) => Number(part));

  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some((part) => !Number.isFinite(part) || part < 0)
  ) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}

export function getCurrentChapter(
  chapters: PlaylistChapter[],
  seconds: number,
) {
  return [...chapters]
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    .filter((chapter) => chapter.startTimeSeconds <= seconds)
    .at(-1);
}

export function getNextChapter(chapters: PlaylistChapter[], seconds: number) {
  return [...chapters]
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    .find((chapter) => chapter.startTimeSeconds > seconds);
}

