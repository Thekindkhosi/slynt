import { Download } from "lucide-react";
import { exportPresets } from "@/data/effects";
import type { ExportPreset } from "@/types/editor";
import { SelectControl } from "./select-control";

type ExportSettingsProps = {
  exportPreset: ExportPreset;
  setExportPreset: (preset: ExportPreset) => void;
};

export function ExportSettings({
  exportPreset,
  setExportPreset,
}: ExportSettingsProps) {
  return (
    <div className="space-y-3">
      <div>
        <SelectControl
          label="Resolution"
          onChange={setExportPreset}
          options={exportPresets}
          value={exportPreset}
        />
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {exportPreset.value} / H.264 / 24 fps
        </p>
      </div>
      <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[7px] bg-[var(--accent)] text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        type="button"
      >
        <Download className="h-4 w-4" />
        Export render
      </button>
    </div>
  );
}
