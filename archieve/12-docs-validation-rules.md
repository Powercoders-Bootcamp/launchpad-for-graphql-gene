# Docs Validation Rules

## Purpose

This document defines the validation rules for the manifest-based documentation pipeline.

It explains:

- what must be validated
- which failures should block CI or builds
- which issues should surface as warnings
- how validation supports a single source of truth without content drift

This is an internal implementation document for the website and docs pipeline.

## 1. Validation Goals

The validation system should protect four things:

1. route correctness
2. navigation consistency
3. content discoverability
4. GitHub-to-website alignment

The pipeline should fail early when the public docs experience would otherwise become ambiguous, broken, or inconsistent.

## 2. Validation Levels

Use two validation levels:

### Error

Errors must fail CI and fail production builds.

These indicate that the website cannot safely or correctly render the docs set.

### Warning

Warnings should not block builds by default.

These indicate quality problems that reduce clarity, consistency, or usability but do not break the docs surface.

## 3. Config-Level Error Rules

The docs pipeline must fail when:

- `docs.config.ts` cannot be loaded
- `docs.config.ts` does not match the expected schema
- `docsRoot` is missing
- `sections` is missing
- `pages` is missing
- `sections` is empty
- `pages` is empty for a docs-enabled build

## 4. Section-Level Error Rules

Each section entry must be valid.

Fail when:

- a section is missing `id`
- a section is missing `title`
- a section is missing `order`
- two sections share the same `id`
- two sections share the same `order` when strict ordering is required
- a page references a section that does not exist

## 5. Page-Level Error Rules

Each page entry must be valid.

Fail when:

- a page is missing `file`
- a page is missing `title`
- a page is missing `description`
- a page is missing `section`
- a page is missing `order`
- a page is missing `slug`
- two pages share the same `slug`
- two pages share the same `file` when only one public registration per file is allowed
- `slug` does not match the allowed route format
- `file` resolves outside the canonical docs root

## 6. File Existence Error Rules

Fail when:

- a registered Markdown file does not exist
- a registered file path points to a directory instead of a file
- a file extension is not allowed

Recommended allowed extensions for MVP:

- `.md`
- optionally `.mdx` if the docs pipeline intentionally supports it

## 7. Relationship Error Rules

Fail when:

- a `related` slug points to a page that is not registered
- a `githubEditPath` is malformed if that field is required by policy
- a page is assigned to more than one section through conflicting config entries

## 8. Navigation Error Rules

Fail when:

- the same page appears more than once in the generated route table
- a section cannot be rendered because its ordering metadata is invalid
- a category grouping produces an unrecoverable collision under the chosen UI rules

Example:

If the system requires unique page ordering within the same `section + category`, then duplicate order values inside the same group should fail.

## 9. Markdown Parsing Error Rules

Fail when:

- a registered Markdown file cannot be parsed by the selected renderer
- internal embedded syntax required by the project is malformed

If the renderer supports tolerant parsing, the project should still fail for known-bad syntax that breaks page rendering.

## 10. Warning Rules

Warnings should be raised when:

- `summary` is missing
- `category` is missing for a section that usually uses grouping
- `status` is missing
- `title` is unusually long
- `description` is too short to be useful
- `description` is duplicated across many pages
- `related` is empty for pages that would benefit from cross-linking
- heading structure inside Markdown appears weak or inconsistent
- the page filename and title strongly diverge in a way that may confuse maintainers

Warnings should help improve quality without making authors fight the pipeline unnecessarily.

## 11. Link Validation Rules

Recommended error behavior:

- fail on broken internal docs links
- fail on broken website-internal slugs

Recommended warning behavior:

- warn on malformed external links if they cannot be verified in CI
- warn on links that use inconsistent casing or slash patterns

## 12. Slug Rules

Every slug should be treated as a canonical public identifier.

Recommended slug validation:

- must start with `/docs/`
- must be lowercase
- should use hyphenated segments
- must not end with `.md`
- must not include spaces
- must be unique across the entire docs set

Fail when any of these hard requirements are violated.

## 13. Order Rules

Ordering should be deterministic.

Recommended policy:

- `section.order` must be unique
- `page.order` must be unique within the same `section + category` group

If the team prefers looser ordering, tie-breaking rules must still be defined explicitly.

If tie-breaking is not explicitly defined, duplicate order values should fail.

## 14. CI Enforcement Model

Recommended CI behavior:

1. load `docs.config.ts`
2. validate config schema
3. validate sections
4. validate pages
5. verify file existence
6. validate slugs and relationships
7. parse Markdown
8. validate internal links
9. emit warnings
10. fail build if any errors exist

## 15. Local Developer Experience

Validation should also run locally during docs work.

Recommended developer commands:

- `pnpm docs:validate`
- `pnpm docs:check-links`

This allows issues to be caught before CI.

## 16. Output Format

Validation output should be explicit and actionable.

Recommended error format:

```text
ERROR docs-config: duplicate slug "/docs/guides/directives"
  page A: guides/directives.md
  page B: guides/directives-v2.md
```

Recommended warning format:

```text
WARN docs-config: missing summary
  page: guides/schema-design.md
```

The output should always identify:

- rule type
- affected file or slug
- reason
- enough context to fix it quickly

## 17. Recommended Minimum MVP Validation Set

If the team wants a smaller first implementation, these checks are the minimum required hard set:

- valid config file
- valid section ids
- valid page schema
- unique slugs
- existing files
- valid section references
- valid related references
- successful Markdown parsing

Everything else can be layered on after the first pipeline works.

## 18. Recommended Next Step

After this document, the next useful internal document would be:

`13-nuxt-docs-implementation-plan.md`

That file should describe:

- exact Nuxt modules or utilities to create
- where route generation happens
- where validation runs in the app lifecycle
- how docs pages and navigation components consume the generated data
