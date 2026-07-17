"use client";

import { ChevronDown, Download, Waves } from "lucide-react";
import { useState } from "react";
import type { ExportValues } from "@/types/editor";

type TopNavigationProps = {
  exportValues: ExportValues;
};

export function TopNavigation({ exportValues }: TopNavigationProps) {
  const [exportOpen, setExportOpen] = useState(false);

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

      <div className="relative">
        <button
          aria-expanded={exportOpen}
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
              <SummaryRow label="Aspect ratio" value={exportValues.aspectRatio} />
              <SummaryRow label="Format" value={exportValues.videoFormat} />
              <SummaryRow label="Quality" value={exportValues.quality} />
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
