export function ControlSidebar() {
  return (
    <aside className="flex min-h-0 flex-col rounded-[10px] border border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)]">
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-[var(--text-secondary)]">
        Please select the effect you want
      </div>
    </aside>
  );
}
