# Docs Config Schema

## Purpose

This document defines a practical `docs.config.ts` shape for the graphql-gene website.

The goal is to support a manifest-based documentation pipeline where:

- GitHub remains the canonical documentation content source
- Markdown files stay clean for direct GitHub readers
- the website derives navigation, routes, and page metadata from a repository-owned config file

This file describes the configuration contract, not the public documentation content itself.

## Recommended File Location

Use a repository-level file such as:

```text
docs.config.ts
```

Alternative:

```text
docs-manifest.json
```

Recommended default: `docs.config.ts`

Reason:

- easier comments and maintainability
- better type safety
- easier computed values if needed later
- simpler validation in a TypeScript-based website stack

> **Amendment (2026-05-20):** `docs.config.ts` should live in the **graphql-gene repo** alongside the docs it describes — not in the website repo.
>
> **Why:** The manifest classifies docs content. When the docs are pulled into the website via a git submodule, the manifest comes with them automatically. If the manifest lives in the website repo and the docs live in the graphql-gene repo, any new doc page requires a PR in two separate repos — which will cause the manifest to go stale.
>
> **Updated recommended location:**
> ```text
> graphql-gene repo (root)
> ├── docs.config.ts   ← lives here, next to the docs
> └── docs/
>     ├── guides/
>     │   ├── schema-design.md
>     │   ├── directives.md
>     │   └── polymorphic-blocks.md
>     └── writing-a-plugin.md
> ```

## Recommended Top-Level Shape

```ts
export interface DocsConfig {
  docsRoot: string
  sections: DocsSection[]
  pages: DocsPage[]
}
```

## Recommended Section Shape

```ts
export interface DocsSection {
  id: 'concepts' | 'guides' | 'reference' | 'examples' | 'tutorials'
  title: string
  order: number
  description?: string
}
```

## Recommended Page Shape

```ts
export interface DocsPage {
  file: string
  title: string
  description: string
  section: 'concepts' | 'guides' | 'reference' | 'examples' | 'tutorials'
  category?: string
  order: number
  slug: string
  status?: 'stable' | 'experimental' | 'planned' | 'deprecated'
  summary?: string
  related?: string[]
  sidebarLabel?: string
  githubEditPath?: string
}
```

> **Amendment (2026-05-20) — per-page metadata moves to YAML frontmatter:**
> GitHub does **not** show frontmatter to users in the rendered markdown view — it is silently stripped. This means all fields from `DocsPage` can move into each markdown file's YAML frontmatter without affecting the GitHub reading experience.
>
> **`@nuxt/content` reads frontmatter natively** — no custom loading or parsing code is needed. The `DocsPage` interface and `pages` array are eliminated from `docs.config.ts`.
>
> **`docs.config.ts` is simplified to section definitions only:**
>
> ```ts
> export interface DocsConfig {
>   docsRoot: string
>   sections: DocsSection[]
> }
> ```
>
> **Example frontmatter in a doc file (`guides/directives.md`):**
>
> ```yaml
> ---
> title: Directives
> description: Runtime middleware and schema-printing behavior in graphql-gene.
> section: guides
> category: core
> order: 3
> slug: /docs/guides/directives
> status: stable
> summary: Learn how graphql-gene directives affect runtime behavior and generated SDL.
> related:
>   - /docs/guides/schema-design
> playgroundScenario: directive
> ---
> ```
>
> **Simplified `docs.config.ts` (sections only):**
>
> ```ts
> export const docsConfig: DocsConfig = {
>   docsRoot: 'docs',
>   sections: [
>     { id: 'concepts', title: 'Concepts', order: 1 },
>     { id: 'guides',   title: 'Guides',   order: 2 },
>     { id: 'reference', title: 'Reference', order: 3 },
>     { id: 'examples', title: 'Examples',  order: 4 },
>     { id: 'tutorials', title: 'Tutorials', order: 5 }
>   ]
> }
> ```
>
> The website uses `@nuxt/content`'s `queryContent()` API to read all pages, extracting frontmatter fields directly. Section metadata from `docs.config.ts` is merged to add display titles and ordering for top-level nav.

## Required Fields

### `docsRoot`

Repository-relative path to the canonical public docs root.

