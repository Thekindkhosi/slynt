import type { BackgroundValues, GradientStop } from "@/types/editor";

type PreviewStageProps = {
  backgroundValues: BackgroundValues;
};

export function PreviewStage({ backgroundValues }: PreviewStageProps) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="p-2 sm:p-3 xl:p-4">
        <div className="relative aspect-video overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[#050506]">
          <BackgroundLayer backgroundValues={backgroundValues} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_0_30%,rgba(5,5,6,0.34)_66%,rgba(5,5,6,0.72)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(5,5,6,0.5))]" />
          <div className="absolute inset-0 flex items-center justify-center"></div>
        </div>
      </div>
    </section>
  );
}

function BackgroundLayer({
  backgroundValues,
}: {
  backgroundValues: BackgroundValues;
}) {
  if (backgroundValues.mode === "image") {
    const { image } = backgroundValues;

    if (!image.url) {
      return (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#050506,#111116_50%,#07070a)]" />
      );
    }

    return (
      <div
        aria-label={
          image.name
            ? `Uploaded background ${image.name}`
            : "Uploaded background"
        }
        className="absolute inset-0"
        role="img"
        style={{
          backgroundImage: `url(${image.url})`,
          backgroundPosition: `${image.positionX}% ${image.positionY}%`,
          backgroundRepeat: "no-repeat",
          backgroundSize: image.fit === "fill" ? "100% 100%" : image.fit,
          filter: `blur(${image.blur}px) brightness(${image.brightness}%) contrast(${image.contrast}%)`,
          opacity: image.opacity / 100,
          transform: `scale(${(image.scale / 100) * (1 + image.blur * 0.006)})`,
        }}
      />
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        background: buildMeshGradient(backgroundValues.gradient.stops),
        filter: `blur(${Math.max(
          0,
          Math.max(
            ...backgroundValues.gradient.stops.map((stop) => stop.blur),
          ) * 0.35,
        )}px)`,
        transform: "scale(1.035)",
      }}
    />
  );
}

function buildMeshGradient(stops: GradientStop[]) {
  const layers = stops.map((stop) => {
    const alpha = Math.max(0.32, Math.min(0.9, 1 - stop.blur / 120));
    return `radial-gradient(circle at ${stop.positionX}% ${stop.positionY}%, ${hexToRgba(
      stop.color,
      alpha,
    )} 0%, ${hexToRgba(stop.color, alpha * 0.68)} ${stop.size * 0.38}%, transparent ${stop.size}%)`;
  });

  return [
    ...layers,
    "linear-gradient(135deg,#050506,#111116 52%,#06060a)",
  ].join(",");
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  if ([red, green, blue].some(Number.isNaN)) {
    return `rgba(139,92,246,${alpha})`;
  }

  return `rgba(${red},${green},${blue},${alpha})`;
}
