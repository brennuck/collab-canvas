import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { trpc } from "@/lib/trpc";
import { getInitials } from "@/lib/format";
import { Crown, X, Loader2, Clock, UserPlus, Mail } from "lucide-react";

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
  onInvite: () => void;
}

export function ManageMembersModal({
  isOpen,
  onClose,
  boardId,
  boardName,
  onInvite,
}: ManageMembersModalProps) {
  const utils = trpc.useUtils();
  const [prevOpen, setPrevOpen] = useState(false);

  // Reset when modal opens
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  const { data, isLoading } = trpc.boards.getBoardMembers.useQuery(
    { boardId },
    { enabled: isOpen && !!boardId }
  );

  const cancelInvite = trpc.boards.cancelInvite.useMutation({
    onSuccess: () => {
      utils.boards.getBoardMembers.invalidate({ boardId });
    },
  });

  const removeMember = trpc.boards.removeMember.useMutation({
    onSuccess: () => {
      utils.boards.getBoardMembers.invalidate({ boardId });
      utils.boards.list.invalidate();
    },
  });

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Members of <strong className="text-[var(--color-text)]">{boardName}</strong>
        </p>
        <button
          onClick={onInvite}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Owner */}
          {data?.owner && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Owner
              </h3>
              <div className="flex items-center gap-3 rounded-lg bg-[var(--color-surface)] p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-xs font-semibold text-white">
                  {getInitials(data.owner.name, data.owner.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-[var(--color-text)]">
                    {data.owner.name ?? data.owner.email}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">
                    {data.owner.email}
                  </p>
                </div>
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
            </div>
          )}

          {/* Members */}
          {data?.members && data.members.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Members ({data.members.length})
              </h3>
              <div className="space-y-2">
                {data.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg bg-[var(--color-surface)] p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]">
                      {getInitials(member.name, member.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[var(--color-text)]">
                        {member.name ?? member.email}
                      </p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        {member.email} • {formatRole(member.role)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeMember.mutate({ boardId, userId: member.id })}
                      disabled={removeMember.isPending}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Remove member"
                    >
                      {removeMember.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {data?.pendingInvites && data.pendingInvites.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Pending Invites ({data.pendingInvites.length})
              </h3>
              <div className="space-y-2">
                {data.pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-muted)]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[var(--color-text)]">
                        {invite.email}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                        <Clock className="h-3 w-3" />
                        Pending • {formatRole(invite.role)}
                      </p>
                    </div>
                    <button
                      onClick={() => cancelInvite.mutate({ inviteId: invite.id })}
                      disabled={cancelInvite.isPending}
                      className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Cancel invite"
                    >
                      {cancelInvite.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for no members/invites */}
          {data?.members.length === 0 && data?.pendingInvites.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                No members or pending invites yet.
              </p>
              <button
                onClick={onInvite}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline"
              >
                <UserPlus className="h-4 w-4" />
                Invite someone
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

