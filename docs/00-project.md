# graphql-gene-site — Project Reference

## What We're Building

A single **Nuxt 4** application: marketing site + public docs + interactive playground.

The playground runs real `graphql-gene` + Sequelize + SQLite execution on the backend via Nitro server
routes. It is not a frontend simulation. The audience is senior TypeScript and backend engineers
evaluating graphql-gene for production use.

## Doc Index

| Task | Read |
|---|---|
| All TypeScript types and Zod schemas | [01-types.md](./01-types.md) |
| Build Nitro server routes (backend) | [02-backend.md](./02-backend.md) |
| Build playground UI and composables | [03-frontend.md](./03-frontend.md) |
| Wire up docs pipeline (`@nuxt/content`) | [04-docs-pipeline.md](./04-docs-pipeline.md) |
| Know what to build in what order | [05-phases.md](./05-phases.md) |

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 |
| UI | Vue 3 + TypeScript |
| Styling | Tailwind CSS |
| Playground state | Vue composables — `usePlayground`, `useEditor` (no Pinia) |
| Editor surface | Monaco Editor (input + output panels) |
| Request validation | Zod |
| Backend routes | Nitro server routes (`server/api/`) |
| Runtime execution | `graphql-gene` + `@graphql-gene/plugin-sequelize` + Sequelize + SQLite |
| Docs content | `@nuxt/content` reading markdown files at `content/graphql-gene/` |
| Search | Pagefind (post-build static index, no external service) |
| Hosting | TBD — Nitro supports Vercel, Netlify, and Node server; full Node.js runtime required (not Edge) |

## Target File Tree

```
graphql-gene-site/
├── nuxt.config.ts
├── app.vue
├── pages/
│   ├── index.vue                        ← marketing homepage
│   ├── playground.vue                   ← playground page
│   └── docs/
│       └── [...slug].vue                ← docs catch-all page
├── components/
│   └── docs/
│       ├── DocsPlaygroundCallout.vue    ← MDC component for "Try in Playground"
│       ├── DocsSidebar.vue
│       └── DocsArticle.vue
├── composables/
│   ├── usePlayground.ts
│   └── useEditor.ts
├── server/
│   ├── api/
│   │   ├── health.get.ts
│   │   └── playground/
│   │       ├── examples.get.ts
│   │       ├── generate.post.ts
│   │       ├── query.post.ts
│   │       └── directives.post.ts
│   └── utils/
│       ├── playground/
│       │   ├── registry.ts              ← scenario + example catalog
│       │   ├── engine.ts                ← graphql-gene adapter
│       │   ├── fixtures.ts              ← seeded SQLite data per scenario
│       │   └── response.ts              ← safe response helpers
│       └── docs-config.ts              ← loads docs.config.ts at build time
└── content/
    └── graphql-gene/                    ← docs content (see 04-docs-pipeline.md for sourcing options)
        ├── docs.config.ts
        └── docs/
            ├── concepts/
            ├── guides/
            ├── reference/
            ├── examples/
            └── tutorials/
```

## Playground Scenarios

Build in this order:

| Scenario ID | What it demonstrates | Output panels |
|---|---|---|
| `model-to-schema` | Structured model → GraphQL SDL + type summary | SDL, Type Summary |
| `query-lookahead` | Query result + include graph + Sequelize SQL | Result, SQL |
| `polymorphic-blocks` | Inline fragments + `__typename`-driven blocks | Result, SQL |
| `directive-middleware` | Directive runtime behavior + schema output | SDL Excerpt |

## Hard Constraints

- **No arbitrary code execution.** The backend accepts only whitelisted scenario IDs and curated
  example IDs. Never accept TypeScript, JavaScript, or npm install requests from the browser.
- **Timeouts.** Generation requests: 2–3 s. Query execution: 3–5 s. Return `EXECUTION_TIMEOUT` error
  on breach — never hang.
- **Safe errors.** Never expose raw stack traces, local file paths, or internal package paths in
  responses. Always return the shared error shape (see `01-types.md`).
- **SQLite is ephemeral.** Each Nitro invocation seeds its own in-memory SQLite database from
  fixtures. No persistence between requests.
- **No Pinia.** State lives in `usePlayground` and `useEditor` composables only.
- **Docs source.** Public docs must be placed at `content/graphql-gene/docs/` before the build —
  whether via git submodule, manual copy, or CI download. All files must have YAML frontmatter.
  This local `docs/` folder is implementation planning only.

## Build Command

```bash
# If using git submodule
git submodule update --remote && nuxt generate && pagefind --source .output/public

# If docs are placed manually
nuxt generate && pagefind --source .output/public
```
