---
title: Polymorphic Page Blocks
description: Model a CMS-style page with heterogeneous blocks using graphql-gene's @Polymorphic decorator.
section: guides
category: core
order: 3
slug: /docs/guides/polymorphic-blocks
status: stable
summary: Use the @Polymorphic hub pattern to compose pages from typed blocks and query them with inline fragments in a single operation.
related:
  - /docs/guides/directives
  - /docs/guides/schema-design
playgroundScenario: polymorphic-blocks
---

# Polymorphic page blocks

This pattern models a CMS-style page composed of heterogeneous blocks (hero, rich text, gallery, etc.): one ordered list in GraphQL where each item may be a different concrete type, selected in a single operation using `__typename` and inline fragments.

```graphql
query PagePolymorphicBlocks($path: String!) {
  pageByPath(where: { path: { eq: $path } }) {
    id
    path
    blocks {
      id
      __typename

      ... on HeroBlock {
        title
        subtitle
      }

      ... on TextBlock {
        body
      }
    }
  }
}
```

## Setup

**Page**

```ts
import { AllowNull, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { extendTypes } from 'graphql-gene'
import { PageBlock } from '../PageBlock/PageBlock.model'

@Table
export class Page extends Model {
  @AllowNull(false)
  @Column(DataType.STRING)
  declare path: string

  @HasMany(() => PageBlock)
  declare blocks: PageBlock[] | null
}

extendTypes({
  Query: {
    pageByPath: {
      resolver: 'default',
      returnType: 'Page',
    },
  },
})
```

**Hub** — list the concrete block models once; the decorator adds the polymorphic wiring.

```ts
import { Polymorphic } from '@graphql-gene/plugin-sequelize'

@Polymorphic(() => [HeroBlock, TextBlock])
@Table
export class PageBlock extends Model {
  @ForeignKey(() => Page)
  @Column(DataType.INTEGER)
  declare pageId: number

  @BelongsTo(() => Page)
  declare page: Page | null
}
```

**Concrete blocks** — ordinary models with their own fields.

```ts
@Table
export class HeroBlock extends Model {
  @Column(DataType.STRING)
  declare title: string

  @Column(DataType.STRING)
  declare subtitle: string
}
```

## Querying

Use `__typename` plus inline fragments so each block type requests only its fields.

```graphql
query PagePolymorphicBlocks($path: String!) {
  pageByPath(where: { path: { eq: $path } }) {
    id
    path
    blocks {
      id
      __typename

      ... on HeroBlock {
        title
        subtitle
      }

      ... on TextBlock {
        body
      }
    }
  }
}
```

### Example response

```json
{
  "data": {
    "pageByPath": {
      "id": 1,
      "path": "/__polymorphic_demo_page__",
      "blocks": [
        { "id": 101, "__typename": "HeroBlock", "title": "Hello", "subtitle": "Polymorphic demo hero" },
        { "id": 102, "__typename": "TextBlock", "body": "Plain text body." }
      ]
    }
  }
}
```

## What graphql-gene does

`@Polymorphic` wires real Sequelize `BelongsTo` relationships from the join row to each concrete block. The default resolver uses lookahead — Sequelize `include` is derived from the incoming GraphQL operation, so only associations for concrete block types you actually queried contribute to nested loading.

In GraphQL, the decorator generates a `PageBlock`-shaped `interface` that includes only `id`. Each concrete type owns its own shape beyond `id`.

## Frontend and component trees

Because each list element is typed by concrete `__typename`, UIs can map typename → component without an extra fetch per block. One query drives a tree of block components that matches your CMS block structure.

## See also

- [Directives](/docs/guides/directives)
- [Schema design](/docs/guides/schema-design)
