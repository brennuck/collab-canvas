import { useAuth } from "@/hooks/use-auth";
import { Activity, CreditCard, Users, Zap } from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    description: "+20.1% from last month",
    icon: CreditCard,
  },
  {
    title: "Active Users",
    value: "+2,350",
    description: "+180.1% from last month",
    icon: Users,
  },
  {
    title: "Active Sessions",
    value: "+12,234",
    description: "+19% from last month",
    icon: Activity,
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    description: "+0.5% from last month",
    icon: Zap,
  },
];

export function DashboardPage() {
  const { user } = useAuth();

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-lg font-medium text-white dark:bg-white dark:text-gray-900">
          {getInitials(user?.name, user?.email)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name ?? "User"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>
        <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Free Plan
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Getting Started Section */}
      <div className="mt-8">
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              This is a placeholder dashboard. Customize it to fit your application needs.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">🎉 You're authenticated!</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                This page is protected and only visible to authenticated users. Try logging out and
                accessing this page directly — you'll be redirected to login.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">🛠️ Next steps</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  • Add your own tRPC routers in{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">
                    server/trpc/routers/
                  </code>
                </li>
                <li>
                  • Update the Prisma schema in{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">
                    prisma/schema.prisma
                  </code>
                </li>
                <li>
                  • Add new pages in{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">src/pages/</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
