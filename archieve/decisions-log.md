# Decisions Log

A compact record of decisions that reversed or superseded earlier plans. Useful context if a choice is ever questioned.

---

## Architecture

**Fastify on Railway → Nuxt/Nitro server routes on Vercel**
The playground API was originally planned as a standalone Fastify service on Railway or Fly.io. Moved into Nuxt as Nitro server routes to collapse to a single deployment on Vercel. All API contracts are unchanged — only the runtime host changed. Vercel standard serverless supports the full Node.js runtime needed for graphql-gene (not Edge).

**GitHub API fetching at build time → git submodule**
The docs pipeline originally planned to fetch markdown from the GitHub API during `nuxt generate`. Replaced with a git submodule (`content/graphql-gene/`) so docs are on disk before the build starts. Eliminates API rate limits, network fragility, and offline development problems.

**Custom 9-step markdown ingestion pipeline → `@nuxt/content`**
A bespoke `lib/docs/` pipeline (file resolution, markdown parsing, route generation, sidebar trees, metadata extraction) was designed across multiple planning documents. Replaced entirely by `@nuxt/content`, which handles all of this natively. The only custom work remaining is loading `docs.config.ts` for section metadata.

---

## Docs Configuration

**`docs.config.ts` in website repo → moved to graphql-gene repo**
The manifest was originally planned to live in the website repo. Moved to the graphql-gene repo alongside the docs it describes, so the manifest travels with the docs via the submodule. Prevents the manifest going stale when docs are updated in a separate PR.

**Full page registry in `docs.config.ts` → sections only; metadata in frontmatter**
`docs.config.ts` originally defined a `pages` array with title, description, section, category, order, slug, status, and related for every page. This created a dual-maintenance problem. GitHub silently strips YAML frontmatter from the rendered markdown view — users never see it. Moved all per-page metadata into frontmatter. `@nuxt/content` reads frontmatter natively. `docs.config.ts` now contains only the `sections` array.

---

## Frontend State

**Pinia → Vue composables**
Pinia was originally the planned state solution for the playground. The playground scope is four API calls and editor panel state — not enough to justify a full store. Replaced with two composables: `usePlayground` and `useEditor`.

---

## Features Added

**URL-shareable playground state (in scope for MVP)**
Was originally listed as a future addition (post-MVP "saved share links"). Replaced with a simpler client-side approach: `scenarioId`, `exampleId`, and `query` are encoded in the URL hash on every change. No server persistence required. In scope for Phase 4.

**SQL output panel**
Added to the `query-lookahead` scenario (and later `polymorphic-blocks`). The `execution.sql` field on the query response carries the Sequelize-generated SQL string. Rendered in a third Monaco panel. The clearest proof of the lookahead value proposition.

**Pagefind full-text search**
Added as a Phase 5 post-build step. Runs `pagefind --source .output/public` after `nuxt generate`. Produces a static index served from the same CDN. No external service, no API key.

**"Try in Playground" doc callouts**
Documentation pages with `playgroundScenario` frontmatter render a callout block linking to the playground with that scenario pre-loaded. Implemented as a Vue MDC component (`DocsPlaygroundCallout.vue`). The playground reads URL parameters on mount to restore the named state.
