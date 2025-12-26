import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Mail, UserPlus, Link2, Check, Copy } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: "viewer" | "editor" | "admin") => void;
  boardName: string;
  boardId: string;
  isLoading?: boolean;
}

export function InviteModal({
  isOpen,
  onClose,
  onSubmit,
  boardName,
  boardId,
  isLoading = false,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin">("editor");
  const [prevOpen, setPrevOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset form when modal closes
  if (!isOpen && prevOpen) {
    setEmail("");
    setRole("editor");
    setCopied(false);
    setPrevOpen(false);
  } else if (isOpen && !prevOpen) {
    setPrevOpen(true);
  }

  const boardUrl = `${window.location.origin}/board/${boardId}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim().toLowerCase(), role);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share board">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-accent-muted)] px-3 py-2">
        <UserPlus className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-sm text-[var(--color-text-muted)]">
          Share <strong className="text-[var(--color-text)]">{boardName}</strong>
        </span>
      </div>

      {/* Copy Link Section */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          <Link2 className="mr-1.5 inline h-4 w-4" />
          Share link for viewing
        </label>
        <p className="mb-2 text-xs text-[var(--color-text-muted)]">
          Anyone with this link who has an account can view the board
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={boardUrl}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              copied
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:bg-[var(--color-border)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-4 border-t border-[var(--color-border)] pt-4">
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
          Or invite someone with edit access:
        </p>
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
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
          Permission level
        </label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["editor", "admin"] as const).map((r) => (
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
