# Recommended Tech Stack

## Purpose

This document proposes a practical tech stack for the graphql-gene website and real backend-powered playground.

The recommendations below are based on the current documentation signals:

- graphql-gene is clearly positioned around TypeScript
- Sequelize and `@graphql-gene/plugin-sequelize` are central to the current product story
- the docs mention static documentation tooling such as VitePress or Docusaurus
- the product site should feel modern, technical, and documentation-friendly

## Recommendation Summary

### Website

- `Nuxt 4`
- `Vue 3`
- `TypeScript`
- `Vite`
- `Tailwind CSS` or a lightweight custom design system
- a GitHub-backed markdown ingestion layer for the public docs experience

### Documentation

- canonical docs stored in GitHub
- markdown files kept clean for GitHub readers
- a repository-owned docs manifest or config as the content classification contract
- a website-side ingestion/rendering pipeline rather than a second authoring surface

> **Amendment (2026-05-20):** Add `Pagefind` to the documentation toolchain. Runs as a post-build CLI step (`pagefind --source .output/public`), generates a static search index, and requires no external service. The Nuxt docs layout gets a search input component that queries the local index.
>
> **Amendment (2026-05-20):** Replace the custom ingestion pipeline with `@nuxt/content`. It handles markdown parsing, route generation, navigation, and syntax highlighting (via Shiki) out of the box. The `docs.config.ts` manifest is still needed and still used — but only for section definitions. See the frontmatter amendment below.
>
> Add **git submodule** to pull the graphql-gene docs into the website repo's `content/` directory. This replaces GitHub API fetching at build time — docs are on disk before the build starts, no network call required. The submodule is updated with `git submodule update --remote` before `nuxt generate` runs.
>
> **Amendment (2026-05-20) — frontmatter replaces per-page manifest entries:**
> GitHub does **not** show frontmatter to users in the rendered markdown view — it is silently stripped. Per-page metadata (`title`, `description`, `section`, `category`, `order`, `slug`, `status`, `summary`, `playgroundScenario`) moves into YAML frontmatter directly in each doc file. `@nuxt/content` reads frontmatter natively with zero custom code. `docs.config.ts` is reduced to **section definitions only** — no `pages` array.

### Playground Frontend

- `Vue 3`
- `TypeScript`
- `Monaco Editor`
- `Pinia` for local playground state
- `GraphQL syntax highlighting` support
- `Zod` for client-side payload validation

### Playground Backend

- `Node.js`
- `TypeScript`
- `Fastify`
- `graphql-gene`
- `@graphql-gene/plugin-sequelize`
- `Zod` for request validation

### Demo Runtime and Data Layer

- `Sequelize`
- `SQLite` for local or ephemeral demo execution
- structured seed fixtures for each demo scenario

### Deployment

- website on `Vercel` or `Netlify`
- backend playground API on `Railway`, `Fly.io`, or a small container host

## Why This Stack Fits

## 1. Website Stack

### Recommendation

Use `Nuxt 4 + Vue 3 + TypeScript`.

### Why

- the user explicitly wants a `vuejs.org`-style site
- Vue is already adjacent to the desired product experience
- Nuxt gives strong routing, content, and SSR support without unnecessary complexity
- it supports a documentation-heavy marketing site very well
- it can render GitHub-sourced docs and the interactive product site in one cohesive surface

### Alternative

If the team wants a simpler docs-first approach and fewer custom marketing interactions, `VitePress` is a valid alternative. However, for a richer homepage plus embedded real playground, `Nuxt` is the stronger long-term choice.

## 2. Documentation Layer

### Recommendation

Use GitHub as the canonical documentation source and let the website ingest and render that content.

### Why

- preserves one source of truth for documentation content
- prevents content drift between GitHub and the public website
- allows the website to add navigation, branding, search, and interactive embeds without becoming a second docs authoring surface
- makes it easier to embed playground callouts and interactive examples inside docs pages
- keeps Markdown pages cleaner for direct GitHub reading when classification metadata is stored in a separate manifest

### Alternative

Use a dedicated docs app such as `VitePress` only if the team intentionally wants a separate documentation surface. That is no longer the default recommendation under the current "GitHub is the canonical source, website renders it" decision.

### Implementation Note

The local `docs/` folder in this workspace should remain internal implementation documentation. It should not be treated as the public content source for the website.

For public docs classification, prefer a repository-owned manifest such as `docs.config.ts` or `docs-manifest.json` over YAML frontmatter inside every Markdown page.

## 3. Playground Frontend Stack

### Recommendation

Use:

- `Vue 3`
- `TypeScript`
- `Monaco Editor`
- `Pinia`
- `Zod`

### Why

- Vue aligns with the target website feel
- TypeScript aligns with the graphql-gene audience and product identity
- Monaco provides the right "real developer tool" feel
- Monaco should be used for both the editable structured-input surface and the read-only code-like output panels
- Pinia is enough for isolated playground state without adding unnecessary complexity
- Zod helps keep client payloads consistent with backend contracts

