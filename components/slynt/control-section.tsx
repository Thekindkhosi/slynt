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
    <section className="rounded-[8px] border border-[var(--border-subtle)] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),transparent_38%),var(--surface-secondary)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <IconComponent className="h-4 w-4 text-white" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}
