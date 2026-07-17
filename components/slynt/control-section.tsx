import type { ReactNode } from "react";
import type { Icon } from "@/types/editor";

type ControlSectionProps = {
  children: ReactNode;
  icon: Icon;
  title: string;
};

export function ControlSection({
  children,
  icon: IconComponent,
  title,
}: ControlSectionProps) {
  return (
    <section className="rounded-[8px] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <IconComponent className="h-4 w-4 text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}
