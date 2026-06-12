# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core commands
- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Build production bundle: `npm run build`
- Start production server (after build): `npm run start`
- Run lint checks: `npm run lint`
- Lint a specific file: `npx eslint app/page.tsx`

## Tests
- There is currently no test runner configured in `package.json` and no test files are present.
- Before adding or editing tests, first add a test framework and scripts, then document project-standard commands here.

## High-level architecture
- This is a Next.js App Router project (Next 16, React 19) with a small single-route UI scaffold.
- Routing is file-based under `app/`:
  - `app/layout.tsx` is the global shell (fonts, `Navbar`, full-screen `LightRays` background, and `<main>` container for route content).
  - `app/page.tsx` renders the home page and maps static event data into cards.
- Data flow is currently static:
  - `lib/constants.ts` is the canonical source of event card content.
  - `app/page.tsx` consumes `events` directly and passes each item to `components/EventCard.tsx`.
- UI composition is split between server and client components:
  - `app/page.tsx` and `app/layout.tsx` are server-rendered by default.
  - Interactive analytics components (`components/ExploreBtn.tsx`, `components/EventCard.tsx`) are client components and call `posthog.capture(...)` on click handlers.
  - `components/LightRays.tsx` is a client-side WebGL/OGL effect mounted globally from the layout.

## Analytics and instrumentation
- PostHog initialization lives in `instrumentation-client.ts`.
- `next.config.ts` rewrites `/ingest/*` to PostHog EU endpoints; this is required for the configured `api_host: "/ingest"` client setup.
- Required environment variable: `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (used at client init time).

## Styling system
- Tailwind CSS v4 is configured via `postcss.config.mjs` and imported in `app/globals.css`.
- `app/globals.css` defines:
  - shared theme tokens in `:root`,
  - custom utilities (`flex-center`, `text-gradient`, `glass`, `card-shadow`),
  - component-level selectors for navbar/event layouts.
- `components.json` indicates shadcn/ui-style aliasing and paths (`@/components`, `@/lib/utils`), even though the current UI is mostly custom.

## Conventions and constraints to preserve
- Use the `@/*` path alias from `tsconfig.json` instead of deep relative imports.
- Keep `next.config.ts` ingestion rewrites in sync with PostHog client config when touching analytics.
- This project is on newer Next.js behavior; before changing framework-level patterns, consult `node_modules/next/dist/docs/` and account for deprecations/breaking changes.
