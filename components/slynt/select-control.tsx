import { ChevronDown } from "lucide-react";
import type { ExportPreset } from "@/types/editor";

type SelectControlProps = {
  label: string;
  onChange: (preset: ExportPreset) => void;
  options: ExportPreset[];
  value: ExportPreset;
};

export function SelectControl({
  label,
  onChange,
  options,
  value,
}: SelectControlProps) {
  return (
    <div>
      <label className="mb-2 block text-xs text-[var(--text-muted)]">
        {label}
      </label>
      <div className="relative">
        <select
          className="h-10 w-full appearance-none rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
          onChange={(event) => {
            const preset =
              options.find((item) => item.label === event.target.value) ??
              options[0];
            onChange(preset);
          }}
          value={value.label}
        >
          {options.map((preset) => (
            <option key={preset.label}>{preset.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
      </div>
    </div>
  );
}
