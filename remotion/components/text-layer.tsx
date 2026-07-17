import type { SlyntProject } from "@/lib/slynt/project-schema";

export function TextLayer({ project }: { project: SlyntProject }) {
  const { typography, track, mix } = project;

  return (
    <div
      style={{
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
        opacity: typography.opacity,
        pointerEvents: "none",
        position: "absolute",
        zIndex: 8,
      }}
    >
      {typography.showTitle ? (
        <div
          style={{
            fontSize: 46 * typography.titleScale,
            fontWeight: 760,
            left: 74,
            letterSpacing: 0,
            lineHeight: 1,
            position: "fixed",
            top: 62,
          }}
        >
          {typography.title || track.title}
        </div>
      ) : null}
      {typography.showArtist ? (
        <div
          style={{
            color: "rgba(255,255,255,0.68)",
            fontSize: 18,
            fontWeight: 500,
            left: 76,
            position: "fixed",
            top: 118,
          }}
        >
          {typography.artist || track.artist} / {mix.title}
        </div>
      ) : null}
      {typography.showCustomText ? (
        <div
          style={{
            bottom: 76,
            color: "rgba(255,255,255,0.62)",
            fontSize: 16,
            left: 76,
            position: "fixed",
          }}
        >
          {typography.customText}
        </div>
      ) : null}
    </div>
  );
}

