import type { SlyntProject } from "@/lib/slynt/project-schema";
import { Img } from "remotion";

export function CoverLayer({ project }: { project: SlyntProject }) {
  const cover = project.track.cover;
  if (!cover) {
    return (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 18,
          color: "rgba(255,255,255,0.5)",
          display: "flex",
          fontSize: 14,
          height: 162,
          justifyContent: "center",
          left: 76,
          position: "absolute",
          top: 164,
          width: 162,
          zIndex: 5,
        }}
      >
        SLYNT
      </div>
    );
  }

  return (
    <Img
      alt=""
      src={cover.url}
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 18,
        boxShadow: "0 24px 80px rgba(0,0,0,0.42)",
        height: 162,
        left: 76,
        objectFit: "cover",
        position: "absolute",
        top: 164,
        width: 162,
        zIndex: 5,
      }}
    />
  );
}
