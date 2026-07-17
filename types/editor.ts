import type { ComponentType, SVGProps } from "react";

export type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type EffectCategory = "Core" | "Motion" | "Reactive" | "Texture";

export type Effect = {
  id: string;
  name: string;
  category: EffectCategory;
  description: string;
  icon: Icon;
  accent: string;
  intensity: number;
  motion: number;
  bloom: number;
  density: number;
};

export type EffectValues = Record<
  "intensity" | "motion" | "bloom" | "density",
  number
>;

export type ExportPreset = {
  label: string;
  value: string;
};
