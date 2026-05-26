# Docs Ingestion Flow

## Purpose

This document defines how the graphql-gene website should ingest public documentation from the canonical GitHub source using the manifest-based model.

It explains:

- where documentation content comes from
- how `docs.config.ts` participates in the pipeline
- how routes, navigation, and page metadata are generated
- where validation should happen

This is an implementation document for the website, not a public docs file.

## 1. Source of Truth

The documentation system has two inputs:

1. canonical Markdown content in GitHub
2. a repository-owned `docs.config.ts` file

These inputs play different roles:

- Markdown files provide the actual documentation content
- `docs.config.ts` provides classification, routing, ordering, and presentation metadata

The website should not infer page structure from prose alone.

> **Amendment (2026-05-20):** Both inputs come from the **graphql-gene repo via a git submodule** — not from GitHub API calls at build time. The submodule is mounted at `content/graphql-gene/` inside the website repo. This means all content and the manifest are on disk before `nuxt generate` runs. No network call to GitHub is made during the build.
>
> **Amendment (2026-05-20) — frontmatter as a third input:**
> The documentation system now has three inputs:
>
> 1. canonical Markdown content (with YAML frontmatter) via the git submodule
> 2. `docs.config.ts` — section definitions only (no `pages` array)
> 3. `@nuxt/content` — reads both and merges them at build time
>
> Per-page metadata (`title`, `description`, `section`, `category`, `order`, `slug`, `status`, `summary`, `playgroundScenario`) lives in YAML frontmatter inside each doc file. GitHub does **not** show frontmatter to users in the rendered view — it is silently stripped. `@nuxt/content` reads frontmatter natively. No custom loading code is needed.

## 2. Recommended Input Model

```text
canonical GitHub docs/
  concepts/
  guides/
  reference/
  examples/
  tutorials/

docs.config.ts
```

The config file should explicitly register every public page that the website will render.

> **Amendment (2026-05-20):** Updated directory model using git submodule:
>
> ```text
> graphql-gene repo (source of truth)
> ├── docs.config.ts        ← manifest lives here, next to the docs
> └── docs/
>     └── guides/
>         ├── schema-design.md
>         ├── directives.md
>         ├── polymorphic-blocks.md
>         └── writing-a-plugin.md
>
> graphql-gene-site repo (website)
> └── content/
>     └── graphql-gene/     ← git submodule pointing to graphql-gene repo
>         ├── docs.config.ts
>         └── docs/
>             └── guides/
>                 └── ...
> ```
>
> The submodule is updated before each deploy. `docs.config.ts` no longer needs to be maintained in a separate repo.

## 3. Build-Time Strategy

The recommended default is build-time ingestion.

That means:

- during build, the website reads `docs.config.ts`
- the website validates the registered Markdown files
- the website loads the Markdown content
- the website generates routes, sidebars, and metadata
- the rendered output becomes part of the deployed site

## Why Build-Time

- simpler than runtime fetching
- better SEO
- faster public page loads
- easier failure detection in CI
- fewer moving parts for MVP

> **Amendment (2026-05-20):** Build-time strategy is still correct. The mechanism changes: content is read from the local git submodule, not fetched from the GitHub API. This eliminates the only real risk of build-time ingestion (network fragility and API rate limits) while keeping all the benefits listed above.

## 4. High-Level Flow

```text
docs.config.ts
  + canonical Markdown files
  -> config validation
  -> content loading
  -> route generation
  -> sidebar generation
  -> page metadata generation
  -> markdown rendering
  -> website docs pages
```

## 5. Detailed Pipeline

