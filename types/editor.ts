import type { ComponentType, SVGProps } from "react";

export type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type EffectCategory =
  | "background"
  | "audio-reactives"
  | "track-progress"
  | "playlist"
  | "cover"
  | "text"
  | "logo";

export type Effect = {
  id: string;
  name: string;
  category: EffectCategory;
  description: string;
  icon: Icon;
  accent: string;
  intensity: number;
  speed: number;
  glowIntensity: number;
  density: number;
};

export type ControlValues = {
  intensity: number;
  sensitivity: number;
  barHeight: number;
  speed: number;
  smoothing: number;
  density: number;
  glowEnabled: boolean;
  glowIntensity: number;
  glowBlur: number;
};

export type ExportValues = {
  resolution: string;
  frameRate: string;
  aspectRatio: string;
  videoFormat: string;
  quality: string;
};

export type AudioTrack = {
  name: string;
  url: string;
};

export type SceneValues = {
  backgroundBrightness: number;
  cameraMovement: number;
  motionAmount: number;
  particleDensity: number;
  sceneBlur: number;
};
