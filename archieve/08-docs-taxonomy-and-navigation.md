# Docs Taxonomy and Navigation Model

## Purpose

This document defines how graphql-gene documentation should be organized so that:

- GitHub remains the canonical content source
- the website can render the same docs in a structured `vuejs.org`-style experience
- content stays consistent across surfaces
- navigation can be generated reliably instead of guessed from prose

The goal is not to make the website "understand" documentation magically.

The goal is to give the website a clear content contract so it can place pages into the correct sections, sidebars, and routes every time.

This document is about the **public documentation source rendered by the website**. It is not a taxonomy for the local implementation `docs/` folder in this workspace.

## Core Principle

Documentation classification should come from:

1. directory structure
2. repository-owned manifest metadata
3. optional navigation config

It should not depend on trying to infer section meaning from page prose alone.

## Recommended Top-Level Taxonomy

Use one canonical documentation root in the GitHub repository with the following content groups:

```text
<canonical-docs-root>/
  concepts/
  guides/
  reference/
  examples/
  tutorials/
```

### Concepts

Use for mental models and architecture explanations.

Examples:

- how graphql-gene works
- schema generation mental model
- directives mental model
- lookahead and include behavior

### Guides

Use for focused how-to and feature explanation pages.

Examples:

- directives
- schema design
- polymorphic blocks
- writing a plugin

### Reference

Use for API-shaped, exact, lookup-style content.

Examples:

- decorators
- helper functions
- config fields
- directive config types
- plugin interfaces

### Examples

Use for scenario-driven, runnable, or inspectable examples.

Examples:

- auth example
- polymorphic page example
- query lookahead example
- mutation return-shape example

### Tutorials

Use for step-by-step onboarding flows.

Examples:

- first graphql-gene schema
- adding directives
- creating a plugin

## Recommended Manifest Standard

Every documentation set should be accompanied by a repository-owned manifest or config file.

Suggested minimum page entry:

```json
{
  "file": "guides/directives.md",
  "title": "Directives",
  "description": "Runtime middleware and schema-printing behavior in graphql-gene.",
  "section": "guides",
  "category": "core",
  "order": 3,
  "slug": "/docs/guides/directives",
  "status": "stable",
  "summary": "Learn how graphql-gene directives affect runtime behavior and generated SDL."
}
```

## Required Fields

### `file`

Repository-relative path to the Markdown file.

### `title`

Human-readable page title.

### `description`

Short page description used for previews, search, and page metadata.

### `section`

Primary top-level classification.

Allowed values:

- `concepts`
- `guides`
- `reference`
- `examples`
- `tutorials`

### `order`

Controls page order inside the section or local navigation group.

### `slug`

Canonical website route for the page.

## Recommended Optional Fields

### `category`

Subgroup inside a section.

Examples:

- `core`
- `advanced`
- `plugins`
- `performance`
- `auth`

### `status`

Useful for feature maturity and roadmap visibility.

Examples:

- `stable`
- `experimental`
- `planned`
- `deprecated`

### `summary`

A one-sentence explanation optimized for search, previews, and AI retrieval quality.

### `related`

Optional list of related doc slugs.

Example:

```json
{
  "related": [
    "/docs/guides/schema-design",
    "/docs/examples/polymorphic-page-blocks"
  ]
}
```

## Navigation Generation Model

The website should map pages using deterministic rules:

### Rule 1

Use the manifest `section` field to place the page into the top-level docs navigation.

### Rule 2

Use manifest `category` to create grouped sidebar buckets when needed.

### Rule 3

Use manifest `order` to sort pages within each section or category.

### Rule 4

Use manifest `title` and `description` for page labels and search presentation.

### Rule 5

Use manifest `status` to optionally show badges such as `Experimental` or `Planned`.

## Example Website Navigation Mapping

Given this content model:

```text
<canonical-docs-root>/
  concepts/how-graphql-gene-works.md
  guides/directives.md
  guides/schema-design.md
  guides/polymorphic-blocks.md
  reference/gene-directive-config.md
  examples/polymorphic-page-blocks.md
  tutorials/first-schema.md
```

