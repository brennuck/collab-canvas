import { trpc } from "@/lib/trpc";
import { formatRelativeTime } from "@/lib/format";
import { Mail, Check, X, Loader2 } from "lucide-react";

export function PendingInvites() {
  const utils = trpc.useUtils();
  const { data: invites, isLoading } = trpc.boards.pendingInvites.useQuery();

  const acceptInvite = trpc.boards.acceptInvite.useMutation({
    onSuccess: () => {
      utils.boards.pendingInvites.invalidate();
      utils.boards.list.invalidate();
    },
  });

  const declineInvite = trpc.boards.declineInvite.useMutation({
    onSuccess: () => {
      utils.boards.pendingInvites.invalidate();
    },
  });

  if (isLoading) {
    return null;
  }

  if (!invites || invites.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
        <Mail className="h-4 w-4 text-[var(--color-accent)]" />
        Pending Invites
        <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-medium text-white">
          {invites.length}
        </span>
      </h2>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--color-text)]">{invite.boardName}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Invited by {invite.ownerName} • {formatRelativeTime(new Date(invite.createdAt))}
              </p>
              <span className="mt-1 inline-block rounded bg-[var(--color-surface-hover)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                {invite.role}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => declineInvite.mutate({ inviteId: invite.id })}
                disabled={declineInvite.isPending || acceptInvite.isPending}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-50"
              >
                {declineInvite.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Decline
              </button>
              <button
                onClick={() => acceptInvite.mutate({ inviteId: invite.id })}
                disabled={acceptInvite.isPending || declineInvite.isPending}
                className="flex items-center gap-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {acceptInvite.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
