# Architecture

## Overview

The graphql-gene website is a single Nuxt 4 application deployed on Vercel. It combines three surfaces:

- **Marketing site** — product pages and homepage
- **Public docs** — rendered from the graphql-gene GitHub repo via a git submodule
- **Interactive playground** — Monaco-based editor that runs real graphql-gene execution via Nitro server routes

The playground backend runs as Nitro server routes inside the same Nuxt app. There is no separate backend service.

## High-Level Flow

```text
Browser
  ├── Marketing pages       → static HTML
  ├── Docs pages            → @nuxt/content renders markdown from git submodule
  └── Playground page
        ├── Monaco input editor
        ├── Monaco output panels (SDL / Result / SQL)
        └── POST /api/playground/*
                  └── Nitro server route
                        └── Execution Engine
                              └── graphql-gene Runtime Adapter
                                    └── Result Formatter
                                          └── Response
```

## Components

### 1. Marketing Site and Playground UI

- Monaco-based structured input editor and read-only code output panels
- Three output tabs per relevant scenario: Output, SQL, Execution Notes
- Scenario tabs: `model-to-schema`, `query-lookahead`, `polymorphic-blocks`, `directive-middleware`
- URL hash encodes `scenarioId`, `exampleId`, and `query` on every change; decoded on page load for link sharing
- Reads URL parameters from docs callout deep-links and pre-loads the named scenario on playground mount
- State managed via Vue composables (`usePlayground`, `useEditor`) — no Pinia
- `GET /api/health` is pinged on playground page load to pre-warm the serverless function

### 2. Public Docs Pipeline

- Markdown source lives in the graphql-gene repo, mounted as a git submodule at `content/graphql-gene/`
- `@nuxt/content` reads all pages, extracts YAML frontmatter, generates routes and navigation
- `docs.config.ts` (in the graphql-gene repo) defines section IDs, titles, and display order — no page registry
- Per-page metadata (`title`, `description`, `section`, `category`, `order`, `slug`, `status`, `summary`, `playgroundScenario`) lives in each file's YAML frontmatter
- Pagefind runs as a post-build step and produces a static full-text search index served from the same CDN
- "Try in Playground" callout blocks are Vue MDC components rendered when a page carries `playgroundScenario` frontmatter

### 3. Playground API (Nitro Server Routes)

- `GET  /api/health` — warmup endpoint, pinged on playground page load
- `GET  /api/playground/examples` — returns the curated scenario and example catalog
- `POST /api/playground/generate` — generates GraphQL SDL from a structured model input
- `POST /api/playground/query` — executes a query, returns result + include graph + SQL string
- `POST /api/playground/directives` — runs a directive-focused scenario

All inbound payloads are validated with Zod. The frontend never receives raw internal errors.

### 4. Execution Engine

- Constructs a constrained runtime workspace per request
- Loads seeded demo fixtures for the requested scenario
- Enforces hard timeouts: 2–3s for generation requests, 3–5s for query execution
- Never accepts arbitrary TypeScript, JavaScript, or package installation from the browser

### 5. graphql-gene Runtime Adapter

- Translates structured demo input into graphql-gene and Sequelize configuration
- Calls `graphql-gene` and `@graphql-gene/plugin-sequelize` APIs
- Captures generated SDL, diagnostics, query results, and Sequelize-generated SQL strings
- Exposes engine outputs in a stable response format that isolates the frontend from internal implementation changes

### 6. Result Formatter

- Serializes SDL for Monaco display
- Shapes query results and include graphs for UI consumption
- Captures and formats Sequelize SQL strings for the SQL output panel (`execution.sql`)
- Converts internal exceptions into safe, human-readable diagnostic payloads with no raw stack traces

## Build Sequence

```text
1. git submodule update --remote
   → pulls latest docs + docs.config.ts from graphql-gene repo into content/graphql-gene/

2. nuxt generate
   → @nuxt/content reads content/graphql-gene/docs/
   → YAML frontmatter extracted per page
   → routes, navigation, sidebars generated
   → Shiki syntax highlighting applied
   → MDC components rendered (e.g. DocsPlaygroundCallout)
   → Nitro server routes compiled

3. pagefind --source .output/public
   → static full-text search index built
   → served from the same Vercel CDN deployment
```

## Deployment

- Single platform: **Vercel**
- Website and Nitro server routes deploy together as one project
- Nitro runs on Vercel standard serverless runtime (not Edge) — full Node.js, 60s function timeout
- SQLite is ephemeral per invocation — sufficient for seeded demo fixtures
- Playground cold start mitigated by the `/api/health` ping on page load

## File Structure

```text
graphql-gene-site/
├── nuxt.config.ts
├── content/
│   └── graphql-gene/              ← git submodule (graphql-gene repo)
│       ├── docs.config.ts         ← section definitions only
│       └── docs/
│           ├── concepts/
│           ├── guides/
│           ├── reference/
│           ├── examples/
│           └── tutorials/
├── components/
│   └── docs/
│       ├── DocsPlaygroundCallout.vue
│       ├── DocsSidebar.vue
│       └── DocsArticle.vue
├── server/
│   ├── api/
│   │   ├── health.get.ts
│   │   └── playground/
│   │       ├── examples.get.ts
│   │       ├── generate.post.ts
│   │       ├── query.post.ts
│   │       └── directives.post.ts
│   └── utils/
│       └── docs-config.ts         ← loads and validates docs.config.ts at build time
└── composables/
    ├── usePlayground.ts
    └── useEditor.ts
```

## Observability

Track at minimum:

- request count by scenario
- average execution duration
- timeout events
- validation failure rate
- top diagnostic messages surfaced to users
