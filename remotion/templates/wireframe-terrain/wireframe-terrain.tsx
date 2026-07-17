import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ReactiveData } from "../../components/audio-reactive-data";
import { PlaylistLayer } from "../../components/playlist-layer";
import { ProgressLayer } from "../../components/progress-layer";
import { TextLayer } from "../../components/text-layer";
import type { SlyntProject } from "@/lib/slynt/project-schema";

export function WireframeTerrain({ data, project }: { data: ReactiveData; project: SlyntProject }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rows = 18;
  const cols = 36;

  return (
    <>
      <svg height={height} style={{ inset: 0, position: "absolute", zIndex: 4 }} viewBox={`0 0 ${width} ${height}`} width={width}>
        <g transform={`translate(0 ${height * 0.14})`}>
          {Array.from({ length: rows }, (_, row) => {
            const y = height * 0.26 + row * 22;
            const points = Array.from({ length: cols }, (_, col) => {
              const x = (width / (cols - 1)) * col;
              const sample = data.spectrum[(col + row) % data.spectrum.length] ?? 0;
              const wave = Math.sin(col * 0.55 + row * 0.4 + frame * 0.04 * (0.4 + project.visualizer.speed));
              const lift = (sample * 72 + wave * 12) * project.visualizer.intensity;
              const perspective = row / rows;
              return `${x},${y - lift * (1.2 - perspective) + perspective * perspective * 130}`;
            }).join(" ");
            return <polyline fill="none" key={row} points={points} stroke={row % 3 === 0 ? "#38bdf8" : "rgba(255,255,255,0.62)"} strokeWidth="1.4" />;
          })}
          {Array.from({ length: cols }, (_, col) => {
            const points = Array.from({ length: rows }, (_, row) => {
              const x = (width / (cols - 1)) * col;
              const y = height * 0.26 + row * 22;
              const sample = data.spectrum[(col + row) % data.spectrum.length] ?? 0;
              const wave = Math.sin(col * 0.55 + row * 0.4 + frame * 0.04);
              const lift = (sample * 72 + wave * 12) * project.visualizer.intensity;
              const perspective = row / rows;
              return `${x},${y - lift * (1.2 - perspective) + perspective * perspective * 130}`;
            }).join(" ");
            return <polyline fill="none" key={col} opacity="0.36" points={points} stroke="white" strokeWidth="1" />;
          })}
        </g>
        <circle cx={width * 0.76} cy={height * 0.25} fill="none" r={64 + data.bass * 32} stroke="#38bdf8" strokeOpacity="0.8" strokeWidth="5" />
        <circle cx={width * 0.76} cy={height * 0.25} fill="none" r={92 + data.high * 24} stroke="rgba(255,255,255,0.38)" strokeWidth="2" />
      </svg>
      <TextLayer project={project} />
      <PlaylistLayer project={project} />
      <ProgressLayer project={project} />
    </>
  );
}

