# Starter Template

A full-stack starter template with React, TypeScript, tRPC, Lucia Auth, Prisma, and more.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, TanStack Query
- **Backend**: Express, tRPC, Lucia Auth
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
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
│   │   └── ui/            # UI components (if needed)
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

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Start both frontend and backend in dev mode |
| `npm run dev:client` | Start frontend only                         |
| `npm run dev:server` | Start backend only                          |
| `npm run build`      | Build both frontend and backend             |
| `npm run test`       | Run tests with Vitest                       |
| `npm run test:ui`    | Run tests with Vitest UI                    |
| `npm run lint`       | Run ESLint                                  |
| `npm run format`     | Format code with Prettier                   |
| `npm run db:push`    | Push schema changes to database             |
| `npm run db:migrate` | Run database migrations                     |
| `npm run db:studio`  | Open Prisma Studio                          |
| `npm run db:seed`    | Seed the database                           |

## Database (Prisma)

### Schema Location

The database schema is defined in `prisma/schema.prisma`.

### Commands

| Command               | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run db:generate` | Regenerate Prisma Client after schema changes   |
| `npm run db:push`     | Push schema to DB (dev only, may lose data)     |
| `npm run db:migrate`  | Create and run migrations (safe for production) |
| `npm run db:studio`   | Open Prisma Studio GUI                          |
| `npm run db:seed`     | Seed the database                               |

### Development Workflow

#### Quick iteration (dev only)

Use `db:push` when rapidly prototyping. This syncs your schema directly but **may drop data**:

```bash
# Edit prisma/schema.prisma, then:
npm run db:push
```

#### Safe migrations (recommended)

Use `db:migrate` to create versioned migrations that preserve data:

```bash
# Edit prisma/schema.prisma, then:
npm run db:migrate
# Enter a name like "add_posts_table"
```

This creates a migration file in `prisma/migrations/` that you can commit to git.

### Common Schema Changes

#### Adding a new model

```prisma
model posts {
  id         String   @id @default(cuid())
  title      String
  content    String?
  author_id  String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  author     users    @relation(fields: [author_id], references: [id])
}

// Don't forget to add the relation to users:
model users {
  // ... existing fields
  posts posts[]
}
```

Then run:

```bash
npm run db:migrate
```

#### Adding a field to existing model

```prisma
model users {
  // ... existing fields
  avatar_url String?  // nullable = safe, no data loss
}
```

```bash
npm run db:migrate
```

#### Adding a required field (with existing data)

You need a default value or it will fail:

```prisma
model users {
  // Option 1: Default value
  role String @default("user")

  // Option 2: Make it nullable first, backfill, then make required
  phone String?
}
```

#### Renaming a field

Prisma will drop and recreate by default. To preserve data:

1. Add new field
2. Migrate
3. Backfill data with SQL
4. Remove old field
5. Migrate again

Or use `@map` to rename only the database column:

```prisma
model users {
  firstName String @map("first_name")  // Code uses firstName, DB uses first_name
}
```

### Resetting the Database

```bash
# Drop all data and recreate from migrations
npx prisma migrate reset

# Or drop everything and push schema fresh
npx prisma db push --force-reset
```

### Seeding

Edit `prisma/seed.ts` to add seed data:

```bash
npm run db:seed
```

Seeds run automatically after `prisma migrate reset`.

### Viewing Data

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Or use psql directly
psql $DATABASE_URL
```

---

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
