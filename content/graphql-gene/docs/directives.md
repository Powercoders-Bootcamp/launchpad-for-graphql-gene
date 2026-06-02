---
title: Directives
description: Runtime middleware and schema-printing behavior in graphql-gene.
section: guides
category: core
order: 2
slug: /docs/guides/directives
status: stable
summary: Learn how graphql-gene directives attach resolver middleware at the type or field level, and how empty name affects SDL output.
related:
  - /docs/guides/schema-design
  - /docs/guides/polymorphic-blocks
playgroundScenario: directive-middleware
---

# Gene directives

Gene can attach **resolver middleware** at the type or field level via `geneConfig.directives` (or field configs). Each entry is a `GeneDirectiveConfig`: a `name`, optional `args`, and a `handler` that runs around the underlying resolver.

Typical uses:

- Enforce auth or load context before resolving fields that return a given GraphQL type.
- Rewrite `source` before the default resolver runs (for example normalizing polymorphic hub rows into concrete model instances).

## Shape

```ts
type GeneDirectiveConfig<
  TDirectiveArgs = Record<string, string | number | boolean | string[] | number[] | boolean[] | null> | undefined,
  TSource = Record<string, unknown> | undefined,
  TContext = GeneContext,
  TArgs = Record<string, unknown> | undefined,
> = {
  name: string
  args?: TDirectiveArgs
  handler: GeneDirectiveHandler<TSource, TContext, TArgs>
}

type GeneDirectiveHandler<TSource, TContext, TArgs, TResult = unknown> = (options: {
  source: Parameters<GraphQLFieldResolver<TSource, TContext, TArgs, TResult>>[0]
  args: Parameters<GraphQLFieldResolver<TSource, TContext, TArgs, TResult>>[1]
  context: Parameters<GraphQLFieldResolver<TSource, TContext, TArgs, TResult>>[2]
  info: Parameters<GraphQLFieldResolver<TSource, TContext, TArgs, TResult>>[3]
  field: string
  filter: <TValue>(callback: (value: TValue) => unknown) => void
  resolve: () => Promise<TResult> | TResult
}) => Promise<void> | void
```

Use `defineDirective` from `graphql-gene` for stronger typing when building reusable directive factories.

## Directive name and the printed schema

Gene collects directive definitions and `@name` decorations when generating the GraphQL schema string.

- **`name: 'myDirective'`** — emits a directive definition and applies `@myDirective` in the SDL for types/fields that use it.
- **`name: ''` (empty string)** — skips adding this directive to the SDL. The `handler` still runs as middleware; nothing is printed for that entry in the schema string.

Empty `name` is useful when you need resolver-side behavior only — especially on constructs where exposing a custom directive in SDL would produce invalid or confusing output.

**In short: empty `name` means "run the handler, omit `@DirectiveName` from the generated schema string."**

## See also

- [Schema design](/docs/guides/schema-design)
- [Polymorphic page blocks](/docs/guides/polymorphic-blocks) — `@Polymorphic` uses a nameless directive to rewrite hub rows for GraphQL.
