import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">
            {getInitials(user?.name, user?.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name ?? "User"}!</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Free Plan
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              This is a placeholder dashboard. Customize it to fit your application needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">🎉 You're authenticated!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This page is protected and only visible to authenticated users. Try logging out and
                accessing this page directly — you'll be redirected to login.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium">🛠️ Next steps</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• Add your own tRPC routers in <code className="rounded bg-muted px-1 py-0.5">server/trpc/routers/</code></li>
                <li>• Update the Prisma schema in <code className="rounded bg-muted px-1 py-0.5">prisma/schema.prisma</code></li>
                <li>• Customize UI components in <code className="rounded bg-muted px-1 py-0.5">src/components/ui/</code></li>
                <li>• Add new pages in <code className="rounded bg-muted px-1 py-0.5">src/pages/</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

