import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Mail, UserPlus } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: "viewer" | "editor" | "admin") => void;
  boardName: string;
  isLoading?: boolean;
}

export function InviteModal({
  isOpen,
  onClose,
  onSubmit,
  boardName,
  isLoading = false,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin">("editor");
  const [prevOpen, setPrevOpen] = useState(false);

  // Reset form when modal closes
  if (!isOpen && prevOpen) {
    setEmail("");
    setRole("editor");
    setPrevOpen(false);
  } else if (isOpen && !prevOpen) {
    setPrevOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim().toLowerCase(), role);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite to board">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-accent-muted)] px-3 py-2">
        <UserPlus className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-sm text-[var(--color-text-muted)]">
          Invite someone to <strong className="text-[var(--color-text)]">{boardName}</strong>
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          Email address
        </label>
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            autoFocus
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          Permission level
        </label>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(["viewer", "editor", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                role === r
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-[var(--color-text-muted)]">
          {role === "viewer" && "Can view the board but cannot make changes."}
          {role === "editor" && "Can view and edit the board content."}
          {role === "admin" && "Can edit, invite others, and manage board settings."}
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
            disabled={!email.trim() || isLoading}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

