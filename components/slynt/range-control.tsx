type RangeControlProps = {
  label: string;
  onChange: (value: number) => void;
  value: number;
};

export function RangeControl({ label, onChange, value }: RangeControlProps) {
  return (
    <label className="mb-4 block last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-xs text-white">{value}%</span>
      </div>
      <input
        className="slynt-range w-full"
        max="100"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}
