import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ReactiveData } from "../../components/audio-reactive-data";
import { PlaylistLayer } from "../../components/playlist-layer";
import { ProgressLayer } from "../../components/progress-layer";
import { TextLayer } from "../../components/text-layer";
import type { SlyntProject } from "@/lib/slynt/project-schema";

export function WireframeTerrain({ data, project }: { data: ReactiveData; project: SlyntProject }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cols = Math.max(18, Math.round(project.visualizer.density / 3));
  const rows = 12;
  const gridWidth = width * 0.76;
  const gridHeight = height * 0.48;
  const gap = Math.max(5, width * 0.006);
  const cellWidth = (gridWidth - gap * (cols - 1)) / cols;
  const cellHeight = (gridHeight - gap * (rows - 1)) / rows;
  const originX = width * 0.12;
  const originY = height * 0.24;
  const scanX = originX + ((frame * (0.005 + project.visualizer.speed * 0.004)) % 1) * gridWidth;

  return (
    <>
      <svg height={height} style={{ inset: 0, position: "absolute", zIndex: 4 }} viewBox={`0 0 ${width} ${height}`} width={width}>
        <g opacity="0.18">
          {Array.from({ length: 17 }, (_, index) => (
            <line key={index} stroke="white" strokeWidth="1" x1={(width / 16) * index} x2={(width / 16) * index} y1="0" y2={height} />
          ))}
          {Array.from({ length: 10 }, (_, index) => (
            <line key={index} stroke="white" strokeWidth="1" x1="0" x2={width} y1={(height / 9) * index} y2={(height / 9) * index} />
          ))}
        </g>
        <g transform={`translate(${originX} ${originY})`}>
          <rect fill="rgba(255,255,255,0.025)" height={gridHeight + 28} rx="8" stroke="rgba(255,255,255,0.16)" width={gridWidth + 28} x="-14" y="-14" />
          {Array.from({ length: cols }, (_, col) => {
            const sample = data.spectrum[Math.floor((col / cols) * data.spectrum.length)] ?? 0;
            const wave = Math.max(0, Math.sin(col * 0.42 + frame * 0.045 * (0.6 + project.visualizer.speed))) * 0.14;
            const level = Math.min(1, sample * project.visualizer.height * project.visualizer.intensity + wave);
            const activeRows = Math.max(1, Math.round(level * rows));

            return Array.from({ length: rows }, (_, row) => {
              const active = rows - row <= activeRows;
              const x = col * (cellWidth + gap);
              const y = row * (cellHeight + gap);
              const opacity = active ? 0.28 + sample * 0.64 : 0.08;

              return (
                <rect
                  fill={active ? "#f5f5f0" : "rgba(255,255,255,0.12)"}
                  height={cellHeight}
                  key={`${col}-${row}`}
                  opacity={opacity}
                  rx="2"
                  stroke="rgba(255,255,255,0.16)"
                  width={cellWidth}
                  x={x}
                  y={y}
                />
              );
            });
          })}
        </g>
        <line stroke="rgba(255,255,255,0.72)" strokeWidth="2" x1={scanX} x2={scanX} y1={originY - 22} y2={originY + gridHeight + 22} />
        <text fill="rgba(255,255,255,0.54)" fontFamily="monospace" fontSize="14" x={originX} y={originY + gridHeight + 42}>
          WIRE GRID SPECTRUM
        </text>
      </svg>
      <TextLayer project={project} />
      <PlaylistLayer project={project} />
      <ProgressLayer project={project} />
    </>
  );
}
