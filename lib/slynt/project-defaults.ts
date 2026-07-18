import type { SlyntProject } from "./project-schema";

export function createDefaultProject(): SlyntProject {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `project-${Math.round(Math.random() * 1_000_000)}`;

  return {
    version: 1,
    id,
    name: "Untitled SLYNT Visualizer",
    templateId: "editorial-grid",
    canvas: { width: 1280, height: 720, fps: 30, durationInSeconds: 180 },
    audio: {
      asset: null,
      volume: 0.75,
      durationInSeconds: 0,
      waveformPeaks: [],
    },
    mix: {
      title: "SLYNT Session",
      episode: "001",
      subtitle: "Local visualizer render",
    },
    track: {
      title: "Untitled Track",
      artist: "Unknown Artist",
      trackNumber: 1,
      totalTracks: 1,
      cover: null,
    },
    playlist: {
      displayMode: "current-track",
      chapters: [
        {
          id: "chapter-1",
          title: "Untitled Track",
          artist: "Unknown Artist",
          startTimeSeconds: 0,
        },
      ],
    },
    background: {
      mode: "gradient",
      image: {
        asset: null,
        brightness: 1,
        blur: 0,
        contrast: 1,
        fit: "cover",
        opacity: 1,
        positionX: 50,
        positionY: 50,
        scale: 1,
      },
      gradient: {
        activeStopId: "white-core",
        stops: [
          {
            id: "white-core",
            blur: 18,
            color: "#f5f5f0",
            positionX: 42,
            positionY: 38,
            size: 52,
          },
          {
            id: "silver-edge",
            blur: 22,
            color: "#9f9f9a",
            positionX: 70,
            positionY: 62,
            size: 36,
          },
          {
            id: "graphite-floor",
            blur: 26,
            color: "#4f4f4c",
            positionX: 22,
            positionY: 76,
            size: 28,
          },
        ],
      },
      overlayOpacity: 0.36,
    },
    visualizer: {
      effectId: "spectrum-bars",
      sensitivity: 0.9,
      intensity: 0.8,
      height: 0.72,
      density: 64,
      smoothing: 0.6,
      speed: 0.5,
      glowEnabled: true,
      glowIntensity: 0.58,
      glowBlur: 28,
      lineWidth: 3,
    },
    progress: {
      style: "minimal-line",
      showElapsed: true,
      showRemaining: false,
      showChapterMarkers: true,
    },
    typography: {
      title: "Untitled Track",
      artist: "Unknown Artist",
      customText: "Made with SLYNT",
      showTitle: true,
      showArtist: true,
      showCustomText: false,
      titleScale: 1,
      opacity: 1,
    },
    logo: {
      asset: null,
      placement: "hidden",
      opacity: 0.65,
      scale: 0.5,
    },
    export: {
      resolution: "1280x720",
      fps: 30,
      format: "mp4",
      quality: "standard",
    },
  };
}
