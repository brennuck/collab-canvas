import { useState } from "react";
import { Modal } from "@/components/ui/modal";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading?: boolean;
}

export function CreateBoardModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateBoardModalProps) {
  const [name, setName] = useState("");
  const [prevOpen, setPrevOpen] = useState(false);

  // Reset form when modal closes
  if (!isOpen && prevOpen) {
    setName("");
    setPrevOpen(false);
  } else if (isOpen && !prevOpen) {
    setPrevOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new board">
      <form onSubmit={handleSubmit}>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          Board name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Project Brainstorm"
          autoFocus
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
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
            disabled={!name.trim() || isLoading}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create board"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
