import { useCurrentFrame, useVideoConfig } from "remotion";
import { formatTime } from "@/lib/slynt/time";
import type { SlyntProject } from "@/lib/slynt/project-schema";

export function ProgressLayer({ project }: { project: SlyntProject }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const seconds = frame / fps;
  const barY = height - 42;

  if (project.progress.style === "time-counter") {
    return (
      <div style={{ bottom: 42, color: "rgba(255,255,255,0.72)", fontFamily: "monospace", fontSize: 18, position: "absolute", right: 74, zIndex: 12 }}>
        {formatTime(seconds)} / {formatTime(project.canvas.durationInSeconds)}
      </div>
    );
  }

  return (
    <svg height={height} style={{ inset: 0, position: "absolute", zIndex: 11 }} viewBox={`0 0 ${width} ${height}`} width={width}>
      <line stroke="rgba(255,255,255,0.16)" strokeWidth="3" x1="74" x2={width - 74} y1={barY} y2={barY} />
      <line stroke="#ffffff" strokeLinecap="round" strokeWidth="4" x1="74" x2={74 + (width - 148) * progress} y1={barY} y2={barY} />
      {project.progress.showChapterMarkers
        ? project.playlist.chapters.map((chapter) => {
            const x = 74 + (width - 148) * (chapter.startTimeSeconds / Math.max(1, project.canvas.durationInSeconds));
            return <line key={chapter.id} stroke="rgba(245,245,240,0.8)" strokeWidth="2" x1={x} x2={x} y1={barY - 8} y2={barY + 8} />;
          })
        : null}
      {project.progress.style === "segmented-timeline"
        ? Array.from({ length: 28 }, (_, index) => {
            const x = 74 + ((width - 148) / 28) * index;
            const active = index / 28 < progress;
            return <rect fill={active ? "#ffffff" : "rgba(255,255,255,0.12)"} height="5" key={index} rx="2" width={(width - 148) / 36} x={x} y={barY + 14} />;
          })
        : null}
      {project.progress.showElapsed ? (
        <text fill="rgba(255,255,255,0.64)" fontFamily="monospace" fontSize="16" x="74" y={barY - 16}>
          {formatTime(seconds)}
        </text>
      ) : null}
      {project.progress.showRemaining ? (
        <text fill="rgba(255,255,255,0.64)" fontFamily="monospace" fontSize="16" textAnchor="end" x={width - 74} y={barY - 16}>
          -{formatTime(project.canvas.durationInSeconds - seconds)}
        </text>
      ) : null}
    </svg>
  );
}
