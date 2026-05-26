# System Architecture

## Overview

The recommended architecture separates the marketing site from the demo runtime.

- the website hosts the product pages and playground UI
- the website also renders public documentation from the canonical GitHub documentation source
- a dedicated backend service executes the real graphql-gene demo flows
- the frontend consumes structured API responses and renders them in developer-friendly panels

This keeps the site lightweight while isolating runtime concerns such as schema generation, query execution, limits, and security controls.

This document describes the implementation architecture of the website and playground. It does **not** define the public documentation content itself. The local `docs/` folder is for internal implementation planning. The user-facing documentation must come from the canonical documentation source in GitHub.

## High-Level Architecture

```text
Browser UI
  -> Public Docs Renderer
  -> Playground Frontend
  -> Demo API Gateway
  -> Playground Service
  -> Execution Engine
  -> graphql-gene Runtime Adapter
  -> Result Formatter
  -> Response
```

## Main Components

### 1. Marketing Site and Playground UI

Responsibilities:

- render Monaco-based code editors, scenario tabs, examples, and output panels
- send structured demo payloads to the backend
- present SDL, query results, include graphs, diagnostics, and execution notes
- manage session-local state only

The frontend should not contain business logic that attempts to emulate the real engine.

For the playground workbench, Monaco is the chosen editor surface for structured input editing and code-like output viewing.

> **Amendment (2026-05-20):** Add three responsibilities to this component:
>
> - **SQL output panel**: in the `query-lookahead` scenario, render a third Monaco panel showing the Sequelize-generated SQL string returned in the `execution.sql` field. This makes the join/include behavior immediately legible to backend engineers.
> - **URL-shareable state**: encode the active scenario ID, selected example ID, and query string into the URL hash on every change. Decode on page load to restore state. No server persistence required — this is entirely client-side.
> - **"Try in Playground" deep-link intake**: read URL parameters set by docs page callout buttons and pre-load the named scenario and example on playground mount.

### 2. Public Documentation Content Pipeline

Responsibilities:

- read documentation content from the canonical GitHub documentation source
- read a repository-owned docs manifest or config file that defines section, category, order, and slug metadata
- combine manifest metadata with directory structure and markdown content to build website navigation and routes
- keep the public docs surface separate from local internal implementation docs
- support presentation-only enrichments such as callouts, search metadata, and embedded playground blocks

The website must not treat the local implementation `docs/` folder as the public docs source.

The website should also avoid requiring YAML frontmatter inside public Markdown pages if GitHub readability is a priority.

> **Amendment (2026-05-20):** Add two enrichments to this pipeline:
>
> - **Full-text search (Pagefind)**: run Pagefind as a post-build step after Nuxt generates static output. It indexes all rendered documentation pages and produces a static search index served from the same host. No external search service or API key required.
> - **"Try in Playground" callout blocks**: the pipeline should support a custom callout block type in documentation pages that renders a button linking to a specific playground scenario. The callout carries a `scenarioId` and optional `exampleId`. These can be expressed as a custom markdown directive or as a structured callout component embedded via the manifest.
>
> **Amendment (2026-05-20) — implementation mechanism:**
> - Replace the custom ingestion pipeline with **`@nuxt/content`**. It handles markdown parsing, route generation, sidebar navigation, and syntax highlighting natively.
> - Replace GitHub API fetching with a **git submodule**. The graphql-gene repo is mounted at `content/graphql-gene/` inside the website repo. Content is local on disk before the build starts — no network calls during `nuxt generate`.
> - The `docs.config.ts` manifest moves to the **graphql-gene repo** alongside the docs (see `10-docs-config-schema.md` amendment). It arrives in the website automatically via the submodule.
> - The "Try in Playground" callout is implemented as a Vue component registered with Nuxt Content's MDC (Markdown Components) system.
>
> **Amendment (2026-05-20) — frontmatter replaces per-page manifest entries:**
> GitHub does **not** show frontmatter to users in the rendered markdown view — it is silently stripped. Per-page metadata (`title`, `description`, `section`, `category`, `order`, `slug`, `status`, `summary`, `playgroundScenario`) moves into YAML frontmatter directly in each doc file. `@nuxt/content` reads frontmatter natively with zero custom code. `docs.config.ts` is reduced to **section definitions only** — no `pages` array.

### 3. Demo API Gateway

Responsibilities:

- receive requests from the playground UI
- enforce authentication rules if needed later
- apply rate limits, request validation, and request size limits
- attach tracing and request identifiers

This layer can live inside the same service as the playground backend for MVP, but it should still be treated as a clear boundary.

### 4. Playground Service

Responsibilities:

- validate incoming example selections and structured edits
- normalize payloads into execution-ready input
- choose which demo scenario to run
- orchestrate generation, execution, formatting, and diagnostics

This layer is the application core for the demo.

### 5. Execution Engine

Responsibilities:

- construct a constrained runtime workspace
- prepare demo models, config, directives, and seeded data
- invoke graphql-gene generation and query execution
- enforce timeouts and per-request limits

This is the most sensitive layer and should never accept arbitrary open-ended code execution in MVP.

### 6. graphql-gene Runtime Adapter

Responsibilities:

- translate normalized demo input into runtime configuration
- call graphql-gene and related plugin APIs
- capture generated schema, diagnostics, and query execution outputs
- expose engine-specific information in a stable backend response format

This adapter protects the frontend and service layer from implementation churn inside the runtime.

### 7. Result Formatter

Responsibilities:

- serialize SDL
- shape query results for UI consumption
- produce include tree or execution metadata views
- convert internal exceptions into safe, human-readable diagnostics

> **Amendment (2026-05-20):** Add SQL serialization as a responsibility. For scenarios that involve Sequelize (`query-lookahead`, `polymorphic-blocks`), capture the SQL string generated by Sequelize and include it in the response under `execution.sql`. Format it as a single readable string suitable for display in a Monaco panel. See the `03-backend-api-contracts.md` amendment for the exact response field.

## Suggested Runtime Strategy

For MVP, use a controlled example-driven runtime:

- predefined example families
- structured editable fields inside each example
- seeded data fixtures per scenario
- no unrestricted file system access from user input

This preserves a real engine path while keeping the execution surface narrow.

## Example Scenario Families

- `model-to-schema`
- `query-lookahead`
- `directive-middleware`
- `polymorphic-blocks`

Each scenario should have:

- a canonical input schema
- editable safe fields
- fixture data
- expected output types

## Deployment Shape

Recommended separation:

- frontend site deployed independently
- canonical docs live in GitHub and are pulled or imported into the website build/runtime pipeline together with a repository-owned docs manifest
- playground backend deployed as a small API service
- optional in-memory or short-lived cache for identical example payloads

Possible future additions:

- queue-backed long-running jobs
- remote execution workers
- saved share links
- per-example analytics

> **Amendment (2026-05-20):** URL-shareable playground state is in scope for MVP, not a future addition. It is client-side only — no server persistence is required. Remove "saved share links" from the future list; it is superseded by hash-based URL state encoding.

## Observability

Track at least:

- request count by scenario
- average execution time
- timeout rate
- validation failure rate
- top diagnostics shown to users

This will help refine both the product story and the backend limits.
