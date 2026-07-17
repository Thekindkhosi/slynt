import { ChevronDown } from "lucide-react";

interface SelectControlProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SelectControl({
  label,
  onChange,
  options,
  value,
}: SelectControlProps) {
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div>
      <label
        className="mb-2 block text-xs text-[var(--text-muted)]"
        htmlFor={selectId}
      >
        {label}
      </label>
      <div className="relative">
        <select
          className="h-10 w-full appearance-none rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-white outline-none transition focus:border-[var(--accent)]"
          id={selectId}
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
