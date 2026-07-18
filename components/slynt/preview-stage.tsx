"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { forwardRef } from "react";
import { SlyntComposition } from "@/remotion/slynt-composition";
import { projectToRenderProject } from "@/lib/slynt/project-utils";
import type { SlyntProject } from "@/lib/slynt/project-schema";

type PreviewStageProps = {
  project: SlyntProject;
};

export const PreviewStage = forwardRef<PlayerRef, PreviewStageProps>(
  function PreviewStage({ project }, ref) {
    const renderProject = projectToRenderProject(project);
    const durationInFrames = Math.max(
      1,
      Math.ceil(renderProject.canvas.durationInSeconds * renderProject.canvas.fps),
    );

    return (
      <section className="slynt-panel overflow-hidden">
        <div className="p-2 sm:p-3 xl:p-4">
          <div className="relative aspect-video overflow-hidden rounded-[8px] border border-[var(--border-subtle)] bg-[#020203] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <Player
              acknowledgeRemotionLicense
              clickToPlay={false}
              component={SlyntComposition}
              compositionHeight={renderProject.canvas.height}
              compositionWidth={renderProject.canvas.width}
              controls={false}
              durationInFrames={durationInFrames}
              fps={renderProject.canvas.fps}
              inputProps={{ project: renderProject }}
              initialVolume={renderProject.audio.volume}
              key={renderProject.audio.asset?.id ?? "no-audio"}
              ref={ref}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </section>
    );
  },
);
