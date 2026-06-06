---
title: Quick Start
description: Get graphql-gene running in under 5 minutes with Sequelize and graphql-yoga.
section: tutorials
order: 1
slug: /docs/tutorials/quick-start
status: stable
summary: Step-by-step guide to install graphql-gene, define your first models, generate the schema, and run your first GraphQL query.
related:
  - /docs/concepts/getting-started
  - /docs/guides/schema-design
  - /docs/guides/directives
---

# Quick Start

Get a fully functional GraphQL API running in under 5 minutes.

## Prerequisites

- Node.js 18+
- A project with [Sequelize](https://sequelize.org) already set up

## Step 1 — Install

```bash
# pnpm
pnpm add graphql-gene @graphql-gene/plugin-sequelize graphql-yoga graphql

# npm
npm i graphql-gene @graphql-gene/plugin-sequelize graphql-yoga graphql
```

## Step 2 — Define your models

Create (or use your existing) Sequelize models. graphql-gene reads them directly.

```ts
// src/models/User.model.ts
import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript'
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'

@Table
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>

  @Column(DataType.STRING)
  declare email: string

  @Column(DataType.STRING)
  declare name: string
}
```

## Step 3 — Export all types from one file

```ts
// src/models/graphqlTypes.ts
export * from './User.model'
// export * from './Order.model'  — add more models here
```

## Step 4 — Generate the schema

```ts
// src/schema.ts
import { generateSchema } from 'graphql-gene'
import { pluginSequelize } from '@graphql-gene/plugin-sequelize'
import * as graphqlTypes from './models/graphqlTypes'

export const { schema } = generateSchema({
  plugins: [pluginSequelize()],
  types: graphqlTypes,
})
```

That's it. graphql-gene automatically creates:

- `type User` with all your columns
- `Query.users` with pagination, filtering, and ordering built in

## Step 5 — Start the server

```ts
// src/index.ts
import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema'

const yoga = createYoga({ schema })
const server = createServer(yoga)

server.listen(4000, () => {
  console.log('GraphQL API ready at http://localhost:4000/graphql')
})
```

## Step 6 — Run your first query

Open `http://localhost:4000/graphql` and run:

```graphql
query {
  users(where: { name: { like: "%Alex%" } }) {
    id
    email
    name
  }
}
```

graphql-gene automatically generates `where`, `order`, `page`, and `perPage` arguments for every list field — no resolver code needed.

## What's next?

- **[Schema Design](/docs/guides/schema-design)** — auth scope, aliases, performance patterns
- **[Directives](/docs/guides/directives)** — add middleware at the type or field level
- **[Polymorphic Blocks](/docs/guides/polymorphic-blocks)** — model heterogeneous content types
- **[Try the Playground](/playground)** — run live graphql-gene scenarios in your browser
