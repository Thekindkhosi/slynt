import { z } from "zod";

export const templateIdSchema = z.enum(["editorial-grid", "wireframe-terrain"]);

export const assetReferenceSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{12,80}$/),
  fileName: z.string().min(1).max(180),
  mimeType: z.string().min(3).max(100),
  url: z.string().startsWith("/api/assets/"),
});

export const playlistChapterSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  artist: z.string().max(120),
  startTimeSeconds: z.number().min(0),
  cover: assetReferenceSchema.nullish(),
});

export const gradientStopSchema = z.object({
  id: z.string().min(1).max(80),
  blur: z.number().min(0).max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  positionX: z.number().min(0).max(100),
  positionY: z.number().min(0).max(100),
  size: z.number().min(1).max(120),
});

export const slyntProjectSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  templateId: templateIdSchema,
  canvas: z.object({
    width: z.number().int().min(320).max(3840),
    height: z.number().int().min(240).max(2160),
    fps: z.union([z.literal(24), z.literal(30), z.literal(60)]),
    durationInSeconds: z.number().min(1).max(60 * 60 * 8),
  }),
  audio: z.object({
    asset: assetReferenceSchema.nullable(),
    volume: z.number().min(0).max(1),
    durationInSeconds: z.number().min(0).max(60 * 60 * 8),
    waveformPeaks: z.array(z.number().min(0).max(1)).max(2048),
  }),
  mix: z.object({
    title: z.string().max(120),
    episode: z.string().max(80),
    subtitle: z.string().max(180),
  }),
  track: z.object({
    title: z.string().max(120),
    artist: z.string().max(120),
    trackNumber: z.number().int().min(1).max(999),
    totalTracks: z.number().int().min(1).max(999),
    cover: assetReferenceSchema.nullable(),
  }),
  playlist: z.object({
    displayMode: z.enum([
      "hidden",
      "current-track",
      "compact-queue",
      "side-queue",
      "up-next",
    ]),
    chapters: z.array(playlistChapterSchema).max(200),
  }),
  background: z.object({
    mode: z.enum(["template", "image", "gradient"]),
    image: z.object({
      asset: assetReferenceSchema.nullable(),
      brightness: z.number().min(40).max(180),
      blur: z.number().min(0).max(40),
      contrast: z.number().min(40).max(200),
      fit: z.enum(["cover", "contain", "fill"]),
      opacity: z.number().min(0).max(1),
      positionX: z.number().min(0).max(100),
      positionY: z.number().min(0).max(100),
      scale: z.number().min(0.5).max(2),
    }),
    gradient: z.object({
      activeStopId: z.string().min(1),
      stops: z.array(gradientStopSchema).min(1).max(8),
    }),
    overlayOpacity: z.number().min(0).max(1),
  }),
  visualizer: z.object({
    effectId: z.string().min(1).max(80),
    sensitivity: z.number().min(0.1).max(2),
    intensity: z.number().min(0.1).max(2),
    height: z.number().min(0.1).max(2),
    density: z.number().min(8).max(160),
    smoothing: z.number().min(0).max(1),
    speed: z.number().min(0).max(2),
    glowEnabled: z.boolean(),
    glowIntensity: z.number().min(0).max(2),
    glowBlur: z.number().min(0).max(80),
    lineWidth: z.number().min(1).max(18),
  }),
  progress: z.object({
    style: z.enum([
      "minimal-line",
      "circular-progress",
      "segmented-timeline",
      "waveform-timeline",
      "time-counter",
    ]),
    showElapsed: z.boolean(),
    showRemaining: z.boolean(),
    showChapterMarkers: z.boolean(),
  }),
  typography: z.object({
    title: z.string().max(140),
    artist: z.string().max(140),
    customText: z.string().max(220),
    showTitle: z.boolean(),
    showArtist: z.boolean(),
    showCustomText: z.boolean(),
    titleScale: z.number().min(0.5).max(2),
    opacity: z.number().min(0).max(1),
  }),
  logo: z.object({
    asset: assetReferenceSchema.nullable(),
    placement: z.enum([
      "hidden",
      "center",
      "bottom-left",
      "bottom-right",
      "watermark",
    ]),
    opacity: z.number().min(0).max(1),
    scale: z.number().min(0.1).max(2),
  }),
  export: z.object({
    resolution: z.enum(["1280x720", "1920x1080"]),
    fps: z.union([z.literal(24), z.literal(30), z.literal(60)]),
    format: z.literal("mp4"),
    quality: z.enum(["draft", "standard", "high", "maximum"]),
  }),
});

export type TemplateId = z.infer<typeof templateIdSchema>;
export type AssetReference = z.infer<typeof assetReferenceSchema>;
export type PlaylistChapter = z.infer<typeof playlistChapterSchema>;
export type SlyntProject = z.infer<typeof slyntProjectSchema>;

export const renderResolutionSchema = slyntProjectSchema.shape.export.shape.resolution;

