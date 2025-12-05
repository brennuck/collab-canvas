import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Zap, Shield, Database, Palette, Code, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Vite + React",
    description: "Lightning fast development with HMR and optimized builds",
  },
  {
    icon: Shield,
    title: "Lucia Auth",
    description: "Secure session-based authentication out of the box",
  },
  {
    icon: Database,
    title: "Prisma + PostgreSQL",
    description: "Type-safe database access with migrations",
  },
  {
    icon: Code,
    title: "tRPC",
    description: "End-to-end type safety between client and server",
  },
  {
    icon: Palette,
    title: "Tailwind + shadcn/ui",
    description: "Beautiful, accessible components you can customize",
  },
  {
    icon: Sparkles,
    title: "Modern Tooling",
    description: "TypeScript, Vitest, Prettier, and more",
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="container flex flex-col items-center justify-center gap-6 py-24 text-center md:py-32">
          <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Full-stack starter template
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Ship faster with a{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              modern stack
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            A production-ready starter template with authentication, database, API, and UI
            components. Start building your next project in minutes, not hours.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A carefully curated stack of modern tools and frameworks to build your next big idea.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-lg border p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-16 text-center md:py-24">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to start building?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Clone this template and start building your next project with a solid foundation.
          </p>
          <div className="mt-8">
            <code className="rounded-lg bg-muted px-4 py-2 font-mono text-sm">
              git clone https://github.com/your-username/starter
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}

