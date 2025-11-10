# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TanStack Start application - a full-stack React framework built on TanStack Router with SSR capabilities. The stack includes React 19 with React Compiler, TanStack Start/Router/Query, Tailwind CSS with shadcn/ui, Convex for backend and database, and Convex Auth for authentication.

Key architectural choices:
- **Experimental builds**: Uses Rolldown Vite (experimental) and Nitro v3 nightly for deployment
- **React Compiler**: Enabled via babel-plugin-react-compiler targeting React 19 - optimizes components automatically
- **Convex backend**: Serverless backend with real-time subscriptions and type-safe queries/mutations
- **Data fetching**: React Query integration via `@convex-dev/react-query` for client-side caching with live updates
- **File-based routing**: Routes auto-generated from `src/routes/` directory structure
- **Convex functions**: Server-side logic in `convex/` directory, automatically deployed

## Commands

Use **bun** as the package manager (per user's global settings):

```bash
# Development
bun dev                    # Start TanStack Start dev server on port 3000
bun build                  # Build for production
bun start                  # Run production build

# Convex
bun convex:dev             # Start Convex dev deployment (run in separate terminal)
bun convex:deploy          # Deploy Convex functions to production
bun convex:dashboard       # Open Convex dashboard in browser

# Quality checks
bun lint                   # Run ESLint
bun format                 # Run Prettier
bun check-types            # Run TypeScript type checking
bun check                  # Run format, lint, and check-types together

# UI Components (shadcn/ui)
bunx shadcn@latest add <component>  # Add shadcn/ui component (e.g., bunx shadcn@latest add button)

# Dependencies
bun deps                   # Interactive dependency upgrades via taze
bun deps:major             # Interactive major version upgrades
```

**Development workflow**: Run `bun convex:dev` and `bun dev` concurrently in separate terminals for local development.

## Architecture

### Routing & File Structure

Routes are file-based in `src/routes/`:
- `__root.tsx` - Root layout with providers (Convex Auth, theme, query client, devtools)
- `index.tsx` - Home/landing page
- `(auth-pages)/` - Layout group for login/signup (parentheses = layout without URL segment)
- `(authenticated)/` - Protected routes layout with auth check

Route files export `Route` created via TanStack Router's `createFileRoute()` or layout route creators.

### Convex Backend Structure

Convex functions live in `convex/` directory:
- `schema.ts` - Database schema definition (tables, indexes)
- `auth.config.ts` - Convex Auth configuration (OAuth providers)
- `http.ts` - HTTP routes for OAuth callbacks
- `users.ts` - User-related queries/mutations
- `_generated/` - Auto-generated types and API (never edit manually)

### Authentication Flow

**Convex Auth** configuration:
- Auth config: `convex/auth.config.ts` (GitHub and Google OAuth providers)
- HTTP routes: `convex/http.ts` (OAuth callback handlers)
- User queries: `convex/users.ts` (current user query)
- Client hooks: `useAuthActions()` from `@convex-dev/auth/react` (signIn, signOut)
- Provider: `ConvexAuthProvider` wraps app in `src/routes/__root.tsx`

**Protected routes pattern** (see `src/routes/(authenticated)/route.tsx`):
1. Use `context.queryClient.ensureQueryData()` with `convexQuery(api.users.current, {})` in route's `beforeLoad`
2. Set `revalidateIfStale: true` to ensure fresh session data
3. Throw redirect to `/login` if no session
4. Return user to update context type for child routes

**Public prefetch pattern** (see `src/routes/__root.tsx`):
- Use `context.queryClient.prefetchQuery(convexQuery(api.users.current, {}))` for non-blocking auth check
- Don't await - just warm the cache for faster subsequent loads

**OAuth providers**:
- GitHub and Google configured in `convex/auth.config.ts`
- Callback URLs: `https://<deployment>.convex.cloud/api/auth/callback/<provider>`

### Data Layer

**Convex** backend:
- Schema: `convex/schema.ts` (defines all tables using `defineSchema` and `authTables`)
- Queries: TypeScript functions in `convex/*.ts` that fetch data
- Mutations: TypeScript functions that modify data
- Real-time subscriptions: Automatic via Convex - queries live-update on data changes
- Type generation: `convex/_generated/api.ts` provides fully typed API

**Convex schema pattern**:
```typescript
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // Your custom tables here
});

export default schema;
```

**Accessing auth in Convex functions**:
```typescript
import { auth } from "./auth.config";
import { query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});
```

### Environment Variables

Two separate env files:
- `src/env/server.ts` - Server-only env vars (OAuth credentials)
- `src/env/client.ts` - Client-accessible env vars (VITE_ prefix, including VITE_CONVEX_URL)

Both use `@t3-oss/env-core` for Zod validation. See `.env.example` for required variables.

**Important**: `VITE_CONVEX_URL` is auto-generated when you run `bun convex:dev` and saved to `.env.local`.

### React Query + Convex Integration

Router and React Query are integrated with Convex via `ConvexQueryClient` in `src/router.tsx`:
- `ConvexClient` created with deployment URL from `env.VITE_CONVEX_URL`
- `ConvexQueryClient` wraps Convex client for React Query integration
- Query client configured with 2-minute stale time and Convex query functions
- `convexQueryClient.connect(queryClient)` enables live subscriptions
- `defaultPreloadStaleTime: 0` - Router defers to React Query for data fetching

**Using Convex queries in components**:
```typescript
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";

function MyComponent() {
  const { data } = useSuspenseQuery(convexQuery(api.users.current, {}));
  // data automatically updates in real-time
}
```

### Styling

**Tailwind CSS v4** with shadcn/ui:
- Components: `src/components/ui/` (auto-generated via `bunx shadcn@latest add`)
- Utilities: `src/lib/utils.ts` (`cn()` helper for conditional classes)
- Theme: Dark mode via `next-themes` in `ThemeProvider`

## Development Patterns

### Adding Protected Routes

1. Create route file in `src/routes/(authenticated)/`
2. Route inherits auth check from `(authenticated)/route.tsx`
3. Access user via route context: `const { user } = Route.useRouteContext()`

### Adding Convex Queries/Mutations

Create new files in `convex/` directory:

**Query example** (`convex/posts.ts`):
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

**Mutation example** (`convex/posts.ts`):
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", args);
    return postId;
  },
});
```

**Using in components**:
```typescript
import { convexQuery, convexMutation } from "@convex-dev/react-query";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";

