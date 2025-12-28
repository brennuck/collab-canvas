import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, ChevronDown, User, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useIsMobile } from "@/hooks/use-mobile";

export function RootLayout() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate("/");
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() ?? "??";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="logo-hover flex items-center gap-2"
          >
            <Logo size="sm" />
            <span className="text-base font-bold text-[var(--color-text)] sm:text-lg">
              CollabCanvas
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-3 sm:flex">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-sm font-semibold text-white">
                    {getInitials(user?.name, user?.email)}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-1 shadow-xl">
                    <div className="border-b border-[var(--color-border)] px-4 py-3">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {user?.name ?? "User"}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <div className="my-1 border-t border-[var(--color-border)]" />
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] disabled:opacity-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/20"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Nav */}
          {isMobile && (
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex items-center gap-2 rounded-lg p-2 text-[var(--color-text-muted)] transition-colors active:bg-[var(--color-surface-hover)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-sm font-semibold text-white">
                    {getInitials(user?.name, user?.email)}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors active:bg-[var(--color-surface-hover)]"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-0 z-50 animate-slide-down rounded-b-2xl border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] pt-safe shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-lg font-bold text-[var(--color-text)]">CollabCanvas</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-[var(--color-text-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="border-b border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] text-lg font-semibold text-white">
                      {getInitials(user?.name, user?.email)}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">
                        {user?.name ?? "User"}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] px-4 py-3 text-sm font-medium text-[var(--color-text)]"
                    >
                      <LayoutDashboard className="h-5 w-5 text-[var(--color-text-muted)]" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] px-4 py-3 text-sm font-medium text-[var(--color-text)]"
                    >
                      <User className="h-5 w-5 text-[var(--color-text-muted)]" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 disabled:opacity-50"
                    >
                      <LogOut className="h-5 w-5" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-[var(--color-surface-hover)] px-4 py-3 text-sm font-medium text-[var(--color-text)]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}