The website could render:

- Docs
- Concepts
- Guides
- Reference
- Examples
- Tutorials

And the Guides sidebar could render:

- Schema Design
- Directives
- Polymorphic Blocks

without manually hardcoding every page name.

## Example Manifest Entries by Page Type

### Concept page

```json
{
  "file": "concepts/how-graphql-gene-works.md",
  "title": "How graphql-gene works",
  "description": "The mental model behind models, directives, generated schema, and runtime resolution.",
  "section": "concepts",
  "category": "core",
  "order": 1,
  "slug": "/docs/concepts/how-graphql-gene-works",
  "status": "stable",
  "summary": "Understand the full graphql-gene flow from ORM models to GraphQL execution."
}
```

### Guide page

```json
{
  "file": "guides/polymorphic-blocks.md",
  "title": "Polymorphic Blocks",
  "description": "Model heterogeneous CMS blocks with graphql-gene and Sequelize.",
  "section": "guides",
  "category": "advanced",
  "order": 4,
  "slug": "/docs/guides/polymorphic-blocks",
  "status": "stable",
  "summary": "Learn how to build fragment-friendly polymorphic block queries with graphql-gene."
}
```

### Reference page

```json
{
  "file": "reference/gene-directive-config.md",
  "title": "GeneDirectiveConfig",
  "description": "Reference for directive configuration fields and runtime behavior.",
  "section": "reference",
  "category": "directives",
  "order": 2,
  "slug": "/docs/reference/gene-directive-config",
  "status": "stable",
  "summary": "Reference for graphql-gene directive config structure and handler behavior."
}
```

## Example Repository Structure

Recommended layout:

```text
<canonical-docs-root>/
  concepts/
    how-graphql-gene-works.md
    lookahead-and-includes.md
  guides/
    schema-design.md
    directives.md
    polymorphic-blocks.md
    writing-a-plugin.md
  reference/
    gene-directive-config.md
    plugin-api.md
    graphql-aliases.md
  examples/
    auth-me-query.md
    polymorphic-page-blocks.md
    mutation-return-shape.md
  tutorials/
    first-schema.md
    first-directive.md
```

## Website Rendering Strategy

For a `vuejs.org`-style site, the docs system should do three things:

1. render Markdown from the canonical GitHub documentation source
2. generate navigation from the manifest and directories
3. allow presentation-only enrichments such as:
   - syntax highlighting
   - copy buttons
   - callouts
   - embedded playground demos
   - status badges

The website should not become a second authoring surface for the same documentation content.

The local implementation `docs/` folder should remain outside this pipeline.

## GitHub and Website Roles

### GitHub

- source of truth
- edit history
- PR review flow
- contributor entrypoint

### Website

- polished reading experience
- search
- navigation
- branding
- interactive enhancements

This separation preserves one content source while allowing two strong consumption surfaces.

## Governance Rules

To keep the system consistent:

1. Every public doc page must have a corresponding valid manifest entry.
2. Every page must live under exactly one section.
3. Every new page must declare a canonical `slug` in the manifest.
4. `status: planned` pages must be visibly distinct from stable pages.
5. Feature docs should follow a standard content template whenever possible.
6. Broken links, missing manifest entries, and slug collisions should fail CI.

## Recommended Next Step

After adopting this model, the next useful document would be:

`09-docs-authoring-standard.md`

That file should define:

- the standard page template
- writing rules
- naming conventions
- how to distinguish concept, guide, reference, example, and tutorial pages

## Final Recommendation

Yes, the website can correctly sort and present the docs in a `vuejs.org`-style structure.

But it should do so from explicit metadata and taxonomy, not from guesswork.

If graphql-gene adopts:

- one canonical docs directory
- one repository-owned manifest or config file
- stable section taxonomy
- deterministic navigation rules

then GitHub and the website can stay in sync without content drift.