> **Amendment (2026-05-20):** The 9-step custom pipeline below is replaced by **`@nuxt/content`**. Steps 3–9 (file resolution, markdown parsing, route generation, section navigation, sidebar trees, page metadata, rendering) are handled by the module. Only Steps 1–2 remain as custom work — loading and validating `docs.config.ts` for classification metadata, since Pierre's docs intentionally carry no frontmatter.
>
> **Simplified build pipeline:**
>
> ```text
> Step 1: git submodule update --remote
>         → pulls latest docs + docs.config.ts from graphql-gene repo
>
> Step 2: nuxt generate
>         → @nuxt/content reads markdown from content/graphql-gene/docs/
>         → docs.config.ts is loaded for section/category/order/slug metadata
>         → Nuxt Content generates routes, navigation, and sidebars
>         → markdown is rendered with Shiki syntax highlighting
>         → MDC components render "Try in Playground" callout blocks
>
> Step 3: pagefind --source .output/public
>         → builds static full-text search index
> ```
>
> The original 9-step pipeline is preserved below for reference only.

### Step 1: Load Config

The website build process loads `docs.config.ts`.

Expected output:

- docs root path
- section registry
- page registry

### Step 2: Validate Config Shape

Validate:

- required top-level fields exist
- every page has required fields
- every `section` value is known
- `slug` values are unique
- `file` values are unique if required by policy

If validation fails, the build should fail.

### Step 3: Resolve Markdown Files

For each page entry:

- resolve the file path under the canonical docs root
- check that the file exists
- read the Markdown contents

If a registered file is missing, the build should fail.

### Step 4: Parse Markdown

The website should parse Markdown into renderable content.

Depending on implementation, this may include:

- headings
- code fences
- links
- tables
- blockquotes
- custom embedded components if the project allows them

Because the model is manifest-based, page classification should not depend on YAML frontmatter.

> **Amendment (2026-05-20):** Step 4 is now handled entirely by `@nuxt/content`. It parses markdown and **extracts YAML frontmatter natively** — `title`, `description`, `section`, `category`, `order`, `slug`, `status`, `summary`, `playgroundScenario`, and any other fields are available directly on the content object via `queryContent()`. The original constraint against frontmatter is reversed: frontmatter is now the **preferred** mechanism for per-page metadata because GitHub silently strips it from the rendered view (no clutter for readers) and `@nuxt/content` requires zero custom code to consume it.

### Step 5: Generate Route Records

For each page entry, build a route record:

```ts
{
  slug: '/docs/guides/directives',
  file: 'guides/directives.md',
  section: 'guides',
  category: 'core',
  title: 'Directives'
}
```

These route records become the docs pages rendered by the website.

### Step 6: Generate Section Navigation

Use the `sections` registry from `docs.config.ts` to build top-level docs navigation.

Example:

- Concepts
- Guides
- Reference
- Examples
- Tutorials

Sort sections by their configured `order`.

### Step 7: Generate Sidebar Trees

Use page entries to build sidebar groups:

- first by `section`
- then optionally by `category`
- then by `order`

Example result:

```text
Guides
  Core
    Schema Design
    Directives
  Advanced
    Polymorphic Blocks
```

### Step 8: Generate Page Metadata

For each page, derive:

- title
- description
- summary
- status badge
- related links
- edit-on-GitHub link if configured

This metadata should come from the manifest, not from Markdown guessing.

### Step 9: Render Docs Pages

At this stage, the website combines:

- rendered Markdown body
- route metadata
- section navigation
- sidebar navigation
- presentation enhancements

The final result is the public docs experience.

## 6. Recommended Nuxt Integration Shape

One clean implementation shape would be:

```text
app/
components/
content/
lib/docs/
  load-docs-config.ts
  validate-docs-config.ts
  load-doc-page.ts
  build-docs-navigation.ts
  build-docs-routes.ts
docs.config.ts
```

Suggested responsibilities:

- `load-docs-config.ts`
  Loads and normalizes `docs.config.ts`

- `validate-docs-config.ts`
  Checks shape, uniqueness, and consistency

- `load-doc-page.ts`
  Reads Markdown content for a single page

- `build-docs-navigation.ts`
  Produces section and sidebar structures

- `build-docs-routes.ts`
  Produces route records for the docs pages