const { data: posts } = useSuspenseQuery(convexQuery(api.posts.list, {}));
const createPost = useMutation(convexMutation(api.posts.create));
```

### Database Schema Changes

1. Edit `convex/schema.ts` to add/modify tables
2. Convex automatically handles schema migrations on deployment
3. No manual migration generation needed - schema changes are applied automatically
4. Never edit `authTables` - these are managed by `@convex-dev/auth`

### OAuth Provider Setup

Currently configured providers: GitHub, Google

To add/configure providers:
1. Add credentials to `.env`:
   - `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
   - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
2. Import provider in `convex/auth.config.ts`:
   ```typescript
   import GitHub from "@auth/core/providers/github";
   import Google from "@auth/core/providers/google";

   export const { auth, signIn, signOut, store } = convexAuth({
     providers: [GitHub, Google],
   });
   ```
3. Set OAuth callback URL in provider's dashboard:
   - Dev: Use Convex dev deployment URL (e.g., `https://funny-tiger-123.convex.cloud/api/auth/callback/github`)
   - Prod: Use production deployment URL
   - Find your deployment URL in Convex dashboard or from `VITE_CONVEX_URL`

### Adding Real-time Features

Convex queries automatically subscribe to live updates. No additional code needed:

```typescript
// This query will automatically re-render when data changes
const { data: messages } = useSuspenseQuery(convexQuery(api.messages.list, {}));
```

## Key Files

- `src/router.tsx` - Router configuration with Convex + React Query integration
- `src/routes/__root.tsx` - Root layout, ConvexAuthProvider, providers, SEO head defaults
- `src/lib/utils.ts` - Shared utilities (currently just `cn()` class merger)
- `vite.config.ts` - Vite plugins: React Compiler, Tailwind, Nitro, TanStack Start
- `convex/schema.ts` - Database schema definition
- `convex/auth.config.ts` - Convex Auth configuration
- `convex/_generated/api.ts` - Auto-generated Convex API types

## Important Notes

- **Route generation**: `src/routeTree.gen.ts` is auto-generated - never edit manually
- **Convex generation**: `convex/_generated/` is auto-generated - never edit manually
- **Type safety**: Router context types defined in `__root.tsx` (`QueryClient` and `user`)
- **Real-time updates**: All Convex queries subscribe to live data changes automatically
- **Deployment**: Convex provides separate dev and production deployments
- **Local development**: Convex dev deployment is cloud-hosted (not offline) but isolated from production
- **OAuth callbacks**: Must use Convex deployment URL pattern `https://<deployment>.convex.cloud/api/auth/callback/<provider>`
- **Session management**: Convex Auth handles sessions via JWT tokens (no cookies)
- **Experimental dependencies**: Monitor README.md issue watchlist for breaking changes in Rolldown Vite and Nitro v3

## Convex Development Notes

- **Dev deployment**: `bun convex:dev` creates an isolated cloud dev environment (requires internet)
- **Schema validation**: Convex validates all writes against the schema at runtime
- **Function logs**: View in Convex dashboard (Functions > Logs)
- **Database browser**: Use Convex dashboard (Data tab) to inspect tables
- **Type generation**: Happens automatically when Convex dev server detects file changes
- **Authentication state**: Managed by `ConvexAuthProvider` - access via `useAuthActions()` hooks
