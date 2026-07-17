interface RangeControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export function RangeControl({
  label,
  max = 100,
  min = 0,
  onChange,
  step = 1,
  suffix = "%",
  value,
}: RangeControlProps) {
  const inputId = `range-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs text-[var(--text-secondary)]" htmlFor={inputId}>
          {label}
        </label>
        <span className="font-mono text-xs text-white">
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="slynt-range w-full"
        id={inputId}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}
