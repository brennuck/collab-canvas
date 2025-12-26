import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { User, Lock, Check, AlertCircle } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Profile form state
  const [name, setName] = useState(user?.name ?? "");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Mutations
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile.mutate({ name: name.trim() });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    changePassword.mutate({
      currentPassword,
      newPassword,
    });
  };

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmitPassword = currentPassword && newPassword.length >= 8 && passwordsMatch;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-[var(--color-text)]">Profile Settings</h1>

        {/* Profile Section */}
        <section className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--color-accent-muted)] p-2">
                <User className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">Profile Information</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Update your display name</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text-muted)] opacity-60"
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Email cannot be changed</p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!name.trim() || updateProfile.isPending}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>

              {profileSuccess && (
                <span className="flex items-center gap-1 text-sm text-emerald-500">
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              )}

              {updateProfile.error && (
                <span className="flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {updateProfile.error.message}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          <div className="border-b border-[var(--color-border)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--color-accent-muted)] p-2">
                <Lock className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text)]">Change Password</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Update your password</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              {newPassword && newPassword.length < 8 && (
                <p className="mt-1 text-xs text-amber-400">
                  Password must be at least 8 characters
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full rounded-lg border bg-[var(--color-surface)] px-4 py-2.5 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 ${
                  confirmPassword && !passwordsMatch
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                }`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmitPassword || changePassword.isPending}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {changePassword.isPending ? "Updating..." : "Update Password"}
              </button>

              {passwordSuccess && (
                <span className="flex items-center gap-1 text-sm text-emerald-500">
                  <Check className="h-4 w-4" />
                  Password updated!
                </span>
              )}

              {changePassword.error && (
                <span className="flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {changePassword.error.message}
                </span>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
