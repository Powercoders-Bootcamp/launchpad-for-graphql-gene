---
title: Getting Started
description: Install graphql-gene and generate your first executable GraphQL schema from Sequelize models.
section: concepts
order: 1
slug: /docs/concepts/getting-started
status: stable
summary: Install graphql-gene, wire up the Sequelize plugin, and generate an executable schema in under five minutes.
related:
  - /docs/guides/schema-design
  - /docs/guides/directives
---

# Getting Started

`graphql-gene` generates an executable GraphQL schema directly from your ORM models. Define your types once — GraphQL and TypeScript both stay in sync automatically.

## Install

```bash
# pnpm
pnpm add graphql-gene @graphql-gene/plugin-sequelize

# npm
npm i graphql-gene @graphql-gene/plugin-sequelize
```

## Export your models

Create a single file that re-exports every GraphQL type — ORM models, enums, and plain object types.

```ts
// src/models/graphqlTypes.ts
import { defineEnum, defineType } from 'graphql-gene'

export * from './models'

export const MessageOutput = defineType({
  type: 'MessageTypeEnum!',
  text: 'String!',
})
export const MessageTypeEnum = defineEnum(['info', 'success', 'warning', 'error'])
```

## Generate the schema

```ts
// src/server/schema.ts
import { generateSchema } from 'graphql-gene'
import { pluginSequelize } from '@graphql-gene/plugin-sequelize'
import * as graphqlTypes from '../models/graphqlTypes'

const { schema } = generateSchema({
  plugins: [pluginSequelize()],
  types: graphqlTypes,
})

export { schema }
```

Pass `schema` to any GraphQL server (graphql-yoga, Apollo Server, Fastify Mercurius, etc.).

## What you get

- **Automatic resolvers** — no hand-written boilerplate for CRUD operations.
- **Query lookahead** — only the associations your client selects are loaded from the database.
- **Type safety** — resolver arguments and return types are inferred from your models.
- **Directives** — attach auth or any middleware at the type or field level via `geneConfig.directives`.