> **Amendment (2026-05-20):** Drop `Pinia`. The playground scope is four API calls and editor panel state. Vue composables (`usePlayground`, `useEditor`) cover this without the overhead of a full state store. Pinia adds boilerplate for no meaningful gain at this scale.

## 4. Playground Backend Stack

### Recommendation

Use `Fastify + TypeScript`.

### Why

- Fastify is lightweight, fast, and well suited for a focused JSON API
- it has a clean plugin model and good runtime performance
- it is simpler than a larger framework such as Nest for this MVP

### Why Not Start With Nest

Nest is reasonable, but it adds more structure than this small playground backend needs on day one. Unless the team already standardizes on Nest, Fastify is the better MVP fit.

> **Amendment (2026-05-20):** Replace the standalone `Fastify` service with **Nuxt/Nitro server routes**. The playground API endpoints (`/api/playground/*`) move into the Nuxt app as Nitro server routes. This collapses the architecture to one deployment, removes the cross-origin configuration, and eliminates the Railway/Fly.io service entirely.
>
> **Why this is safe:** Nitro server routes run full Node.js on Vercel's standard serverless runtime (not Edge). The playground's execution targets — 2–3s for generation, 3–5s for queries — are well within Vercel's 60s function timeout on Pro.
>
> **Cold start mitigation:** Send a lightweight `GET /api/health` ping from the frontend on playground page load to pre-warm the function before the user triggers their first scenario.
>
> **What does not change:** all API contracts from `03-backend-api-contracts.md` remain identical. Only the runtime host changes.

## 5. Runtime Integration Stack

### Recommendation

Use:

- `graphql-gene`
- `@graphql-gene/plugin-sequelize`
- `Sequelize`
- `SQLite`

### Why

- this is the clearest documented product path today
- the docs repeatedly reference Sequelize-specific behaviors such as `getQueryInclude`, `@Polymorphic`, and model-driven generation
- SQLite is sufficient for demo scenarios and keeps setup lightweight

### Future Upgrade Path

If the demo backend later needs higher fidelity or shared staging environments, move from SQLite to `PostgreSQL`. For MVP, that is unnecessary complexity.

## 6. Validation and Contracts

### Recommendation

Use `Zod` on both frontend and backend.

### Why

- one of the biggest risks in a public playground is malformed input
- shared schema validation improves reliability
- it keeps the API contract explicit and maintainable

## 7. Styling and Design System

### Recommendation

Use either:

- `Tailwind CSS` with a tightly controlled design token layer
- or a small custom SCSS/CSS token system if the team wants stricter authored styling

### Why

- the site needs strong visual control, not a generic template look
- Tailwind is fast for implementation, but it should be paired with deliberate design tokens
- the brand identity already defines typography, color behavior, and motion direction

## 8. Hosting Recommendation

### Website

Recommended:

- `Vercel`

Why:

- excellent fit for Nuxt deployment
- simple preview workflow
- good developer ergonomics

### Backend API

Recommended:

- `Railway` or `Fly.io`

Why:

- easy small-service deployment
- container-friendly growth path
- simple enough for an MVP playground backend

> **Amendment (2026-05-20):** The backend API no longer requires a separate host. With the Fastify → Nitro server routes amendment above, the playground API runs inside the same Nuxt app on Vercel. `Railway` and `Fly.io` are no longer needed for MVP. Revisit only if the playground runtime outgrows Vercel's serverless function constraints (memory, timeout, or cold-start tolerance).

## 9. Recommended Final Stack

If choosing one concrete stack today, the best default is:

- `Nuxt 4`
- `Vue 3`
- `TypeScript`
- a GitHub-backed markdown ingestion pipeline
- a docs manifest ingestion and validation layer
- `Monaco Editor`
- `Pinia`
- `Fastify`
- `Zod`
- `graphql-gene`
- `@graphql-gene/plugin-sequelize`
- `Sequelize`
- `SQLite`
- `Vercel` for the website
- `Railway` or `Fly.io` for the backend API

> **Amendment (2026-05-20) — Revised final stack:**
>
> - `Nuxt 4`
> - `Vue 3`
> - `TypeScript`
> - a GitHub-backed markdown ingestion pipeline
> - a docs manifest ingestion and validation layer
> - `Monaco Editor`
> - ~~`Pinia`~~ → Vue composables (`usePlayground`, `useEditor`)
> - ~~`Fastify`~~ → Nuxt/Nitro server routes
> - `Zod`
> - `graphql-gene`
> - `@graphql-gene/plugin-sequelize`
> - `Sequelize`
> - `SQLite`
> - `Vercel` for the entire project (website + API in one deployment)
> - ~~`Railway` or `Fly.io`~~ → eliminated

## 10. Decision Notes

This recommendation is optimized for:

- fast MVP delivery
- strong alignment with the requested Vue-style experience
- a real backend-powered playground
- low infrastructure complexity
- future expansion without rewriting the entire foundation

It is not the only valid stack, but it is the most coherent one based on the current docs and product direction.