Example:

```ts
docsRoot: 'docs'
```

### `sections`

Defines the top-level documentation groups and their display order.

### `pages`

Flat page registry used by the website to build routes, sidebars, and search metadata.

### `file`

Repository-relative path from the docs root to the Markdown file.

Example:

```ts
file: 'guides/directives.md'
```

### `title`

Primary display title for the page.

### `description`

Short explanation for page previews, metadata, and search.

### `section`

Top-level navigation grouping for the page.

### `order`

Position of the page inside its section or category.

### `slug`

Canonical route used by the website.

Example:

```ts
slug: '/docs/guides/directives'
```

## Recommended Optional Fields

### `category`

Useful for sidebar grouping inside a section.

Examples:

- `core`
- `advanced`
- `plugins`
- `auth`

### `status`

Allows the website to visually distinguish maturity.

Examples:

- `stable`
- `experimental`
- `planned`
- `deprecated`

### `summary`

Shorter single-sentence explanation optimized for search cards, previews, and AI retrieval quality.

### `related`

List of related page slugs.

### `sidebarLabel`

Optional shorter label for sidebar display when the full title is too long.

### `githubEditPath`

Optional override for edit links if the repo path differs from the canonical content path.

## Example `docs.config.ts`

> **Amendment (2026-05-20):** The `DocsPage` interface and `pages` array are removed. Per-page metadata lives in frontmatter. `docs.config.ts` now contains only types and the sections array.

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
    {
      id: 'concepts',
      title: 'Concepts',
      order: 1,
      description: 'Mental models and architecture explanations.'
    },
    {
      id: 'guides',
      title: 'Guides',
      order: 2,
      description: 'Focused feature and how-to pages.'
    },
    {
      id: 'reference',
      title: 'Reference',
      order: 3,
      description: 'Exact lookup-style API and configuration material.'
    },
    {
      id: 'examples',
      title: 'Examples',
      order: 4,
      description: 'Runnable or inspectable scenarios.'
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      order: 5,
      description: 'Step-by-step onboarding flows.'
    }
  ]
}
```

Example frontmatter in a corresponding doc file:

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
playgroundScenario: directive
---
```

## Expected Website Usage

The website should use `docs.config.ts` to:

1. build section navigation (top-level nav items, display order)
2. validate that each page's `section` frontmatter value references a known section id

The website should use `@nuxt/content` to:

1. discover all markdown pages automatically via `queryContent()`
2. extract frontmatter fields for routing, sidebar grouping, and metadata
3. generate routes
4. build grouped sidebars using `section`, `category`, and `order` frontmatter values
5. surface page `status` badges
6. generate search and preview metadata from `summary` and `description`
7. render "Try in Playground" callouts when `playgroundScenario` is present

## Validation Rules

> **Amendment (2026-05-20):** With frontmatter, validation shifts from checking a `pages` array to checking individual frontmatter values that `@nuxt/content` extracts at build time.

The docs pipeline should fail fast when:

- a page's `section` frontmatter value references an unknown section id
- two pages share the same `slug` frontmatter value
- a page's `related` frontmatter entry points to a slug that has no matching page
- required frontmatter fields (`title`, `description`, `section`, `order`, `slug`) are missing from any page

## Suggested Build Flow

```text
docs.config.ts (sections)
  + canonical Markdown files (with frontmatter)
  -> @nuxt/content reads all pages + frontmatter
  -> section validation (frontmatter section values vs. docs.config.ts section ids)
  -> slug uniqueness check
  -> route generation
  -> sidebar generation
  -> markdown rendering
  -> website docs pages
```

## Recommended Implementation Notes

- all per-page metadata lives in frontmatter — no second registry to keep in sync
- `docs.config.ts` remains the single source for section definitions and their display order
- treat `slug` frontmatter as the canonical website identity
- `playgroundScenario` is a new frontmatter field, not in the original schema — add it to the frontmatter type definition in the website codebase

## Recommended Next Step

After this schema, the next useful internal document would be:

`11-docs-ingestion-flow.md`

That document should define:

- where the canonical GitHub docs are read from
- when the config is validated
- how Nuxt builds docs routes from the config
- how sidebar and search metadata are derived
