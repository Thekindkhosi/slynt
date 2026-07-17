import { Bell, Save, Share2, Waves } from "lucide-react";
import type { Icon } from "@/types/editor";
import { cn } from "./utils";

export function TopNavigation() {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface-secondary)]">
          <Waves className="h-4 w-4 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-[0.24em] text-white">
            SLYNT
          </h1>
          <p className="hidden text-xs text-[var(--text-muted)] sm:block">
            Afterhours Session 07
          </p>
        </div>
      </div>

      <nav className="hidden items-center rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface)] p-1 md:flex">
        {["Edit", "Mix", "Visualize", "Export"].map((item) => (
          <button
            className={cn(
              "rounded-[7px] px-4 py-2 text-xs font-medium transition",
              item === "Visualize"
                ? "bg-[var(--surface-hover)] text-white"
                : "text-[var(--text-secondary)] hover:text-white",
            )}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <IconButton icon={Bell} label="Notifications" />
        <IconButton icon={Save} label="Save" />
        <button
          className="flex h-9 items-center gap-2 rounded-[7px] bg-white px-3 text-xs font-semibold text-black transition hover:bg-zinc-200"
          type="button"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  );
}

function IconButton({ icon: IconComponent, label }: { icon: Icon; label: string }) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-white"
      title={label}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
    </button>
  );
}
