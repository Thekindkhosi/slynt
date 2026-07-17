import type { ComponentType, MutableRefObject, SVGProps } from "react";
import type { AssetReference, SlyntProject } from "@/lib/slynt/project-schema";

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

export type AudioAnalyserRef = MutableRefObject<AnalyserNode | null>;

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

export type { AssetReference, SlyntProject };

export type BackgroundMode = "image" | "gradient";

export type BackgroundImageFit = "cover" | "contain" | "fill";

export type BackgroundImageValues = {
  brightness: number;
  blur: number;
  contrast: number;
  fit: BackgroundImageFit;
  name: string;
  opacity: number;
  positionX: number;
  positionY: number;
  scale: number;
  url: string;
};

export type GradientStop = {
  id: string;
  blur: number;
  color: string;
  positionX: number;
  positionY: number;
  size: number;
};

export type BackgroundValues = {
  mode: BackgroundMode;
  image: BackgroundImageValues;
  gradient: {
    activeStopId: string;
    stops: GradientStop[];
  };
};

export type SceneValues = {
  backgroundBrightness: number;
  cameraMovement: number;
  motionAmount: number;
  particleDensity: number;
  sceneBlur: number;
};
