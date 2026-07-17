import { ChevronDown, Download, Waves } from "lucide-react";

export function TopNavigation() {
  return (
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)]">
          <Waves className="h-4 w-4 text-[var(--accent)]" strokeWidth={2.2} />
        </div>
        <h1 className="text-sm font-semibold tracking-[0.24em] text-white">
          SLYNT
        </h1>
      </div>

      <button
        className="flex h-9 items-center gap-2 rounded-[7px] bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        type="button"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export Video</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
      </button>
    </header>
  );
}
