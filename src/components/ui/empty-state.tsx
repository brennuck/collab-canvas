import type { ElementType, ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon: ElementType;
}

export function EmptyState({ title, description, action, icon: Icon }: EmptyStateProps) {
  return (
    <div className="bg-[var(--color-surface-elevated)]/50 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-[var(--color-accent-muted)] p-4">
        <Icon className="h-8 w-8 text-[var(--color-accent)]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {action}
    </div>
  );
}
