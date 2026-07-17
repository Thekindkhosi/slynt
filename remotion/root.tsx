import { Composition } from "remotion";
import { slyntCompositionSchema, type SlyntCompositionProps } from "./types";
import { SlyntComposition } from "./slynt-composition";
import { createDefaultProject } from "@/lib/slynt/project-defaults";
import { projectToRenderProject } from "@/lib/slynt/project-utils";

const defaultProject = projectToRenderProject(createDefaultProject());

export function RemotionRoot() {
  return (
    <Composition
      calculateMetadata={({ props }) => {
        const project = props.project;
        const durationInFrames = Math.max(
          1,
          Math.ceil(project.canvas.durationInSeconds * project.canvas.fps),
        );

        return {
          durationInFrames,
          fps: project.canvas.fps,
          height: project.canvas.height,
          width: project.canvas.width,
        };
      }}
      component={SlyntComposition}
      defaultProps={{ project: defaultProject } satisfies SlyntCompositionProps}
      durationInFrames={defaultProject.canvas.durationInSeconds * defaultProject.canvas.fps}
      fps={defaultProject.canvas.fps}
      height={defaultProject.canvas.height}
      id="SlyntComposition"
      schema={slyntCompositionSchema}
      width={defaultProject.canvas.width}
    />
  );
}

