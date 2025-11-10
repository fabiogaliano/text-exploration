# [React TanStarter](https://github.com/dotnize/react-tanstarter)

A minimal starter template for 🏝️ TanStack Start with Convex backend and auth. [→ Preview here](https://tanstarter.nize.ph/)

- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Convex](https://convex.dev/) backend + [Convex Auth](https://labs.convex.dev/auth/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Rolldown Vite](https://vite.dev/guide/rolldown.html) + [Nitro v3](https://v3.nitro.build/) (nightly)

## Getting Started

1. [Use this template](https://github.com/new?template_name=react-tanstarter&template_owner=dotnize) or clone this repository with gitpick:

   ```bash
   npx gitpick dotnize/react-tanstarter myapp
   cd myapp
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env.local` file in the project root with your Convex deployment URL:

   ```bash
   # Local development (run `bun convex:dev` first)
   VITE_CONVEX_URL=http://127.0.0.1:3210
   # Optional: also expose to server-side code
   CONVEX_URL=http://127.0.0.1:3210
   ```

   For production, replace the URL with your Convex cloud deployment URL (e.g. `https://your-app.convex.cloud`).

4. Start the Convex backend in a separate terminal:

   ```bash
   bun convex:dev
   ```

   This will run a local Convex deployment at `http://127.0.0.1:3210` and save its deployment name to `.env.local`.

5. Run the development server:

   ```bash
   bun run dev
   ```

   The app should now be running at [http://localhost:3000](http://localhost:3000) with Convex Auth login/signup pages.

## Deploying to production

1. Deploy your Convex backend:

   ```bash
   bun convex:deploy
   ```

   This will output your production Convex deployment URL.

2. Set your production environment variables (e.g. in Vercel/Netlify/Docker):

   ```bash
   VITE_CONVEX_URL=https://your-app.convex.cloud
   CONVEX_URL=https://your-app.convex.cloud
   ```

3. Build and deploy your app:

   ```bash
   bun run build
   # Deploy the .output folder to your hosting provider
   ```

The [vite config](./vite.config.ts#L16-L17) is currently configured to use [Nitro v3](https://v3.nitro.build/docs/nightly) (nightly) to deploy on Vercel, but can be easily switched to other providers.

Refer to the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) for deploying to other platforms.

## Issue watchlist

- [Router/Start issues](https://github.com/TanStack/router/issues) - TanStack Start is in RC.
- [Devtools releases](https://github.com/TanStack/devtools/releases) - TanStack Devtools is in alpha and may still have breaking changes.
- [Rolldown Vite](https://vite.dev/guide/rolldown.html) - We're using the experimental Rolldown-powered version of Vite by default.
- [Nitro v3 nightly](https://v3.nitro.build/docs/nightly) - The template is configured with Nitro v3 nightly by default.

## Goodies

#### Scripts

We use **bun** by default, but you can modify these scripts in [package.json](./package.json) to use your preferred package manager.

- **`convex:dev`** - Start the Convex local backend at `http://127.0.0.1:3210`.
- **`convex:deploy`** - Deploy your Convex functions to a cloud deployment.
- **`convex:dashboard`** - Open the Convex dashboard for the current deployment.
- **`ui`** - The shadcn/ui CLI. (e.g. `bun ui add button`)
- **`format`**, **`lint`**, **`check-types`** - Run Prettier, ESLint, and check TypeScript types respectively.
  - **`check`** - Run all three above. (e.g. `bun check`)
- **`deps`** - Selectively upgrade dependencies via taze.

#### Utilities

- [`src/lib/convex.ts`](./src/lib/convex.ts) - Isomorphic Convex client setup with environment-aware URL resolution.
- [`src/router.tsx`](./src/router.tsx) - TanStack Router with ConvexQueryClient integration for SSR-compatible data fetching.
- [`src/routes/__root.tsx`](./src/routes/__root.tsx) - Root layout with ConvexAuthProvider and theme provider.
- [`theme-toggle.tsx`](./src/components/theme-toggle.tsx), [`theme-provider.tsx`](./src/components/theme-provider.tsx) - A theme toggle and provider for toggling between light and dark mode. ([#7](https://github.com/dotnize/react-tanstarter/issues/7#issuecomment-3141530412))

## License

Code in this template is public domain via [Unlicense](./LICENSE). Feel free to remove or replace for your own project.

## Also check out

- [@tanstack/create-start](https://github.com/TanStack/create-tsrouter-app/blob/main/cli/ts-create-start/README.md) - The official CLI tool from the TanStack team to create Start projects.
- [awesome-tanstack-start](https://github.com/Balastrong/awesome-tanstack-start) - A curated list of awesome resources for TanStack Start.
