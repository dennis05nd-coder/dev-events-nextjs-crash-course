<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the DevEvent Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`** (new): Initializes PostHog client-side using the Next.js 15.3+ `instrumentation-client` pattern. PostHog is configured with a reverse proxy (`/ingest`), exception capture enabled, and debug mode in development.
- **`next.config.ts`** (updated): Added reverse proxy rewrites routing `/ingest/*` traffic through Next.js to the EU PostHog ingestion endpoint, and `/ingest/static/*` and `/ingest/array/*` to the EU assets CDN. `skipTrailingSlashRedirect` enabled as required.
- **`components/ExploreBtn.tsx`** (updated): Added `posthog.capture('explore_events_clicked')` on button click.
- **`components/EventCard.tsx`** (updated): Converted to a client component and added `posthog.capture('event_card_clicked', { event_title, event_slug, event_location, event_date })` on card click.
- **`.env.local`** (new): PostHog project token and EU host written as environment variables. Covered by `.gitignore`.

Page views are automatically captured by `posthog-js` on every route transition — no explicit instrumentation needed.

| Event | Description | File |
|---|---|---|
| `$pageview` | Automatic page view on every route (built-in) | `instrumentation-client.ts` |
| `explore_events_clicked` | User clicks the "Explore Events" CTA button | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks an event card to view details | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/198423/dashboard/740131)
- [Event Card Clicks Over Time](https://eu.posthog.com/project/198423/insights/cXVG466M)
- [Explore Button Clicks Over Time](https://eu.posthog.com/project/198423/insights/BEocLvfU)
- [Page Views Over Time](https://eu.posthog.com/project/198423/insights/sAbVyrXv)
- [Most Clicked Events (by title)](https://eu.posthog.com/project/198423/insights/zy1776Ro)
- [Discovery Funnel: Pageview → Explore → Event Click](https://eu.posthog.com/project/198423/insights/yv0fy1Wj)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
