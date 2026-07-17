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
  const count = Math.round(project.visualizer.density);
  const centerX = width * 0.54;
  const centerY = height * 0.52;
  const baseRadius = Math.min(width, height) * 0.18;

  return (
    <svg height={height} style={{ inset: 0, position: "absolute", zIndex: 4 }} viewBox={`0 0 ${width} ${height}`} width={width}>
      <g opacity="0.22">
        {Array.from({ length: 12 }, (_, index) => (
          <line key={index} stroke="white" strokeWidth="1" x1={(width / 12) * index} x2={(width / 12) * index} y1="0" y2={height} />
        ))}
        {Array.from({ length: 7 }, (_, index) => (
          <line key={index} stroke="white" strokeWidth="1" x1="0" x2={width} y1={(height / 7) * index} y2={(height / 7) * index} />
        ))}
      </g>
      <g filter={project.visualizer.glowEnabled ? "url(#editorialGlow)" : undefined}>
        <defs>
          <filter id="editorialGlow">
            <feGaussianBlur stdDeviation={project.visualizer.glowBlur / 8} />
            <feColorMatrix values={`1 0 0 0 0.2  0 1 0 0 0.7  0 0 1 0 1  0 0 0 ${project.visualizer.glowIntensity} 0`} />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: count }, (_, index) => {
          const sample = data.spectrum[index % data.spectrum.length] ?? 0;
          const angle = (Math.PI * 2 * index) / count + frame * 0.003 * project.visualizer.speed;
          const length = 24 + sample * 150 * project.visualizer.height * project.visualizer.intensity;
          const x1 = centerX + Math.cos(angle) * baseRadius;
          const y1 = centerY + Math.sin(angle) * baseRadius;
          const x2 = centerX + Math.cos(angle) * (baseRadius + length);
          const y2 = centerY + Math.sin(angle) * (baseRadius + length);
          return <line key={index} stroke={index % 3 === 0 ? "#38bdf8" : "#ffffff"} strokeLinecap="round" strokeOpacity={0.55 + sample * 0.45} strokeWidth={project.visualizer.lineWidth} x1={x1} x2={x2} y1={y1} y2={y2} />;
        })}
      </g>
      <circle cx={centerX} cy={centerY} fill="rgba(255,255,255,0.04)" r={baseRadius * (1 + data.bass * 0.18)} stroke="rgba(255,255,255,0.36)" strokeWidth="1.5" />
    </svg>
  );
}

