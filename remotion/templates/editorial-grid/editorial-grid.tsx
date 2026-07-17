import type { ReactiveData } from "../../components/audio-reactive-data";
import { CoverLayer } from "../../components/cover-layer";
import { PlaylistLayer } from "../../components/playlist-layer";
import { ProgressLayer } from "../../components/progress-layer";
import { TextLayer } from "../../components/text-layer";
import type { SlyntProject } from "@/lib/slynt/project-schema";
import { EditorialGridVisualizer } from "./editorial-grid-visualizer";

export function EditorialGrid({ data, project }: { data: ReactiveData; project: SlyntProject }) {
  return (
    <>
      <EditorialGridVisualizer data={data} project={project} />
      <CoverLayer project={project} />
      <TextLayer project={project} />
      <PlaylistLayer project={project} />
      <ProgressLayer project={project} />
    </>
  );
}

