import { AbsoluteFill, Audio } from "remotion";
import { BackgroundLayer } from "./components/background-layer";
import { LogoLayer } from "./components/logo-layer";
import { useReactiveData } from "./components/audio-reactive-data";
import { EditorialGrid } from "./templates/editorial-grid/editorial-grid";
import { WireframeTerrain } from "./templates/wireframe-terrain/wireframe-terrain";
import type { SlyntCompositionProps } from "./types";

export function SlyntComposition({ project }: SlyntCompositionProps) {
  const data = useReactiveData(project);

  return (
    <AbsoluteFill style={{ backgroundColor: "#050506", overflow: "hidden" }}>
      {project.audio.asset ? (
        <Audio src={project.audio.asset.url} volume={project.audio.volume} />
      ) : null}
      <BackgroundLayer project={project} />
      {project.templateId === "wireframe-terrain" ? (
        <WireframeTerrain data={data} project={project} />
      ) : (
        <EditorialGrid data={data} project={project} />
      )}
      <LogoLayer project={project} />
    </AbsoluteFill>
  );
}

