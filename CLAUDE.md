# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TanStack Start application - a full-stack React framework built on TanStack Router with SSR capabilities. The stack includes React 19 with React Compiler, TanStack Start/Router/Query, Tailwind CSS with shadcn/ui, Drizzle ORM with PostgreSQL, and Better Auth for authentication.

Key architectural choices:
- **Experimental builds**: Uses Rolldown Vite (experimental) and Nitro v3 nightly for deployment
- **React Compiler**: Enabled via babel-plugin-react-compiler targeting React 19 - optimizes components automatically
- **Server functions**: TanStack Start's server-only functions pattern (see `createServerOnlyFn`)
- **Data fetching**: React Query handles client-side caching, Better Auth has server-side cookie cache
- **File-based routing**: Routes auto-generated from `src/routes/` directory structure

## Commands

Use **bun** as the package manager (per user's global settings):

```bash
# Development
bun dev                    # Start dev server on port 3000
bun build                  # Build for production
bun start                  # Run production build

# Quality checks
bun lint                   # Run ESLint
bun format                 # Run Prettier
bun check-types            # Run TypeScript type checking
bun check                  # Run format, lint, and check-types together

# Database (Drizzle)
bun db generate            # Generate migration from schema changes
bun db push                # Push schema directly to database (dev)
bun db studio              # Open Drizzle Studio

# Authentication (Better Auth)
bun auth:secret            # Generate BETTER_AUTH_SECRET for .env
bun auth:generate          # Regenerate auth schema from auth.ts config

# UI Components (shadcn/ui)
bunx shadcn@latest add <component>  # Add shadcn/ui component (e.g., bunx shadcn@latest add button)

# Dependencies
bun deps                   # Interactive dependency upgrades via taze
bun deps:major             # Interactive major version upgrades
```

## Architecture

### Routing & File Structure

Routes are file-based in `src/routes/`:
- `__root.tsx` - Root layout with providers (theme, query client, devtools)
- `index.tsx` - Home/landing page
- `(auth-pages)/` - Layout group for login/signup (parentheses = layout without URL segment)
- `(authenticated)/` - Protected routes layout with auth middleware
- `api/auth/$.ts` - Catch-all API route for Better Auth endpoints

Route files export `Route` created via TanStack Router's `createFileRoute()` or layout route creators.

### Server vs Client Code

**Critical pattern**: Server-only code must use `createServerOnlyFn()` wrapper:
```typescript
import { createServerOnlyFn } from "@tanstack/react-start";

const getDatabase = createServerOnlyFn(() =>
  drizzle({ client: driver, schema, casing: "snake_case" })
);
export const db = getDatabase();
```

This ensures code only runs on server (e.g., database clients, auth config with secrets).

### Authentication Flow

**Better Auth** configuration:
- Server config: `src/lib/auth/auth.ts` (uses `createServerOnlyFn`)
- Client config: `src/lib/auth/auth-client.ts` (React hooks for client components)
- Queries: `src/lib/auth/queries.ts` (React Query integration for session)
- Middleware: `src/lib/auth/middleware.ts` (`authMiddleware` for protected routes)
- Providers: GitHub and Google OAuth configured (email/password also enabled)

**Protected routes pattern** (see `src/routes/(authenticated)/route.tsx`):
1. Use `context.queryClient.ensureQueryData()` with `authQueryOptions()` in route's `beforeLoad`
2. Set `revalidateIfStale: true` to ensure fresh session data
3. Throw redirect to `/login` if no session
4. Return user to update context type for child routes

**Public prefetch pattern** (see `src/routes/__root.tsx`):
- Use `context.queryClient.prefetchQuery()` for non-blocking auth check on landing pages
- Don't await - just warm the cache for faster subsequent loads

**Auth schema**: Generated via `bun auth:generate` from Better Auth config into `src/lib/db/schema/auth.schema.ts`. Do not manually edit this file.

### Data Layer

**Drizzle ORM** setup:
- Database client: `src/lib/db/index.ts` (server-only)
- Schema: `src/lib/db/schema/index.ts` (exports all schemas)
- Auth schema: `src/lib/db/schema/auth.schema.ts` (auto-generated)
- Config: `drizzle.config.ts` (uses snake_case for column names)

**Important**: Database uses `snake_case` casing convention. Drizzle automatically converts between JS camelCase and DB snake_case.

### Environment Variables

Two separate env files:
- `src/env/server.ts` - Server-only env vars (DATABASE_URL, secrets, OAuth credentials)
- `src/env/client.ts` - Client-accessible env vars (VITE_ prefix only)

Both use `@t3-oss/env-core` for Zod validation. See `.env.example` for required variables.

### React Query Integration

Router and React Query are deeply integrated via `setupRouterSsrQueryIntegration()` in `src/router.tsx`:
- Query client configured with 2-minute stale time
- `defaultPreloadStaleTime: 0` - Router defers to React Query for data fetching
- Session data prefetched in `__root.tsx` beforeLoad (non-blocking)
- Protected routes await session query for loader data

### Styling

**Tailwind CSS v4** with shadcn/ui:
- Components: `src/components/ui/` (auto-generated via `bun ui add`)
- Utilities: `src/lib/utils.ts` (`cn()` helper for conditional classes)
- Theme: Dark mode via `next-themes` in `ThemeProvider`

## Development Patterns

### Adding Protected Routes

1. Create route file in `src/routes/(authenticated)/`
2. Route inherits `authMiddleware` from `(authenticated)/route.tsx`
3. Access user via route context: `const { user } = Route.useRouteContext()`

### Adding Server Functions

```typescript
import { createServerFn } from "@tanstack/react-start";

export const myServerFn = createServerFn()
  .middleware([authMiddleware]) // Optional: force auth
  .handler(async ({ context }) => {
    // context.user available if authMiddleware used
    // Access db, env.server, etc.
  });
```

Call from client: `await myServerFn()`

### Database Schema Changes

1. Edit schema in `src/lib/db/schema/`
2. Run `bun db push` (dev) or `bun db generate` (production migrations)
3. Never manually edit `auth.schema.ts` - regenerate via `bun auth:generate`

### OAuth Provider Setup

Currently configured providers: GitHub, Google (optional - check `.env.example`)

To add/configure providers:
1. Add credentials to `.env`: `<PROVIDER>_CLIENT_ID` and `<PROVIDER>_CLIENT_SECRET`
2. Update `src/env/server.ts` validation schema if adding new providers
3. Update `socialProviders` in `src/lib/auth/auth.ts`
4. Set OAuth callback URL in provider's dashboard: `{VITE_BASE_URL}/api/auth/callback/<provider>`
   - Example: `http://localhost:3000/api/auth/callback/github`

## Key Files

- `src/router.tsx` - Router configuration with React Query integration
- `src/routes/__root.tsx` - Root layout, providers, SEO head defaults
- `src/lib/auth/middleware.ts` - Authentication middleware for server functions
- `src/lib/utils.ts` - Shared utilities (currently just `cn()` class merger)
- `vite.config.ts` - Vite plugins: React Compiler, Tailwind, Nitro, TanStack Start
- `drizzle.config.ts` - Drizzle Kit configuration for migrations

## Important Notes

- **Route generation**: `src/routeTree.gen.ts` is auto-generated - never edit manually
- **Type safety**: Router context types defined in `__root.tsx` (`QueryClient` and `user`)
- **Session caching**: Dual-layer caching (React Query client-side + Better Auth cookie server-side)
  - Middleware can bypass cookie cache with `disableCookieCache: true` when fresh data is needed
- **Middleware context**: `authMiddleware` adds `user` to context, accessible in server functions
- **OAuth callbacks**: Must match pattern `/api/auth/callback/<provider>` in OAuth app settings
- **Experimental dependencies**: Monitor README.md issue watchlist for breaking changes in Rolldown Vite and Nitro v3
