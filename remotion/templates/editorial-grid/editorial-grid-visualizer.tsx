import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ReactiveData } from "../../components/audio-reactive-data";
import type { SlyntProject } from "@/lib/slynt/project-schema";

export function EditorialGridVisualizer({
  data,
  project,
}: {
  data: ReactiveData;
  project: SlyntProject;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const columns = Math.max(12, Math.round(project.visualizer.density / 3));
  const rows = gridRowsForEffect(project.visualizer.effectId);
  const gridWidth = width * 0.72;
  const gridHeight = height * 0.48;
  const cellGap = Math.max(4, width * 0.006);
  const cellWidth = (gridWidth - cellGap * (columns - 1)) / columns;
  const cellHeight = (gridHeight - cellGap * (rows - 1)) / rows;
  const originX = width * 0.14;
  const originY = height * 0.22;
  const scanX =
    originX +
    ((frame * (0.006 + project.visualizer.speed * 0.004)) % 1) * gridWidth;
  const pulse = 1 + data.bass * 0.1;

  return (
    <svg height={height} style={{ inset: 0, position: "absolute", zIndex: 4 }} viewBox={`0 0 ${width} ${height}`} width={width}>
      <g opacity="0.2">
        {Array.from({ length: 17 }, (_, index) => (
          <line key={index} stroke="white" strokeWidth="1" x1={(width / 16) * index} x2={(width / 16) * index} y1="0" y2={height} />
        ))}
        {Array.from({ length: 10 }, (_, index) => (
          <line key={index} stroke="white" strokeWidth="1" x1="0" x2={width} y1={(height / 9) * index} y2={(height / 9) * index} />
        ))}
      </g>
      <defs>
        <filter id="editorialGlow">
          <feGaussianBlur stdDeviation={project.visualizer.glowBlur / 9} />
          <feColorMatrix values={`1 0 0 0 0.82  0 1 0 0 0.82  0 0 1 0 0.8  0 0 0 ${project.visualizer.glowIntensity} 0`} />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={project.visualizer.glowEnabled ? "url(#editorialGlow)" : undefined} transform={`translate(${originX} ${originY}) scale(${pulse}) translate(${-gridWidth * data.bass * 0.05} ${-gridHeight * data.bass * 0.05})`}>
        <rect fill="rgba(255,255,255,0.03)" height={gridHeight + 32} rx="8" stroke="rgba(255,255,255,0.16)" width={gridWidth + 32} x="-16" y="-16" />
        {Array.from({ length: columns }, (_, column) => {
          const sample = data.spectrum[Math.floor((column / columns) * data.spectrum.length)] ?? 0;
          const ridge = waveRidge(column, columns, frame, project.visualizer.effectId, project.visualizer.speed);
          const level = Math.min(1, sample * project.visualizer.height * project.visualizer.intensity + ridge);
          const activeRows = Math.max(1, Math.round(level * rows));

          return Array.from({ length: rows }, (_, row) => {
            const active = rows - row <= activeRows;
            const x = column * (cellWidth + cellGap);
            const y = row * (cellHeight + cellGap);
            const distanceToScan = Math.abs(originX + x - scanX) / Math.max(1, gridWidth);
            const scanBoost = project.visualizer.effectId === "radial-wave" ? Math.max(0, 0.22 - distanceToScan) : 0;
            const particleBoost =
              project.visualizer.effectId === "particles-reactive" && (column + row + frame) % 11 === 0
                ? data.transient * 0.8
                : 0;
            const opacity = active
              ? Math.min(0.95, 0.34 + sample * 0.5 + scanBoost + particleBoost)
              : 0.07 + scanBoost * 0.3;

            return (
              <rect
                fill={active ? "#f5f5f0" : "rgba(255,255,255,0.14)"}
                height={cellHeight}
                key={`${column}-${row}`}
                opacity={opacity}
                rx="2"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1"
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
        GRID SPECTRUM / {project.visualizer.effectId.toUpperCase()}
      </text>
    </svg>
  );
}

function gridRowsForEffect(effectId: string) {
  if (effectId === "frequency-ring" || effectId === "particles-reactive") {
    return 14;
  }
  if (effectId === "waveform") {
    return 10;
  }
  return 12;
}

function waveRidge(column: number, columns: number, frame: number, effectId: string, speed: number) {
  if (effectId !== "waveform" && effectId !== "radial-wave") {
    return 0;
  }
  const phase = (column / Math.max(1, columns - 1)) * Math.PI * 4 + frame * 0.04 * (0.4 + speed);
  return Math.max(0, Math.sin(phase)) * (effectId === "waveform" ? 0.22 : 0.12);
}
