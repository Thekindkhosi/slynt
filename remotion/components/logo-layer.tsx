import type { SlyntProject } from "@/lib/slynt/project-schema";
import { Img } from "remotion";

export function LogoLayer({ project }: { project: SlyntProject }) {
  const { logo } = project;
  if (!logo.asset || logo.placement === "hidden") {
    return null;
  }

  const size = 120 * logo.scale;
  const base = {
    height: size,
    objectFit: "contain" as const,
    opacity: logo.opacity,
    position: "absolute" as const,
    width: size,
    zIndex: 10,
  };

  if (logo.placement === "watermark") {
    return (
      <div
        style={{
          backgroundImage: `url(${logo.asset.url})`,
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          backgroundSize: `${size * 1.6}px ${size * 1.6}px`,
          inset: 0,
          opacity: logo.opacity * 0.16,
          position: "absolute",
          zIndex: 2,
        }}
      />
    );
  }

  const placement =
    logo.placement === "center"
      ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      : logo.placement === "bottom-left"
        ? { bottom: 56, left: 76 }
        : { bottom: 56, right: 76 };

  return <Img alt="" src={logo.asset.url} style={{ ...base, ...placement }} />;
}
