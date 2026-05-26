# Implementation Decisions Summary

## Purpose

This document summarizes the implementation decisions already captured across the internal `docs/` folder.

It is intended to serve as a single internal reference for the website, playground, backend, and documentation integration strategy.

This file is **not** part of the public documentation surface.

## 1. Product Direction

The website is not just a marketing shell. It must prove that `graphql-gene` is a serious technical product.

The core product story is:

- ORM-native GraphQL generation
- real backend-powered demo behavior
- strong support for advanced GraphQL patterns
- clear value for TypeScript and backend teams

The audience is primarily senior engineers evaluating architecture quality, runtime behavior, and scalability of the approach.

## 2. Public Website Scope

The public website should include:

- a modern `vuejs.org`-inspired marketing experience
- a real interactive playground
- a public documentation experience

The playground must demonstrate actual product behavior, not a frontend-only fake simulation.

## 3. Canonical Documentation Decision

The public documentation source of truth is GitHub.

That means:

- documentation content lives in the canonical GitHub docs source
- documentation classification lives in a repository-owned docs manifest or config
- the website renders that content
- the website may enrich it with navigation, styling, search metadata, and embedded interactive elements
- the local workspace `docs/` folder remains internal and implementation-only

The website must **not** treat the local `docs/` folder as its public docs content source.

## 4. Website and Runtime Architecture

The implementation is split into two main surfaces:

### Website Surface

Responsibilities:

- marketing pages
- public docs rendering
- playground user interface

### Backend Runtime Surface

Responsibilities:

- structured request intake
- scenario validation
- graphql-gene execution
- schema generation
- query execution
- result formatting
- safe diagnostics

This separation keeps the website lightweight and allows the demo runtime to evolve independently.

## 5. Playground Strategy

The playground must use a real backend execution path.

It should communicate four core capabilities:

1. model-to-schema generation
2. query-shaped loading or lookahead behavior
3. directive-aware runtime behavior
4. polymorphic associations or blocks

The product experience should feel real, but the execution surface must stay constrained.

## 6. MVP Scenario Priorities

The planned build order is:

1. `model-to-schema`
2. `query-lookahead`
3. `polymorphic-blocks`
4. `directive-middleware`

This order starts with the clearest proof of value and then expands toward more advanced capabilities.

## 7. Security and Operating Boundaries

The MVP must not become a generic remote code execution environment.

The agreed boundaries are:

- structured input only
- curated example registry
- no arbitrary TypeScript or JavaScript execution
- no arbitrary package loading
- no persistent user workspaces
- strict timeout and payload limits
- safe error responses with no raw stack traces

Users should be able to explore behavior, not upload and run open-ended app code.

## 8. API Contract Direction

The frontend and backend communicate through structured scenario-based APIs.

The agreed backend surface includes:

- `GET /api/playground/examples`
- `POST /api/playground/generate`
- `POST /api/playground/query`
- `POST /api/playground/directives`

All responses should include:

- `requestId`
- `status`
- structured result data
- diagnostics or safe error payloads

The frontend should never depend on internal graphql-gene runtime details.

## 9. Recommended Tech Stack

The current recommended implementation stack is:

### Website

- `Nuxt 4`
- `Vue 3`
- `TypeScript`

### Public Docs Rendering

- GitHub-backed markdown ingestion
- manifest-based taxonomy and routing

> **Amendment (2026-05-20):** Three decisions changed for the docs layer:
>
> 1. **Git submodule replaces GitHub API fetching.** The graphql-gene repo is a submodule inside the website repo at `content/graphql-gene/`. Docs are on disk before the build starts. No rate limits, no network fragility, no offline development problem. Updated before each deploy with `git submodule update --remote`.
>
> 2. **`@nuxt/content` replaces the custom ingestion pipeline.** Markdown parsing, route generation, navigation APIs, syntax highlighting, and MDC component support are all handled by the module. The 9-step custom `lib/docs/` pipeline described in `11-docs-ingestion-flow.md` is dropped.
>
> 3. **`docs.config.ts` moves to the graphql-gene repo.** It lives alongside the docs it describes and arrives in the website via the submodule. This prevents the manifest from going stale across two repos.
>
> **Updated build sequence:** `git submodule update --remote` → `nuxt generate` → `pagefind --source .output/public`
>
> **Amendment (2026-05-20) — frontmatter replaces per-page manifest entries:**
> GitHub does **not** show frontmatter to users in the rendered markdown view — it is silently stripped. Per-page metadata (`title`, `description`, `section`, `category`, `order`, `slug`, `status`, `summary`, `playgroundScenario`) moves into YAML frontmatter directly in each doc file. `@nuxt/content` reads frontmatter natively with zero custom code. `docs.config.ts` is reduced to **section definitions only** — no `pages` array.

