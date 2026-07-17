import { ChevronDown } from "lucide-react";

type SelectControlProps = {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
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
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[var(--text-muted)]" />
      </div>
    </div>
  );
}
