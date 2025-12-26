import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  Users,
  Sparkles,
  Zap,
  Pen,
  StickyNote,
  Shapes,
  MessageSquare,
  Wand2,
  Brain,
  ImageIcon,
  Link2,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Pen,
    title: "Freehand Drawing",
    description: "Sketch ideas naturally with smooth, responsive drawing tools",
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent-muted)]",
  },
  {
    icon: StickyNote,
    title: "Sticky Notes",
    description: "Capture thoughts instantly with colorful, draggable notes",
    color: "text-[var(--color-secondary)]",
    bgColor: "bg-[rgba(255,107,74,0.15)]",
  },
  {
    icon: Shapes,
    title: "Shapes & Text",
    description: "Add structure with shapes, arrows, and rich text formatting",
    color: "text-[var(--color-tertiary)]",
    bgColor: "bg-[rgba(139,92,246,0.15)]",
  },
  {
    icon: Users,
    title: "Real-time Sync",
    description: "See cursors, edits, and changes from teammates instantly",
    color: "text-[var(--color-accent)]",
    bgColor: "bg-[var(--color-accent-muted)]",
  },
  {
    icon: Link2,
    title: "Shareable Boards",
    description: "Create rooms and invite collaborators with a simple link",
    color: "text-[var(--color-secondary)]",
    bgColor: "bg-[rgba(255,107,74,0.15)]",
  },
  {
    icon: MessageSquare,
    title: "Comments",
    description: "Leave feedback and discuss ideas right on the canvas",
    color: "text-[var(--color-tertiary)]",
    bgColor: "bg-[rgba(139,92,246,0.15)]",
  },
];

const aiFeatures = [
  {
    icon: Wand2,
    title: "Smart Suggest",
    description:
      "Describe your idea and let AI generate diagrams, flowcharts, and visual concepts automatically.",
  },
  {
    icon: Brain,
    title: "Auto-Organize",
    description:
      "AI groups related sticky notes and summarizes brainstorming sessions into actionable insights.",
  },
  {
    icon: ImageIcon,
    title: "Generate Assets",
    description:
      "Create custom icons, illustrations, and visual elements with text-to-image generation.",
  },
];

