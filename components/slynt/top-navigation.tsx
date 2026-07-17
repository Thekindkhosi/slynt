"use client";

import { ChevronDown, Download, Music, Upload, Waves } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import type { SlyntProject } from "@/types/editor";

type TopNavigationProps = {
  analyzing: boolean;
  exportState: ExportUiState;
  onAudioUpload: (file: File) => void;
  onExport: () => void;
  project: SlyntProject;
};

export type ExportUiState = {
  canExport: boolean;
  downloadUrl: string | null;
  error: string | null;
  jobId: string | null;
  progress: number;
  stage: string;
  status: "idle" | "submitting" | "queued" | "rendering" | "completed" | "failed";
};

export function TopNavigation({
  analyzing,
  exportState,
  onAudioUpload,
  onExport,
  project,
}: TopNavigationProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAudioUpload(file);
    }
    event.target.value = "";
  };

  return (
    <header className="relative flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] py-1">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)]">
          <Waves className="h-4 w-4 text-[var(--accent)]" strokeWidth={2.2} />
        </div>
        <h1 className="text-[22px] font-semibold leading-none tracking-[0.22em] text-white sm:text-[24px]">
          SLYNT
        </h1>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <input
          accept="audio/*"
          className="sr-only"
          onChange={handleAudioUpload}
          ref={audioInputRef}
          type="file"
        />
        <button
          aria-label="Add audio"
          className="flex h-10 min-w-10 max-w-[220px] items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-[13px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
          onClick={() => audioInputRef.current?.click()}
          title={project.audio.asset?.fileName ?? "Add audio"}
          type="button"
        >
          {project.audio.asset ? (
            <Music className="h-3.5 w-3.5 text-[var(--success)]" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-[var(--accent)]" />
          )}
          <span className="hidden truncate sm:inline">
            {analyzing
              ? "Analyzing audio"
              : project.audio.asset?.fileName ?? "Add Audio"}
          </span>
        </button>

        <div className="relative">
          <button
            aria-expanded={exportOpen}
            aria-haspopup="dialog"
            aria-label="Export video"
            className="flex h-10 items-center gap-2 rounded-[7px] bg-[var(--accent)] px-3 text-[13px] font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            onClick={() => setExportOpen((open) => !open)}
            type="button"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Video</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>

          {exportOpen ? (
            <div className="absolute right-0 top-11 z-20 w-[calc(100vw-1.5rem)] rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg shadow-black/20 sm:w-80">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Export
              </p>
              <div className="mt-3 space-y-2 text-[13px]">
                <SummaryRow label="Resolution" value={project.export.resolution} />
                <SummaryRow label="Frame rate" value={`${project.export.fps} FPS`} />
                <SummaryRow label="Template" value={project.templateId} />
                <SummaryRow label="Format" value="MP4" />
                <SummaryRow label="Audio" value={project.audio.asset?.fileName ?? "Not added"} />
              </div>

              <div className="mt-4 space-y-2">
                <progress
                  aria-label="Render progress"
                  className="h-2 w-full"
                  max={1}
                  value={exportState.progress}
                />
                <div className="flex justify-between gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{exportState.stage || "Ready"}</span>
                  <span>{Math.round(exportState.progress * 100)}%</span>
                </div>
                {exportState.error ? (
                  <p className="text-xs text-red-300">{exportState.error}</p>
                ) : null}
              </div>

              <button
                className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!exportState.canExport}
                onClick={onExport}
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                {exportState.status === "failed" ? "Retry export" : "Render MP4"}
              </button>
              {exportState.downloadUrl ? (
                <a
                  className="mt-2 flex h-9 w-full items-center justify-center rounded-[7px] border border-[var(--border)] text-xs font-semibold text-white"
                  href={exportState.downloadUrl}
                >
                  Download MP4
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="truncate text-right font-medium text-white">{value}</span>
    </div>
  );
}

