# Fishing Journal

A full-stack catch tracker for the Pacific Northwest fisherman — log species,
weight, length, location, and method, then read the season back as charts.

## Stack

- **TanStack Start** (`@tanstack/react-start`, Vite-based, file-based
  routing, server functions)
- **React 19** + **Tailwind CSS** (earthy outdoor theme, mobile-first)
- **Prisma** ORM on **Neon** serverless Postgres
- **Clerk** v6 for authentication via `@clerk/tanstack-react-start` (every
  record is scoped by Clerk `userId`)
- **TanStack Query** for client-side caching, wired through
  `routerWithQueryClient`
- **Recharts** for stats visualizations
- **Vercel** for deployment

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

You need:
- A **Neon** project — create one at <https://neon.tech>. Copy both the
  pooled URL (for `DATABASE_URL`) and the direct URL (for
  `DIRECT_DATABASE_URL` — Prisma migrations need a non-pooled connection).
- A **Clerk** application — create one at <https://dashboard.clerk.com>.
  Copy the publishable key into `VITE_CLERK_PUBLISHABLE_KEY` and the secret
  key into `CLERK_SECRET_KEY`.

### 3. Run migrations and seed

```bash
npm run db:migrate   # creates the schema in Neon
npm run db:seed      # seeds the PNW species list
```

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at <http://localhost:3000>. Sign in or sign up
through Clerk to access the dashboard.

## Project structure

```
app/
  components/         Reusable UI (CatchForm, StatTile)
  lib/                Validation schemas, formatters, cn()
  routes/             File-based routes (TanStack Router)
    __root.tsx        ClerkProvider + document shell
    index.tsx         Public landing page
    sign-in.$.tsx     Clerk sign-in catch-all
    sign-up.$.tsx     Clerk sign-up catch-all
    _app.tsx          Auth-gated layout (redirects to /sign-in if signed out)
    _app.dashboard.tsx
    _app.log.tsx
    _app.catches.index.tsx
    _app.catches.$id.tsx
    _app.stats.tsx
  server/             Server-only modules
    auth.ts           Clerk userId helpers (requireUserId, getOptionalUserId)
    db.ts             Prisma client singleton
    catches.ts        CRUD server functions for Catch
    stats.ts          Dashboard + stats server functions
  styles/globals.css  Tailwind layers and component classes
  router.tsx          getRouter(): router + QueryClient wiring
  vite-env.d.ts       Ambient Vite client types
prisma/
  schema.prisma       Catch, Species
  seed.ts             PNW species seed
vite.config.ts        @tanstack/react-start Vite plugin
```

The `@tanstack/react-start` plugin auto-generates `app/routeTree.gen.ts`
and creates the SSR/client entries — there are no hand-written
`client.tsx` / `ssr.tsx` files.

## Auth model

Every database query is scoped to the current Clerk `userId`. The
`requireUserId()` helper in `app/server/auth.ts` is called inside every
server function. Routes under the `_app` layout call `requireSignedIn` in
`beforeLoad` and redirect anonymous users to `/sign-in`.

## Deploy to Vercel

The repo is configured for Vercel:

1. Push to GitHub and import the repo into Vercel.
2. Add the same environment variables from `.env.example` in **Project
   Settings → Environment Variables**.
3. Vercel runs `prisma migrate deploy && vite build` (configured in
   `vercel.json`). Vite produces `dist/client/` (static) and
   `dist/server/server.js` (SSR entry). Vercel auto-detects the framework
   as a Vite SSR project; if it does not, set **Output Directory** to
   `dist/client` and point the serverless function at
   `dist/server/server.js`.

## Scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Run the Vite dev server                     |
| `npm run build`     | Production build (Vite SSR)                 |
| `npm run start`     | Serve the built `dist/server/server.js`     |
| `npm run typecheck` | Run `tsc --noEmit`                          |
| `npm run db:migrate`| `prisma migrate dev` against `DATABASE_URL` |
| `npm run db:deploy` | `prisma migrate deploy` (used in CI/Vercel) |
| `npm run db:seed`   | Seed the species table                      |
| `npm run db:generate` | Regenerate the Prisma Client              |
