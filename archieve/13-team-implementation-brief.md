# Team Implementation Brief

## Overview

The plan is to build a single public `Nuxt 4` website that combines three things in one place:

- the marketing site
- the public docs
- a real interactive `graphql-gene` playground

The playground should not be a fake frontend-only demo. It should run real backend-powered scenarios through `Nitro` server routes using `graphql-gene`, `@graphql-gene/plugin-sequelize`, `Sequelize`, and `SQLite`, while keeping the execution surface tightly constrained.

## What the Playground Should Prove

The playground is meant to convince senior TypeScript and backend engineers that `graphql-gene` is a serious architecture tool.

The MVP focuses on four scenario families:

- `model-to-schema`: edit safe model inputs and inspect generated GraphQL SDL, type summaries, and diagnostics
- `query-lookahead`: run a query and inspect result JSON, include graph or execution notes, and the actual generated SQL
- `polymorphic-blocks`: demonstrate fragment-friendly polymorphic content with `__typename`
- `directive-middleware`: show where directives attach and whether they affect schema output, runtime behavior, or both

The strongest new feature addition is the SQL panel. In the lookahead flow, users should be able to see the exact Sequelize SQL generated for the query, because that is the clearest proof that selection-driven loading is real.

## Docs Strategy

The public docs should come from the canonical `graphql-gene` GitHub repo, not from the local implementation docs folder in this workspace.

The docs repo should be mounted into the site repo as a git submodule under `content/graphql-gene/`, so the content and its `docs.config.ts` manifest are already on disk before the build runs. (Submodel idea is not certain by the way.)

`@nuxt/content` should handle:

- markdown parsing
- route generation
- sidebar and navigation support
- syntax highlighting

The manifest remains important for metadata such as:

- section
- category
- order
- slug
- status

Docs should also support two product-facing enhancements:

- static full-text search via `Pagefind`
- "Try in Playground" callouts that deep-link into a specific playground scenario or example

## User Experience Features

These ideas are part of MVP scope:

- URL-shareable playground state using the URL hash
- deep links from docs into preloaded playground scenarios
- SQL output panel in database-backed scenarios
- Monaco-based editors and viewers for both input and output

The shareability is intentionally client-side only. No saved projects or backend persistence are needed for MVP.

## Tech Stack

The current stack direction is:

- `Nuxt 4`
- `Vue 3`
- `TypeScript`
- `@nuxt/content`
- `Monaco Editor`
- Vue composables instead of `Pinia`
- `Zod` for validation
- `graphql-gene`
- `@graphql-gene/plugin-sequelize`
- `Sequelize`
- `SQLite`
- `Nitro` server routes for the playground API
- `Vercel` for the whole deployment
- `Pagefind` for docs search

Compared to the earlier split-service idea, the updated plan is much simpler operationally: one Nuxt app, one deployment, one docs pipeline.

## API and Backend Shape

The frontend talks to structured scenario-based endpoints:

- `GET /api/playground/examples`
- `POST /api/playground/generate`
- `POST /api/playground/query`
- `POST /api/playground/directives`

Responses should always be UI-friendly and stable, with:

- `requestId`
- `status`
- structured result data
- diagnostics
- safe error shapes

For query execution, the response should now also include `execution.sql` when Sequelize is involved.

## Security and Scope Boundaries

The MVP should stay intentionally constrained:

- structured inputs only
- curated examples only
- no arbitrary TypeScript or JavaScript execution
- no package installation from the browser
- no persistent user workspaces
- hard timeouts and payload limits
- safe diagnostics, with no raw stack traces

The principle is: let people explore real runtime behavior, but do not turn the playground into a general remote execution environment.

## Suggested Build Order

The recommended implementation order is:

1. Lock scenario contracts and docs or content structure.
2. Build the Nitro API foundation and scenario registry.
3. Integrate real `graphql-gene` runtime execution.
4. Build the playground UI and docs rendering.
5. Add polish: Pagefind search, deep-link callouts, responsive cleanup, telemetry, and rate limiting.

## Short Version for Teammates

We should build a single Nuxt-based product site that includes the marketing pages, canonical docs, and a real backend-powered graphql-gene playground. The playground should prove model-to-schema generation, lookahead behavior, polymorphic blocks, and directive behavior with real execution, including actual generated SQL for lookahead. Public docs should come from the graphql-gene repo via git submodule and be rendered with `@nuxt/content`, with static search via Pagefind and "Try in Playground" deep links. The stack is Nuxt, Vue, TypeScript, Monaco, Zod, graphql-gene, Sequelize, SQLite, and Nitro on Vercel, and the MVP should stay tightly constrained for security rather than becoming a full online IDE.
