# Docs Pipeline

## How It Works

Public documentation is sourced from the graphql-gene GitHub repo and rendered by the website using `@nuxt/content`. The flow has three inputs:

1. **Markdown files** — the documentation content, with YAML frontmatter for page metadata
2. **`docs.config.ts`** — section definitions (ID, title, display order) only — no page registry
3. **`@nuxt/content`** — reads both, generates routes, navigation, sidebars, and rendered pages

The graphql-gene repo is mounted inside the website repo as a **git submodule** at `content/graphql-gene/`. Docs are on disk before the build starts. No GitHub API calls are made at build time or at request time.

## Build Sequence

```text
1. git submodule update --remote
   → pulls latest commit from graphql-gene repo
   → content/graphql-gene/ is updated on disk

2. nuxt generate
   → @nuxt/content reads content/graphql-gene/docs/
   → YAML frontmatter is extracted per page (title, section, order, slug, etc.)
   → docs.config.ts is loaded for section display titles and order
   → routes, sidebars, and navigation are generated
   → Shiki highlights code blocks
   → MDC components render embedded callouts (e.g. DocsPlaygroundCallout)

3. pagefind --source .output/public
   → static full-text search index built from all rendered HTML
   → served from the same CDN, no external service required
```

## docs.config.ts

Lives in the **graphql-gene repo** alongside the docs it describes. Arrives in the website automatically via the submodule — no dual-repo maintenance.

Contains section definitions only:

```ts
export type DocsSectionId =
  | 'concepts'
  | 'guides'
  | 'reference'
  | 'examples'
  | 'tutorials'

export interface DocsSection {
  id: DocsSectionId
  title: string
  order: number
  description?: string
}

export interface DocsConfig {
  docsRoot: string
  sections: DocsSection[]
}

export const docsConfig: DocsConfig = {
  docsRoot: 'docs',
  sections: [
    { id: 'concepts',  title: 'Concepts',   order: 1, description: 'Mental models and architecture explanations.' },
    { id: 'guides',    title: 'Guides',      order: 2, description: 'Focused feature and how-to pages.' },
    { id: 'reference', title: 'Reference',   order: 3, description: 'Exact lookup-style API and configuration.' },
    { id: 'examples',  title: 'Examples',    order: 4, description: 'Runnable or inspectable scenarios.' },
    { id: 'tutorials', title: 'Tutorials',   order: 5, description: 'Step-by-step onboarding flows.' }
  ]
}
```

## Page Frontmatter

All per-page metadata lives in YAML frontmatter inside each markdown file. GitHub silently strips frontmatter from the rendered view — it is not visible to readers. `@nuxt/content` reads it natively with zero custom code.

### Required fields

| Field | Type | Purpose |
|---|---|---|
| `title` | string | Page heading and sidebar label |
| `description` | string | Short explanation for previews and search |
| `section` | DocsSectionId | Top-level nav placement |
| `order` | number | Sort order within section or category |
| `slug` | string | Canonical website route |

### Optional fields

| Field | Type | Purpose |
|---|---|---|
| `category` | string | Sidebar subgroup (e.g. `core`, `advanced`, `plugins`) |
| `status` | string | Maturity badge (`stable`, `experimental`, `planned`, `deprecated`) |
| `summary` | string | One-sentence description for search cards and AI retrieval |
| `related` | string[] | Related page slugs |
| `sidebarLabel` | string | Shorter label for sidebar when title is too long |
| `playgroundScenario` | string | Renders a "Try in Playground" callout linking to this scenario |

### Example

```yaml
---
title: Directives
description: Runtime middleware and schema-printing behavior in graphql-gene.
section: guides
category: core
order: 3
slug: /docs/guides/directives
status: stable
summary: Learn how graphql-gene directives affect runtime behavior and generated SDL.
related:
  - /docs/guides/schema-design
playgroundScenario: directive-middleware
---
```

## Navigation Generation

The website derives navigation automatically from `@nuxt/content` queries:

- **Top-level nav** — one entry per section, ordered by `order` in `docs.config.ts`
- **Sidebar** — pages grouped first by `section`, then by `category`, sorted by `order`
- **Status badges** — rendered when `status` is `experimental`, `planned`, or `deprecated`
- **Playground callout** — rendered when `playgroundScenario` is present; links to `playground#scenario={value}`
- **Search** — Pagefind indexes all rendered HTML; the docs layout includes a search input component

## File Structure

```text
graphql-gene repo (source of truth)
├── docs.config.ts
└── docs/
    ├── concepts/
    │   ├── how-graphql-gene-works.md
    │   └── lookahead-and-includes.md
    ├── guides/
    │   ├── schema-design.md
    │   ├── directives.md
    │   ├── polymorphic-blocks.md
    │   └── writing-a-plugin.md
    ├── reference/
    │   ├── gene-directive-config.md
    │   └── plugin-api.md
    ├── examples/
    │   └── polymorphic-page-blocks.md
    └── tutorials/
        └── first-schema.md

graphql-gene-site repo (website)
└── content/
    └── graphql-gene/    ← git submodule pointing to graphql-gene repo
        ├── docs.config.ts
        └── docs/
            └── ...
```

## Validation Rules

The build should fail when:

- a page's `section` frontmatter value does not match any section ID in `docs.config.ts`
- two pages share the same `slug` frontmatter value
- a `related` entry references a slug with no matching page
- required frontmatter fields (`title`, `description`, `section`, `order`, `slug`) are missing from any page

Warn (but do not fail) when:

- `summary` is missing
- `status` is missing (defaults to `stable`)
- `playgroundScenario` references a value not in the known scenario whitelist

Validation runs via a Nuxt build hook using the `queryContent()` API after `@nuxt/content` has parsed all pages.

## Presentation Enrichments

The website may safely add:

- syntax highlighting (Shiki, via `@nuxt/content`)
- copy buttons on code blocks
- status badges
- "Try in Playground" callout blocks (`DocsPlaygroundCallout.vue` via MDC)
- full-text search (Pagefind)
- "Edit on GitHub" links

These are presentation concerns. The website must not become a second authoring surface.

## End-to-End Flow

```text
Pierre updates guides/directives.md in the graphql-gene repo and merges.

Website deployment (Vercel):
  → git submodule update --remote
  → nuxt generate
      → @nuxt/content reads content/graphql-gene/docs/
      → /docs/guides/directives rebuilt automatically
      → sidebar regenerated
  → pagefind --source .output/public
  → deploy to Vercel CDN

User opens /docs/guides/directives
  → served from pre-built HTML on CDN
  → no GitHub involved at request time
```
