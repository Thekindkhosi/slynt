import { Download } from "lucide-react";
import type { ExportValues } from "@/types/editor";
import { SelectControl } from "./select-control";

type ExportSettingsProps = {
  exportValues: ExportValues;
  setExportValues: (values: ExportValues) => void;
};

export function ExportSettings({
  exportValues,
  setExportValues,
}: ExportSettingsProps) {
  const updateExportValue = (key: keyof ExportValues, value: string) => {
    setExportValues({ ...exportValues, [key]: value });
  };

  return (
    <div className="space-y-3">
      <SelectControl
        label="Resolution"
        onChange={(value) => updateExportValue("resolution", value)}
        options={["1280 × 720 (HD)", "1920 × 1080 (Full HD)", "3840 × 2160 (4K)"]}
        value={exportValues.resolution}
      />
      <SelectControl
        label="Frame Rate"
        onChange={(value) => updateExportValue("frameRate", value)}
        options={["24 FPS", "30 FPS", "60 FPS"]}
        value={exportValues.frameRate}
      />
      <SelectControl
        label="Aspect Ratio"
        onChange={(value) => updateExportValue("aspectRatio", value)}
        options={["16:9", "1:1", "9:16", "4:5"]}
        value={exportValues.aspectRatio}
      />
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