### Playground Frontend

- `Vue 3`
- `TypeScript`
- `Monaco Editor`
- `Pinia`
- `Zod`

Monaco is the selected playground editor surface, not just a candidate. It should power the structured input editor and code-like output viewing experience.

> **Amendment (2026-05-20):** Drop `Pinia`. Replaced by Vue composables (`usePlayground`, `useEditor`). The playground state surface does not justify a full store.

### Playground Backend

- `Node.js`
- `TypeScript`
- `Fastify`
- `Zod`

> **Amendment (2026-05-20):** Drop standalone `Fastify` service. The playground API moves into the Nuxt app as **Nitro server routes** (`server/api/playground/*.ts`). All existing API contracts from `03-backend-api-contracts.md` are preserved — only the runtime host changes. Add a `GET /api/health` endpoint and ping it on playground page load to pre-warm the serverless function.

### Demo Runtime

- `graphql-gene`
- `@graphql-gene/plugin-sequelize`
- `Sequelize`
- `SQLite`

### Hosting

- website on `Vercel`
- backend API on `Railway` or `Fly.io`

> **Amendment (2026-05-20):** Collapse to **one platform — Vercel only**. The Nitro server routes amendment eliminates the need for a separate backend host. `Railway` and `Fly.io` are no longer required for MVP.

## 10. Documentation Taxonomy Decision

The public docs rendered by the website should follow a deterministic taxonomy.

Recommended top-level sections:

- `concepts`
- `guides`
- `reference`
- `examples`
- `tutorials`

Classification should come from:

1. directory structure
2. repository-owned manifest metadata
3. optional navigation configuration

It must not depend on guessing meaning from raw prose.

## 11. Delivery Plan Summary

The MVP is planned in five phases:

1. product and contract definition
2. backend foundation
3. graphql-gene runtime integration
4. frontend playground and docs rendering
5. polish and launch readiness

Parallel work is expected across:

- backend runtime and API
- frontend playground and docs rendering
- content and example authoring

## 12. Definition of Success

The implementation direction is successful when:

- the website presents a strong brand-led product story
- the website renders public docs from GitHub without content drift
- the playground runs through a real backend path
- visitors can understand graphql-gene's strongest capabilities quickly
- the public experience remains safe, stable, and maintainable

## 13. Feature Additions (2026-05-20)

Four features have been approved and added to the relevant planning documents.

### SQL Output Panel

The `query-lookahead` scenario (and later `polymorphic-blocks`) will include a third Monaco output panel showing the SQL string Sequelize generated for the query.

- API change: `execution.sql` field added to `POST /api/playground/query` response (see `03-backend-api-contracts.md`)
- Architecture change: Result Formatter is responsible for capturing and serializing the SQL string
- Frontend change: SQL panel renders as a third Monaco tab in the affected scenarios

This is the most direct proof of the lookahead value proposition.

### URL-Shareable Playground State

The playground will encode `scenarioId`, `exampleId`, and `query` into the URL hash on every change and decode it on page load.

- Entirely client-side — no server persistence required
- Replaces the "saved share links" item previously listed as a future addition
- Implemented in Phase 4

### Full-Text Search (Pagefind)

Pagefind will be added as a post-build step after `nuxt generate`.

- Runs `pagefind --source .output/public` to produce a static search index
- No external service, no API key, no cost
- A search input component in the docs layout queries the local index
- Implemented in Phase 5

### "Try in Playground" Doc Callouts

Documentation pages will support an embedded callout block that links to the playground with a specific scenario pre-loaded.

- Callout carries `scenarioId` and optional `exampleId`
- Playground reads URL parameters on mount and pre-loads the named state
- The docs ingestion pipeline must support rendering the callout block type
- Implemented in Phase 4 (playground intake) and Phase 5 (callout rendering in docs)

## Related Internal Docs

- [01-product-scope.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/01-product-scope.md)
- [02-system-architecture.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/02-system-architecture.md)
- [03-backend-api-contracts.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/03-backend-api-contracts.md)
- [04-security-and-operating-boundaries.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/04-security-and-operating-boundaries.md)
- [05-mvp-delivery-plan.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/05-mvp-delivery-plan.md)
- [06-recommended-tech-stack.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/06-recommended-tech-stack.md)
- [08-docs-taxonomy-and-navigation.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/08-docs-taxonomy-and-navigation.md)