> **Amendment (2026-05-20):** The `lib/docs/` custom module is dropped. `@nuxt/content` replaces it. The updated integration shape is:
>
> ```text
> nuxt.config.ts                    ← configure @nuxt/content sources
> content/
>   graphql-gene/                   ← git submodule (graphql-gene repo)
>     docs.config.ts                ← manifest for classification metadata
>     docs/
>       guides/
>         schema-design.md
>         directives.md
>         ...
> components/
>   docs/
>     DocsCallout.vue               ← "Try in Playground" MDC component
>     DocsSidebar.vue
>     DocsArticle.vue
> server/
>   utils/
>     docs-config.ts                ← loads and validates docs.config.ts at build time
> ```
>
> `@nuxt/content` is configured in `nuxt.config.ts` to read from `content/graphql-gene/docs/`. The `docs.config.ts` manifest is loaded separately via a Nuxt server utility to provide classification metadata that enriches the content query results.

## 7. Suggested Runtime Boundary

Even if the site uses SSR, docs classification should still behave as a build-owned concern for MVP.

In practice:

- content can be loaded at build time
- pre-rendered routes can be generated
- runtime should not need to fetch GitHub on every page request

This keeps the docs experience fast and predictable.

## 8. Validation Rules

The pipeline should fail CI or build when:

- `docs.config.ts` is invalid
- a referenced page file does not exist
- a slug is duplicated
- a page references an unknown section
- a related slug points to a missing page
- section ordering is ambiguous

Recommended warning-level checks:

- missing `summary`
- very long `title`
- empty `description`
- missing `category` where the section expects grouping

> **Amendment (2026-05-20) — frontmatter validation:**
> With per-page metadata in frontmatter, the validation surface shifts:
>
> **Fail the build when:**
> - required frontmatter fields (`title`, `description`, `section`, `order`, `slug`) are missing from any page
> - a page's `section` frontmatter value does not match any `id` in `docs.config.ts` sections
> - two pages share the same `slug` frontmatter value
> - a `related` frontmatter entry references a slug with no matching page
>
> **Warn when:**
> - `summary` is missing
> - `status` is missing (defaults to `stable` if unset)
> - `playgroundScenario` references a scenario id not in the known whitelist (`model-to-schema`, `query-lookahead`, `polymorphic-blocks`, `directive-middleware`)
>
> A Nuxt server plugin or build hook is the recommended place to run these checks, using the `queryContent()` API to traverse all pages after `@nuxt/content` has parsed them.

## 9. Presentation-Only Enrichments

The website may safely add:

- syntax highlighting
- copy buttons
- callout blocks
- status badges
- embedded playground links
- “Edit on GitHub” links

These are presentation concerns and must not create a second content source.

## 10. What the Pipeline Must Not Do

The ingestion system should not:

- read from the local internal `docs/` folder as public content
- depend on hidden page metadata inside Markdown prose
- require frontmatter in every public doc page
- silently skip invalid docs entries
- let the website and GitHub drift into two different documentation sets

## 11. Example End-to-End Flow

```text
Developer updates:
  - guides/directives.md
  - docs.config.ts

CI/build:
  -> validate config
  -> confirm guides/directives.md exists
  -> parse markdown
  -> rebuild /docs/guides/directives route
  -> regenerate guides sidebar
  -> publish updated website
```

> **Amendment (2026-05-20):** Updated end-to-end flow with submodule and `@nuxt/content`:
>
> ```text
> Pierre updates guides/directives.md in graphql-gene repo
> Pierre merges the PR
>
> Website deployment (Vercel):
>   → git submodule update --remote   (pulls latest commit from graphql-gene repo)
>   → nuxt generate
>       → @nuxt/content reads content/graphql-gene/docs/
>       → docs.config.ts loaded for classification metadata
>       → /docs/guides/directives route rebuilt automatically
>       → sidebar regenerated
>   → pagefind --source .output/public
>   → deploy to Vercel CDN
>
> User opens /docs/guides/directives
>   → served from pre-built HTML on CDN
>   → no GitHub involved at request time
> ```

## 12. Recommended Next Step

After this document, the next useful internal file would be:

`12-docs-validation-rules.md`

That document should define:

- exact validation checks
- warning vs error behavior
- CI enforcement expectations
