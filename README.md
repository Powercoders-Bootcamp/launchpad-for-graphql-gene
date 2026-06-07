<p align="center">
  <img src="public/images/logo.svg" alt="graphql-gene logo" width="96" />
</p>

<h1 align="center">graphql-gene — website</h1>

<p align="center">
  Marketing site · Interactive playground · Public documentation
</p>

For project overview, setup guide, and contributing guidelines, see the [Wiki](https://github.com/Powercoders-Bootcamp/launchpad-for-graphql-gene/wiki).

---

## What this repo is

This is the public website for [graphql-gene](https://github.com/accesimpot/graphql-gene) — an ORM-native GraphQL generation library for TypeScript.

The site combines three surfaces in a single Nuxt 4 application:

- **Marketing pages** — product story for TypeScript and backend engineers
- **Interactive playground** — runs real `graphql-gene` + Sequelize + SQLite execution on the backend; not a frontend simulation
- **Public documentation** — rendered from the graphql-gene repo (placed at `content/graphql-gene/`)

## Quick start

```bash
git clone <this-repo>
cd graphql-gene-site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The playground at `/playground` runs real `graphql-gene` + Sequelize + SQLite execution.
> Real graphql-gene execution is wired up in Phase 3 — see [`docs/05-phases.md`](docs/05-phases.md).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 + Vue 3 + TypeScript |
| Styling | Tailwind CSS v4 |
| Playground state | Vue composables (`usePlayground`, `useEditor`) |
| Editor surface | Monaco Editor |
| Request validation | Zod |
| Backend routes | Nitro server routes |
| Runtime execution | `graphql-gene` + `@graphql-gene/plugin-sequelize` + Sequelize + SQLite |
| Docs content | `@nuxt/content` |
| Search | Pagefind (post-build) |

## Project structure

```
├── pages/
│   ├── index.vue                  ← marketing homepage
│   ├── playground.vue             ← interactive playground
│   └── docs/[...slug].vue         ← docs catch-all
├── components/docs/               ← DocsSidebar, DocsArticle, DocsPlaygroundCallout
├── composables/
│   ├── usePlayground.ts           ← playground state + API calls
│   └── useEditor.ts               ← Monaco panel configuration
├── server/
│   ├── api/health.get.ts
│   └── api/playground/            ← examples, generate, query, directives
│       └── ...
│   └── utils/playground/          ← response helpers, registry, fixtures, engine
├── types/index.ts                 ← all shared TypeScript types + Zod schemas
├── assets/css/main.css            ← Tailwind v4 + design tokens
├── content/graphql-gene/          ← public docs source (see Docs section below)
└── docs/                          ← internal implementation specs (not public docs)
```

## Playground scenarios

| Scenario | What it shows |
|---|---|
| `model-to-schema` | Structured model → generated GraphQL SDL + type summary |
| `query-lookahead` | Query result + include graph + Sequelize SQL output |
| `polymorphic-blocks` | Inline fragments + `__typename`-driven block types |
| `directive-middleware` | Directive runtime behavior + schema output |

## API routes

```
GET  /api/health
GET  /api/playground/examples
POST /api/playground/generate
POST /api/playground/query
POST /api/playground/directives
```

All payloads are validated with Zod. Responses always include `requestId`, `status`, and a safe error shape — no raw stack traces are ever returned.

## Docs pipeline

Public docs live in the `content/graphql-gene/` directory. Place them there via:

**Option A — git submodule**
```bash
git submodule add https://github.com/accesimpot/graphql-gene content/graphql-gene
git submodule update --remote
```

**Option B — manual copy**
Copy the graphql-gene repo's `docs/` folder and `docs.config.ts` directly into `content/graphql-gene/`.

All markdown files must include YAML frontmatter (`title`, `description`, `section`, `order`, `slug`). See [`docs/04-docs-pipeline.md`](docs/04-docs-pipeline.md) for the full spec.

## Build

```bash
# With submodule
git submodule update --remote && nuxt generate && pagefind --source .output/public

# Manual docs
nuxt generate && pagefind --source .output/public
```

## Implementation docs

The `docs/` folder contains the internal implementation specs for the team:

| File | Contents |
|---|---|
| [`docs/00-project.md`](docs/00-project.md) | Project overview, tech choices, constraints |
| [`docs/01-types.md`](docs/01-types.md) | All TypeScript types and Zod schemas |
| [`docs/02-backend.md`](docs/02-backend.md) | Nitro route specs with handler logic |
| [`docs/03-frontend.md`](docs/03-frontend.md) | Composables, Monaco config, URL state |
| [`docs/04-docs-pipeline.md`](docs/04-docs-pipeline.md) | `@nuxt/content` setup, frontmatter, validation |
| [`docs/05-phases.md`](docs/05-phases.md) | Delivery phases with file-level acceptance criteria |

These are planning documents, not the public-facing documentation.
