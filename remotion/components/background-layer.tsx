import type { SlyntProject } from "@/lib/slynt/project-schema";

export function BackgroundLayer({ project }: { project: SlyntProject }) {
  const { background } = project;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {background.mode === "image" && background.image.asset ? (
        <div
          style={{
            backgroundImage: `url(${background.image.asset.url})`,
            backgroundPosition: `${background.image.positionX}% ${background.image.positionY}%`,
            backgroundRepeat: "no-repeat",
            backgroundSize:
              background.image.fit === "fill" ? "100% 100%" : background.image.fit,
            filter: `blur(${background.image.blur}px) brightness(${background.image.brightness}) contrast(${background.image.contrast})`,
            inset: 0,
            opacity: background.image.opacity,
            position: "absolute",
            transform: `scale(${background.image.scale})`,
          }}
        />
      ) : (
        <div
          style={{
            background: buildMeshGradient(background.gradient.stops),
            filter: "saturate(1.08)",
            inset: 0,
            position: "absolute",
          }}
        />
      )}
      <div
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 0 28%, rgba(5,5,6,0.24) 58%, rgba(5,5,6,0.82) 100%), linear-gradient(180deg, rgba(5,5,6,0.08), rgba(5,5,6,0.62))",
          inset: 0,
          opacity: background.overlayOpacity,
          position: "absolute",
        }}
      />
    </div>
  );
}

function buildMeshGradient(stops: SlyntProject["background"]["gradient"]["stops"]) {
  return [
    ...stops.map((stop) => {
      const alpha = Math.max(0.28, Math.min(0.92, 1 - stop.blur / 120));
      return `radial-gradient(circle at ${stop.positionX}% ${stop.positionY}%, ${hexToRgba(
        stop.color,
        alpha,
      )} 0%, ${hexToRgba(stop.color, alpha * 0.58)} ${stop.size * 0.42}%, transparent ${stop.size}%)`;
    }),
    "linear-gradient(135deg,#050506,#0f1014 52%,#07070a)",
  ].join(",");
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}