// Animated canvas preview component
function CanvasPreview() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Glow effect behind the canvas */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-tertiary)] to-[var(--color-secondary)] opacity-20 blur-3xl" />

      {/* Main canvas container */}
      <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-4 flex-1 rounded-md bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
            collabcanvas.app/board/team-brainstorm
          </div>
        </div>

        {/* Canvas area */}
        <div className="bg-grid relative aspect-[16/10] overflow-hidden rounded-b-xl bg-[#0d0d14]">
          {/* Decorative elements on canvas */}

          {/* Sticky note 1 */}
          <div className="animate-float absolute left-[8%] top-[15%] w-32 rotate-[-3deg] rounded-lg bg-[#fbbf24] p-3 shadow-lg">
            <p className="text-xs font-medium text-gray-900">User Research</p>
            <p className="mt-1 text-[10px] text-gray-700">Interview findings</p>
          </div>

          {/* Sticky note 2 */}
          <div className="animate-float-delayed absolute left-[25%] top-[25%] w-28 rotate-[2deg] rounded-lg bg-[#f472b6] p-3 shadow-lg">
            <p className="text-xs font-medium text-gray-900">Pain Points</p>
            <p className="mt-1 text-[10px] text-gray-700">Key issues</p>
          </div>

          {/* Sticky note 3 */}
          <div className="animate-float-slow absolute right-[15%] top-[20%] w-32 rotate-[4deg] rounded-lg bg-[#4ade80] p-3 shadow-lg">
            <p className="text-xs font-medium text-gray-900">Solutions</p>
            <p className="mt-1 text-[10px] text-gray-700">Brainstorm ideas</p>
          </div>

          {/* Drawing path */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" fill="none">
            <path
              d="M150 280 Q 200 250, 280 290 T 400 270 T 520 300"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-draw"
              fill="none"
            />
            <path
              d="M450 350 L 550 350 L 500 420 Z"
              stroke="var(--color-tertiary)"
              strokeWidth="2"
              fill="rgba(139, 92, 246, 0.3)"
              className="animate-float-slow"
            />
          </svg>

          {/* Text box */}
          <div className="animate-float-delayed absolute bottom-[25%] left-[10%] rounded-lg border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-4 py-2">
            <p className="text-sm font-medium text-[var(--color-accent)]">Project Roadmap</p>
          </div>

          {/* Live cursors */}
          <div className="absolute right-[30%] top-[40%]">
            <div className="flex items-center gap-1">
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                className="drop-shadow-lg"
              >
                <path d="M0 0L16 12L8 12L4 20L0 0Z" fill="var(--color-secondary)" />
              </svg>
              <span className="rounded-full bg-[var(--color-secondary)] px-2 py-0.5 text-[10px] font-medium text-white">
                Sarah
              </span>
            </div>
          </div>

          <div className="absolute bottom-[35%] right-[20%]">
            <div className="flex items-center gap-1">
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                className="drop-shadow-lg"
              >
                <path d="M0 0L16 12L8 12L4 20L0 0Z" fill="var(--color-tertiary)" />
              </svg>
              <span className="rounded-full bg-[var(--color-tertiary)] px-2 py-0.5 text-[10px] font-medium text-white">
                Mike
              </span>
            </div>
          </div>

          {/* AI suggestion popup */}
          <div className="animate-pulse-glow absolute bottom-[15%] right-[8%] rounded-xl border border-[var(--color-accent)] bg-[var(--color-surface-elevated)] p-3 shadow-xl">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
              <span className="text-xs font-semibold text-[var(--color-accent)]">
                AI Suggestion
              </span>
            </div>
            <p className="max-w-[140px] text-[10px] text-[var(--color-text-muted)]">
              Group these notes into themes?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Live indicator component
function LiveIndicator() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
      </span>
      <span className="text-sm font-medium text-[var(--color-text-muted)]">
        Real-time collaboration
      </span>
    </div>
  );
}

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="noise-overlay relative overflow-hidden pb-16 pt-12 md:pb-24 md:pt-20">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[var(--color-accent)] opacity-10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[var(--color-tertiary)] opacity-10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center text-center md:mb-16">
            <div className="animate-fade-up">
              <LiveIndicator />
            </div>

            <h1 className="animate-fade-up animation-delay-100 mt-8 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Where teams{" "}
              <span className="animate-gradient bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-tertiary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                think together
              </span>
            </h1>

            <p className="animate-fade-up animation-delay-200 mt-6 max-w-2xl text-lg text-[var(--color-text-muted)] md:text-xl">
              A collaborative whiteboard for brainstorming, sketching, and planning—powered by AI to
              make your ideas smarter.
            </p>

            <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="hover:shadow-[var(--color-accent)]/25 group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="hover:shadow-[var(--color-accent)]/25 group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg"
                  >
                    Start for free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-8 py-4 text-base font-semibold text-[var(--color-text)] transition-all hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Canvas preview */}
          <div className="animate-fade-up animation-delay-400">
            <CanvasPreview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[var(--color-border)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to <span className="text-[var(--color-accent)]">collaborate</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-muted)]">
              All the tools for visual thinking, from quick sketches to complex diagrams.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="carousel-container overflow-hidden">
          <div className="carousel-track flex w-max gap-6 px-4">
            {/* First set of cards */}
            {features.map((feature) => (
              <div
                key={feature.title}
                className="hover:border-[var(--color-text-muted)]/30 w-[320px] flex-shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 transition-all hover:bg-[var(--color-surface-hover)]"
              >
                <div className={`mb-4 inline-flex rounded-xl ${feature.bgColor} p-3`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{feature.description}</p>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {features.map((feature) => (
              <div
                key={`${feature.title}-dup`}
                className="hover:border-[var(--color-text-muted)]/30 w-[320px] flex-shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 transition-all hover:bg-[var(--color-surface-hover)]"
              >
                <div className={`mb-4 inline-flex rounded-xl ${feature.bgColor} p-3`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="relative overflow-hidden border-t border-[var(--color-border)] py-20 md:py-28">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-accent-muted)] to-transparent opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="border-[var(--color-accent)]/30 inline-flex items-center gap-2 rounded-full border bg-[var(--color-accent-muted)] px-4 py-2">
                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                <span className="text-sm font-medium text-[var(--color-accent)]">AI-Powered</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
                <span className="text-sm font-medium text-amber-500">Coming Soon</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Supercharge your creativity
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-muted)]">
              Let AI handle the heavy lifting while you focus on the big picture.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {aiFeatures.map((feature, i) => (
              <div
                key={feature.title}
                className={`animate-fade-up border-[var(--color-accent)]/20 relative rounded-2xl border bg-gradient-to-b from-[var(--color-surface-elevated)] to-[var(--color-surface)] p-8`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-tertiary)] p-4">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[var(--color-border)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-3xl">
            {/* Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-tertiary)] opacity-10 blur-2xl" />

            <div className="relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-8 py-12 md:px-16 md:py-16">
              <div className="mb-6 inline-flex items-center gap-2">
                <Zap className="h-6 w-6 text-[var(--color-accent)]" />
                <span className="text-lg font-semibold text-[var(--color-accent)]">
                  Ready to collaborate?
                </span>
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                Start building ideas together
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[var(--color-text-muted)]">
                Create your first board in seconds. No credit card required.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="hover:shadow-[var(--color-accent)]/25 group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg"
                  >
                    Open Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="hover:shadow-[var(--color-accent)]/25 group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-8 py-4 text-base font-semibold text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-lg"
                    >
                      Get started free
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
                    >
                      Already have an account? Sign in →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Made with <Heart className="inline-block h-4 w-4" /> by{" "}
            <a
              href="https://bnuckols.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] hover:underline"
            >
              Brennon
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
