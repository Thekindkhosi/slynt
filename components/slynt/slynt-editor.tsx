"use client";

import type { PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { effects } from "@/data/effects";
import { getAudioMetadataAndPeaks } from "@/lib/slynt/audio-analysis";
import { createDefaultProject } from "@/lib/slynt/project-defaults";
import {
  clearProjectStorage,
  loadProjectFromStorage,
  projectToRenderProject,
  saveProjectToStorage,
} from "@/lib/slynt/project-utils";
import type { AssetReference, SlyntProject } from "@/lib/slynt/project-schema";
import type { EffectCategory } from "@/types/editor";
import { ControlSidebar } from "./control-sidebar";
import { EffectsBrowser } from "./effects-browser";
import { PlaybackControls } from "./playback-controls";
import { PreviewStage } from "./preview-stage";
import { TopNavigation, type ExportUiState } from "./top-navigation";

export function SlyntEditor() {
  const playerRef = useRef<PlayerRef>(null);
  const [project, setProjectState] = useState<SlyntProject>(() =>
    createDefaultProject(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<EffectCategory>("background");
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<EffectCategory, string>
  >({
    background: "gradient",
    "audio-reactives": "spectrum-bars",
    "track-progress": "minimal-line",
    playlist: "current-track",
    cover: "center-square",
    text: "track-title",
    logo: "logo-hidden",
  });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [exportState, setExportState] = useState<ExportUiState>({
    canExport: false,
    downloadUrl: null,
    error: null,
    jobId: null,
    progress: 0,
    stage: "",
    status: "idle",
  });

  const filteredEffects = useMemo(
    () => effects.filter((effect) => effect.category === activeCategory),
    [activeCategory],
  );

  const setProject = useCallback((nextProject: SlyntProject) => {
    setProjectState(projectToRenderProject(nextProject));
  }, []);

  useEffect(() => {
    setProjectState(loadProjectFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveProjectToStorage(project);
    }
  }, [hydrated, project]);

  useEffect(() => {
    const active =
      exportState.status === "queued" || exportState.status === "rendering";
    if (!active || !exportState.jobId) {
      return;
    }

    const controller = new AbortController();
    const poll = async () => {
      try {
        const response = await fetch(`/api/renders/${exportState.jobId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Could not read render status.");
        }
        const data = (await response.json()) as { job: RenderJobResponse };
        setExportState((current) => ({
          ...current,
          downloadUrl:
            data.job.status === "completed"
              ? `/api/renders/${data.job.id}/download`
              : null,
          error: data.job.error ?? null,
          progress: data.job.progress,
          stage: data.job.stage,
          status: data.job.status,
        }));
      } catch (error) {
        if (!controller.signal.aborted) {
          setExportState((current) => ({
            ...current,
            error:
              error instanceof Error
                ? error.message
                : "Failed to poll render status.",
            stage: "Status polling failed",
            status: "failed",
          }));
        }
      }
    };

    void poll();
    const timer = window.setInterval(poll, 1500);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [exportState.jobId, exportState.status]);

  useEffect(() => {
    const canExport =
      Boolean(project.audio.asset) &&
      project.audio.durationInSeconds > 0 &&
      !["submitting", "queued", "rendering"].includes(exportState.status);
    setExportState((current) => ({ ...current, canExport }));
  }, [exportState.status, project.audio.asset, project.audio.durationInSeconds]);

  const uploadAsset = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/assets", {
      body: formData,
      method: "POST",
    });
    const data = (await response.json()) as {
      asset?: AssetReference;
      error?: string;
    };

    if (!response.ok || !data.asset) {
      throw new Error(data.error ?? "Upload failed.");
    }

    return data.asset;
  };

  const handleAudioUpload = async (file: File) => {
    setNotice(null);
    setAnalyzing(true);
    playerRef.current?.pause();
    setIsPlaying(false);
    setCurrentFrame(0);

    try {
      const asset = await uploadAsset(file);
      const analysis = await getAudioMetadataAndPeaks(asset.url);
      setProject({
        ...project,
        audio: {
          ...project.audio,
          asset,
          durationInSeconds: analysis.durationInSeconds,
          waveformPeaks: analysis.waveformPeaks,
        },
        canvas: {
          ...project.canvas,
          durationInSeconds: Math.max(1, analysis.durationInSeconds),
        },
        name: asset.fileName.replace(/\.[^.]+$/, ""),
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Audio upload failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    target: "background" | "cover" | "logo",
  ) => {
    try {
      const asset = await uploadAsset(file);
      if (target === "background") {
        setProject({
          ...project,
          background: {
            ...project.background,
            mode: "image",
            image: { ...project.background.image, asset },
          },
        });
      } else if (target === "cover") {
        setProject({ ...project, track: { ...project.track, cover: asset } });
      } else {
        setProject({
          ...project,
          logo: {
            ...project.logo,
            asset,
            placement: project.logo.placement === "hidden" ? "bottom-right" : project.logo.placement,
          },
        });
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image upload failed.");
    }
  };

  const handleExport = async () => {
    if (!exportState.canExport) {
      return;
    }

    setExportState((current) => ({
      ...current,
      canExport: false,
      downloadUrl: null,
      error: null,
      progress: 0,
      stage: "Submitting render job",
      status: "submitting",
    }));

    try {
      const response = await fetch("/api/renders", {
        body: JSON.stringify({ project }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as {
        job?: RenderJobResponse;
        error?: string;
      };

      if (!response.ok || !data.job) {
        throw new Error(data.error ?? "Could not create render job.");
      }

      const job = data.job;
      setExportState((current) => ({
        ...current,
        jobId: job.id,
        progress: job.progress,
        stage: job.stage,
        status: job.status,
      }));
    } catch (error) {
      setExportState((current) => ({
        ...current,
        error:
          error instanceof Error ? error.message : "Could not submit render job.",
        stage: "Export failed",
        status: "failed",
      }));
    }
  };

  const resetProject = () => {
    if (!window.confirm("Reset the current SLYNT project?")) {
      return;
    }
    playerRef.current?.pause();
    clearProjectStorage();
    setCurrentFrame(0);
    setIsPlaying(false);
    setProjectState(createDefaultProject());
    setExportState({
      canExport: false,
      downloadUrl: null,
      error: null,
      jobId: null,
      progress: 0,
      stage: "",
      status: "idle",
    });
  };

  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.08),transparent_23rem),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_48%,transparent_49%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-3 py-3 sm:px-5 lg:px-6 xl:px-8">
        <TopNavigation
          analyzing={analyzing}
          exportState={exportState}
          onAudioUpload={handleAudioUpload}
          onExport={handleExport}
          project={project}
        />

        {notice ? (
          <div className="mt-3 rounded-[8px] border border-white/25 bg-white/10 px-4 py-3 text-sm text-white">
            {notice}
          </div>
        ) : null}

        <section className="grid flex-1 grid-cols-1 gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex min-w-0 flex-col gap-4">
            <PreviewStage project={project} ref={playerRef} />

            <PlaybackControls
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              playerRef={playerRef}
              project={project}
              resetProject={resetProject}
              setCurrentFrame={setCurrentFrame}
              setIsPlaying={setIsPlaying}
              setProject={setProject}
            />

            <EffectsBrowser
              activeCategory={activeCategory}
              effects={filteredEffects}
              selectedEffectId={selectedByCategory[activeCategory]}
              setActiveCategory={setActiveCategory}
              setSelectedEffect={(effect) => {
                setSelectedByCategory((current) => ({
                  ...current,
                  [effect.category]: effect.id,
                }));
                if (effect.category === "background") {
                  setProject({
                    ...project,
                    background: {
                      ...project.background,
                      mode: effect.id === "image" ? "image" : "gradient",
                    },
                  });
                }
                if (effect.category === "audio-reactives") {
                  setProject({
                    ...project,
                    visualizer: { ...project.visualizer, effectId: effect.id },
                  });
                }
              }}
            />
          </div>

          <ControlSidebar
            activeCategory={activeCategory}
            onAssetUpload={handleImageUpload}
            project={project}
            selectedEffectId={selectedByCategory[activeCategory]}
            setProject={setProject}
          />
        </section>
      </div>
    </main>
  );
}

type RenderJobResponse = {
  id: string;
  status: ExportUiState["status"];
  progress: number;
  stage: string;
  error?: string;
};
