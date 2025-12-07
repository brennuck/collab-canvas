import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Zap, Shield, Database, Code, Sparkles } from "lucide-react";

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
    icon: Sparkles,
    title: "TanStack Query",
    description: "Powerful data fetching and caching",
  },
  {
    icon: Zap,
    title: "Tailwind CSS",
    description: "Utility-first CSS for rapid UI development",
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6 md:py-32 lg:px-8">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Full-stack starter template
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Ship faster with a{" "}
            <span className="text-gray-500 dark:text-gray-400">modern stack</span>
          </h1>

          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
            A production-ready starter template with authentication, database, API, and styling.
            Start building your next project in minutes, not hours.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            A carefully curated stack of modern tools and frameworks to build your next big idea.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
            >
              <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">
                <feature.icon className="h-5 w-5 text-gray-900 dark:text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Ready to start building?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-600 dark:text-gray-300">
            Clone this template and start building your next project with a solid foundation.
          </p>
          <div className="mt-8">
            <code className="rounded-lg bg-gray-200 px-4 py-2 font-mono text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              git clone https://github.com/your-username/starter
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
