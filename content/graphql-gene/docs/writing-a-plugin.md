---
title: Writing a Plugin
description: How to extend graphql-gene beyond Sequelize by writing a custom ORM plugin.
section: reference
category: advanced
order: 1
slug: /docs/reference/writing-a-plugin
status: stable
summary: Learn how to write a graphql-gene plugin by studying the @graphql-gene/plugin-sequelize source as a reference implementation.
related:
  - /docs/concepts/getting-started
  - /docs/guides/schema-design
---

# Writing a Plugin

## Learning by example

The easiest way to get started is to study the source code of `@graphql-gene/plugin-sequelize`:

[View source on GitHub](https://github.com/accesimpot/graphql-gene/tree/main/packages/plugin-sequelize)

The Sequelize plugin is the reference implementation. It shows how to:

- Hook into the graphql-gene plugin API
- Derive GraphQL field types from ORM model definitions
- Implement query lookahead using the selection set
- Capture and expose SQL or equivalent query output

## Plugin interface

A plugin is a function that returns a configuration object consumed by `generateSchema`. Start by reading the TypeScript types exported from `graphql-gene` — the plugin interface is fully typed and self-documenting.

```ts
import { pluginSequelize } from '@graphql-gene/plugin-sequelize'

const { schema } = generateSchema({
  plugins: [pluginSequelize()],
  types: graphqlTypes,
})
```

A custom plugin follows the same pattern — replace `pluginSequelize()` with your own factory function.
