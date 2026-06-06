# Docs Pipeline Spec

How public documentation is sourced, validated, and rendered. Types are in
[01-types.md](./01-types.md).

---

## Source of Truth

Public docs must be present at `content/graphql-gene/docs/` before the build runs.
How they get there is not yet decided — two options are in play:

**Option A — git submodule (preferred if docs stay in a separate repo)**
```bash
# Add once
git submodule add https://github.com/<org>/graphql-gene content/graphql-gene

# Update before each deploy
git submodule update --remote --merge
```
`docs.config.ts` arrives automatically alongside the docs.

**Option B — manually placed files**
Copy the docs folder into `content/graphql-gene/` directly in the repo.
`docs.config.ts` must also be placed at `content/graphql-gene/docs.config.ts`.

**What is fixed regardless of option:**
- All markdown files must have YAML frontmatter (see `DocsFrontmatter` in `01-types.md`).
- `docs.config.ts` (sections only) must exist at `content/graphql-gene/docs.config.ts`.
- `@nuxt/content` reads both and the pipeline is identical from that point on.
- The local `docs/` folder in this repo is implementation planning only — never the public docs source.

---

## nuxt.config.ts

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/content'],

  content: {
    // Mount the graphql-gene docs as the content source
    sources: {
      graphqlGene: {
        driver: 'fs',
        base: './content/graphql-gene/docs',
        prefix: '/docs',
      },
    },
    highlight: {
      theme: 'github-dark',         // or match brand theme
      langs: ['typescript', 'graphql', 'sql', 'bash', 'json'],
    },
    // Register Vue MDC components
    // DocsPlaygroundCallout is available as <DocsPlaygroundCallout> in markdown
    components: {
      global: true,
    },
  },
})
```

---

## Navigation Generation

Use `queryContent()` at runtime or in a Nuxt plugin to build the sidebar tree.

```ts
// composables/useDocsNav.ts

import { docsConfig } from '~/content/graphql-gene/docs.config'

export async function useDocsNav() {
  // Fetch all pages and their frontmatter
  const pages = await queryContent('/docs').only([
    'title', 'description', 'section', 'category', 'order',
    'slug', 'status', 'sidebarLabel', '_path',
  ]).find()

  // Sort sections by docs.config.ts order
  const sections = docsConfig.sections.sort((a, b) => a.order - b.order)

  // Build grouped structure
  const nav = sections.map(section => ({
    ...section,
    groups: buildGroups(pages.filter(p => p.section === section.id)),
  }))

  return nav
}

function buildGroups(pages: ContentPage[]) {
  // Group by category (undefined → top-level), sort each group by order
  const grouped = new Map<string | undefined, ContentPage[]>()
  for (const page of pages) {
    const key = page.category ?? undefined
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(page)
  }
  // Sort pages within each group
  for (const group of grouped.values()) group.sort((a, b) => a.order - b.order)
  return grouped
}
```

---

## Frontmatter Validation Hook

Add this Nuxt build hook in `nuxt.config.ts` (or a separate plugin). It fails the build on
constraint violations and warns on soft issues.

```ts
// In nuxt.config.ts hooks section
hooks: {
  async 'content:file:afterParse'(file) {
    // Only validate docs pages
    if (!file._path?.startsWith('/docs')) return

    const fm = file as DocsFrontmatter & { _path: string }
    const errors: string[] = []
    const warns: string[] = []

    // Required field check
    for (const field of ['title', 'description', 'section', 'order', 'slug'] as const) {
      if (!fm[field]) errors.push(`[${fm._path}] Missing required frontmatter field: "${field}"`)
    }

    // Section must exist in docs.config.ts
    const knownSections = docsConfig.sections.map(s => s.id)
    if (fm.section && !knownSections.includes(fm.section)) {
      errors.push(`[${fm._path}] Unknown section "${fm.section}". Known: ${knownSections.join(', ')}`)
    }

    // Soft checks
    if (!fm.summary) warns.push(`[${fm._path}] Missing optional "summary" field`)
    if (!fm.status) warns.push(`[${fm._path}] Missing optional "status" field (defaults to stable)`)

    // Emit
    for (const msg of warns) console.warn(msg)
    if (errors.length) throw new Error(errors.join('\n'))
  },
},
```

Slug uniqueness and `related` link validation run as a separate post-parse hook that collects
all slugs first, then checks for duplicates and dangling references.

---

## MDC Component: DocsPlaygroundCallout

The `playgroundScenario` frontmatter field triggers automatic injection of a callout block.
Implement this as a Vue MDC component so `@nuxt/content` renders it inside the page body.

File: `components/docs/DocsPlaygroundCallout.vue`

Usage in markdown (rendered automatically when frontmatter has `playgroundScenario`):

```md
::DocsPlaygroundCallout{scenario="directive-middleware" label="Try Directives in Playground"}
::
```

Or injected by the docs layout when the page frontmatter has `playgroundScenario` set.

The component links to `/playground?scenario=<scenario>`. The playground page reads this
query parameter on mount and pre-loads the named scenario (see [03-frontend.md](./03-frontend.md)).

---

## Pagefind (Full-Text Search)

Run as a post-build step after `nuxt generate`:

```bash
pagefind --source .output/public --bundle-path pagefind
```

This produces a static search index at `.output/public/pagefind/` served from the same CDN.

The docs sidebar search now uses the local docs collection directly, so it no longer depends on `@pagefind/default-ui` at runtime:

```ts
// In components/docs/DocsSearch.vue
const { data: pages } = await useAsyncData('docs-search-pages', async () => {
  const docs = await queryCollection('docs').all()
  return docs.map(page => ({
    title: String(page.title ?? ''),
    description: String(page.description ?? ''),
    slug: String(page.slug ?? page._path ?? ''),
  }))
})
```

---

## Validation Rules Summary

| Violation | Build behavior |
|---|---|
| Missing required frontmatter field | Fail |
| `section` not in `docs.config.ts` | Fail |
| Two pages share the same `slug` | Fail |
| `related` entry has no matching page | Fail |
| Missing `summary` | Warn only |
| Missing `status` | Warn only (defaults to `stable`) |
| `playgroundScenario` not in scenario whitelist | Warn only |

---

## End-to-End Flow

```
1. Ensure content/graphql-gene/docs/ is populated on disk
   (via git submodule update --remote, manual copy, or CI step)

2. nuxt generate
   → @nuxt/content reads content/graphql-gene/docs/**/*.md
   → frontmatter extracted per page
   → validation hook runs (errors fail build, warns log)
   → routes generated from slug frontmatter
   → sidebar built from section + category + order
   → Shiki syntax highlighting applied to code blocks
   → DocsPlaygroundCallout rendered for pages with playgroundScenario
   → Nitro server routes compiled

3. pagefind --source .output/public
   → static full-text search index built
   → served from Vercel CDN

User opens /docs/guides/directives
   → served as pre-built static HTML from CDN
   → no external API call at request time
```
