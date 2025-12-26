import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Globe, Lock, Settings } from "lucide-react";

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardName: string;
  isPublic: boolean;
  onUpdateSettings: (isPublic: boolean) => void;
  isLoading?: boolean;
}

export function BoardSettingsModal({
  isOpen,
  onClose,
  boardName,
  isPublic: initialIsPublic,
  onUpdateSettings,
  isLoading = false,
}: BoardSettingsModalProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [prevOpen, setPrevOpen] = useState(false);

  // Sync state when modal opens
  if (isOpen && !prevOpen) {
    setIsPublic(initialIsPublic);
    setPrevOpen(true);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(isPublic);
  };

  const hasChanges = isPublic !== initialIsPublic;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Board settings">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-surface-hover)] px-3 py-2">
        <Settings className="h-4 w-4 text-[var(--color-text-muted)]" />
        <span className="text-sm text-[var(--color-text-muted)]">
          Settings for <strong className="text-[var(--color-text)]">{boardName}</strong>
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          Visibility
        </label>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              isPublic
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <Globe className="h-4 w-4" />
            Public
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              !isPublic
                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <Lock className="h-4 w-4" />
            Private
          </button>
        </div>
        <p className="mb-6 text-xs text-[var(--color-text-muted)]">
          {isPublic
            ? "Anyone with the link can view this board. Only invited members can edit."
            : "Only invited members can view and edit this board."}
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!hasChanges || isLoading}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

