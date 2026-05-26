# Tech Stack

## Website

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 |
| UI | Vue 3 + TypeScript |
| Styling | Tailwind CSS with a design token layer |
| Playground state | Vue composables — `usePlayground`, `useEditor` |

## Public Docs

| Layer | Choice |
|---|---|
| Content source | graphql-gene repo via git submodule at `content/graphql-gene/` |
| Content rendering | `@nuxt/content` |
| Per-page metadata | YAML frontmatter in each doc file |
| Section config | `docs.config.ts` in graphql-gene repo (sections only, no page registry) |
| Syntax highlighting | Shiki (bundled with `@nuxt/content`) |
| Search | Pagefind — post-build static index, no external service required |
| Playground callouts | Vue MDC component (`DocsPlaygroundCallout.vue`) |

## Playground Frontend

| Layer | Choice |
|---|---|
| Editor surface | Monaco Editor (input editor + all output panels) |
| Payload validation | Zod |
| State | Vue composables (`usePlayground`, `useEditor`) |

## Playground Backend

| Layer | Choice |
|---|---|
| Server | Nuxt/Nitro server routes (`server/api/playground/*.ts`) |
| Request validation | Zod |
| Runtime | Node.js on Vercel standard serverless (60s timeout) |

## Demo Runtime

| Layer | Choice |
|---|---|
| GraphQL generation | `graphql-gene` |
| Sequelize plugin | `@graphql-gene/plugin-sequelize` |
| ORM | Sequelize |
| Database | SQLite (ephemeral, seeded fixtures per scenario) |

## Hosting

| Surface | Platform |
|---|---|
| Everything | Vercel |

No separate backend host is required. Nitro server routes run inside the same Vercel deployment as the website.

## Build Command

```bash
git submodule update --remote && nuxt generate && pagefind --source .output/public
```

## Why This Stack

- **Nuxt + Vue** matches the target `vuejs.org`-style product experience and the graphql-gene audience
- **Nitro server routes** collapse website and API into one deployment, eliminating cross-origin configuration and a separate hosting bill
- **git submodule** means docs are on disk before the build starts — no GitHub API calls, no rate limits, works offline
- **`@nuxt/content`** replaces a custom 9-step markdown ingestion pipeline with zero custom parsing or route generation code
- **YAML frontmatter** for per-page metadata is invisible to GitHub readers (GitHub silently strips it) but natively read by `@nuxt/content`
- **Monaco** gives the playground a real developer-tool feel consistent with VSCode
- **Pagefind** provides full-text search with no external service, API key, or ongoing cost
- **SQLite** keeps the demo runtime self-contained with no database provisioning
- **Vercel** has strong Nuxt support, simple preview deployments, and standard serverless functions that support the playground's execution targets (2–5s)
