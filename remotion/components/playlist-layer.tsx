import { useCurrentFrame, useVideoConfig } from "remotion";
import { getCurrentChapter, getNextChapter } from "@/lib/slynt/time";
import type { SlyntProject } from "@/lib/slynt/project-schema";

export function PlaylistLayer({ project }: { project: SlyntProject }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mode = project.playlist.displayMode;
  if (mode === "hidden") {
    return null;
  }

  const seconds = frame / fps;
  const current = getCurrentChapter(project.playlist.chapters, seconds);
  const next = getNextChapter(project.playlist.chapters, seconds);
  const visible = mode === "up-next" ? next : current;

  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(5,5,6,0.34)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "14px 16px",
        position: "absolute",
        right: 74,
        top: mode === "side-queue" ? 128 : 74,
        width: mode === "side-queue" ? 260 : 220,
        zIndex: 9,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.48)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
        {mode === "up-next" ? "Up next" : "Now playing"}
      </div>
      <div style={{ fontSize: 18, fontWeight: 720, lineHeight: 1.2, marginTop: 8 }}>{visible.title}</div>
      <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 13, marginTop: 5 }}>{visible.artist}</div>
      {mode.includes("queue")
        ? project.playlist.chapters.slice(0, 5).map((chapter) => (
            <div key={chapter.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: chapter.id === current?.id ? "#38bdf8" : "rgba(255,255,255,0.58)", fontSize: 12, marginTop: 10, paddingTop: 8 }}>
              {chapter.title}
            </div>
          ))
        : null}
    </div>
  );
}

