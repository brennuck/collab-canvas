import { Maximize, Download, Users } from "lucide-react";

interface QuickActionsProps {
  onFitToScreen: () => void;
  onExport?: () => void;
  onViewCollaborators?: () => void;
}

export function QuickActions({ onFitToScreen, onExport, onViewCollaborators }: QuickActionsProps) {
  return (
    <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5 shadow-lg">
      <button
        onClick={onFitToScreen}
        className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        title="Fit to screen"
      >
        <Maximize className="h-4 w-4" />
      </button>
      <button
        onClick={onExport}
        className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        title="Export"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={onViewCollaborators}
        className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
        title="View collaborators"
      >
        <Users className="h-4 w-4" />
      </button>
    </div>
  );
}
