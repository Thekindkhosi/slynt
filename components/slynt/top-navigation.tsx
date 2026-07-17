"use client";

import { ChevronDown, Download, Music, Upload, Waves } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import type { AudioTrack, ExportValues } from "@/types/editor";

type TopNavigationProps = {
  audioTrack: AudioTrack | null;
  exportValues: ExportValues;
  onAudioUpload: (file: File) => void;
};

export function TopNavigation({
  audioTrack,
  exportValues,
  onAudioUpload,
}: TopNavigationProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onAudioUpload(file);
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
          className="flex h-10 min-w-10 max-w-[180px] items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-[13px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
          onClick={() => audioInputRef.current?.click()}
          title={audioTrack ? audioTrack.name : "Add audio"}
          type="button"
        >
          {audioTrack ? (
            <Music className="h-3.5 w-3.5 text-[var(--success)]" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-[var(--accent)]" />
          )}
          <span className="hidden truncate sm:inline">
            {audioTrack ? audioTrack.name : "Add Audio"}
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
            <div className="absolute right-0 top-11 z-20 w-[calc(100vw-1.5rem)] rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg shadow-black/20 sm:w-72">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Export Summary
              </p>
              <div className="mt-3 space-y-2 text-[13px]">
                <SummaryRow label="Resolution" value={exportValues.resolution} />
                <SummaryRow label="Frame rate" value={exportValues.frameRate} />
                <SummaryRow
                  label="Aspect ratio"
                  value={exportValues.aspectRatio}
                />
                <SummaryRow label="Format" value={exportValues.videoFormat} />
                <SummaryRow label="Quality" value={exportValues.quality} />
                <SummaryRow
                  label="Audio"
                  value={audioTrack ? audioTrack.name : "Not added"}
                />
              </div>
              <button
                className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                Mock export
              </button>
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
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}
