# Starter Template

A full-stack starter template with React, TypeScript, tRPC, Lucia Auth, Prisma, and more.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, TanStack Query
- **Backend**: Express, tRPC, Lucia Auth
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS, shadcn/ui components
- **Validation**: Zod
- **Forms**: React Hook Form
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/starter.git
   cd starter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database connection string:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/starter?schema=public"
   ```

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Start development servers**

   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── server/
│   ├── auth/              # Lucia auth configuration
│   ├── db/                # Prisma client
│   ├── lib/               # Server utilities
│   ├── trpc/
│   │   ├── routers/       # tRPC routers
│   │   └── trpc.ts        # tRPC configuration
│   └── index.ts           # Express server entry
├── src/
│   ├── components/
│   │   ├── auth/          # Auth components
│   │   ├── layouts/       # Layout components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Client utilities
│   ├── pages/             # Page components
│   ├── test/              # Test setup
│   ├── App.tsx            # Main app component
│   └── main.tsx           # React entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start backend only |
| `npm run build` | Build both frontend and backend |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |

## Adding New Features

### Adding a new tRPC router

1. Create a new router in `server/trpc/routers/`:

   ```typescript
   // server/trpc/routers/posts.ts
   import { z } from "zod";
   import { router, protectedProcedure } from "../trpc";

   export const postsRouter = router({
     list: protectedProcedure.query(async ({ ctx }) => {
       return ctx.db.post.findMany();
     }),
     create: protectedProcedure
       .input(z.object({ title: z.string() }))
       .mutation(async ({ ctx, input }) => {
         return ctx.db.post.create({ data: input });
       }),
   });
   ```

2. Add it to the main router in `server/trpc/routers/index.ts`:

   ```typescript
   import { postsRouter } from "./posts";

   export const appRouter = router({
     auth: authRouter,
     posts: postsRouter,
   });
   ```

3. Use it in your React components:

   ```tsx
   const { data: posts } = trpc.posts.list.useQuery();
   ```

### Adding shadcn/ui components

Since shadcn/ui components are copy-paste, you can either:

1. Copy components from the [shadcn/ui docs](https://ui.shadcn.com/docs/components)
2. Or initialize shadcn/ui CLI: `npx shadcn-ui@latest init`

## Authentication

The template uses [Lucia](https://lucia-auth.com/) for session-based authentication:

- **Register**: Create account with email/password
- **Login**: Email/password authentication
- **Logout**: Session invalidation
- **Protected Routes**: Use `<ProtectedRoute>` component

### Using auth in components

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return <p>Hello, {user.name}!</p>;
}
```

### Protecting API routes

Use `protectedProcedure` instead of `publicProcedure` for authenticated endpoints:

```typescript
export const myRouter = router({
  // Public - anyone can access
  publicData: publicProcedure.query(() => "public"),
  
  // Protected - requires authentication
  privateData: protectedProcedure.query(({ ctx }) => {
    return `Hello, ${ctx.user.name}`;
  }),
});
```

## Deployment

### Build for production

```bash
npm run build
```

This creates:
- `dist/client/` - Frontend static files
- `dist/server/` - Compiled backend

### Environment variables for production

```env
DATABASE_URL="your-production-db-url"
NODE_ENV=production
PORT=3000
```

## License

MIT
