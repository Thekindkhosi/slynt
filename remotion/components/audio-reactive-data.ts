import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { SlyntProject } from "@/lib/slynt/project-schema";

export type ReactiveData = {
  spectrum: number[];
  bass: number;
  lowMid: number;
  mid: number;
  high: number;
  overall: number;
  transient: number;
  waveform: number;
};

export function useReactiveData(project: SlyntProject): ReactiveData {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = project.audio.asset?.url ?? "";
  const audioData = useAudioData(src || "/missing-audio", { sampleRate: 44100 });

  if (!src || !audioData) {
    return idleReactiveData(frame, project.visualizer.speed);
  }

  const spectrum = visualizeAudio({
    audioData,
    fps,
    frame,
    numberOfSamples: 64,
    optimizeFor: "speed",
    smoothing: project.visualizer.smoothing > 0.35,
  }).map((value) => clamp01(value * project.visualizer.sensitivity * 1.8));

  const avg = (start: number, end: number) => {
    const slice = spectrum.slice(start, end);
    return slice.reduce((sum, value) => sum + value, 0) / Math.max(1, slice.length);
  };

  const bass = avg(0, 8);
  const lowMid = avg(8, 18);
  const mid = avg(18, 38);
  const high = avg(38, 64);
  const overall = avg(0, 64);

  return {
    spectrum,
    bass,
    lowMid,
    mid,
    high,
    overall,
    transient: clamp01(Math.max(0, bass - mid * 0.45) * 1.4),
    waveform: interpolate(overall, [0, 1], [0.08, 1]),
  };
}

function idleReactiveData(frame: number, speed: number): ReactiveData {
  const spectrum = Array.from({ length: 64 }, (_, index) => {
    const phase = frame * 0.035 * (0.5 + speed) + index * 0.42;
    return 0.18 + Math.sin(phase) * 0.08 + Math.sin(phase * 0.43) * 0.06;
  }).map(clamp01);
  const overall = spectrum.reduce((sum, value) => sum + value, 0) / spectrum.length;

  return {
    spectrum,
    bass: spectrum.slice(0, 8).reduce((sum, value) => sum + value, 0) / 8,
    lowMid: overall,
    mid: overall * 0.9,
    high: overall * 0.7,
    overall,
    transient: 0.15 + Math.sin(frame * 0.08) * 0.08,
    waveform: overall,
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

