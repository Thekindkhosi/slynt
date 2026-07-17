interface ToggleControlProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleControl({
  checked,
  label,
  onCheckedChange,
}: ToggleControlProps) {
  const inputId = `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label
      className="flex cursor-pointer items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-3 text-sm text-[var(--text-secondary)] transition hover:text-white"
      htmlFor={inputId}
    >
      <span>{label}</span>
      <input
        checked={checked}
        className="sr-only"
        id={inputId}
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 rounded-full border border-[var(--border)] bg-[#050506] transition"
      >
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[var(--text-muted)] transition"
          style={{
            backgroundColor: checked ? "var(--accent)" : "var(--text-muted)",
            left: checked ? "18px" : "3px",
          }}
        />
      </span>
    </label>
  );
}
