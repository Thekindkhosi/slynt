export function PreviewStage() {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="p-2 sm:p-3 xl:p-4">
        <div className="aspect-video rounded-[10px] border border-[var(--border-subtle)] bg-[#050506]" />
      </div>
    </section>
  );
}
