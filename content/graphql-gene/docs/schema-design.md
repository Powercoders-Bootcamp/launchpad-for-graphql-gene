---
title: Schema Design
description: Guidelines for designing a GraphQL API that plays well with graphql-gene, Sequelize, and normalized client caches.
section: guides
category: core
order: 1
slug: /docs/guides/schema-design
status: stable
summary: Naming conventions, auth scope patterns, performance best practices, and caching-friendly operation design for graphql-gene APIs.
related:
  - /docs/guides/directives
  - /docs/guides/polymorphic-blocks
---

# GraphQL schema design (graphql-gene)

Guidelines for designing a GraphQL API that plays well with **graphql-gene**, **Sequelize** (via `@graphql-gene/plugin-sequelize`), and common normalized client caches (Apollo Client, Urql, Relay, etc.).

---

## Example: `me`, aliases, and auth scope

graphql-gene often models different access scopes for the same underlying model with a **GraphQL alias** and **directives**. A typical pattern:

- A public-facing `User` type exposes a safe field set.
- An `AuthenticatedUser` alias (same Sequelize model, stricter `include` list) carries account-specific fields.
- An `@userAuth` directive runs before resolving fields that return `AuthenticatedUser`, loads the user with only the associations requested in the operation, and stores the result on `context`.

```graphql
type Query {
  me: AuthenticatedUser
}

type User {
  id: ID!
  username: String
}

type AuthenticatedUser {
  id: ID!
  email: String!
  username: String
  role: String
  address: Address
  orders: [Order!]
}
```

**Public lookup:**

```graphql
query PublicUser($id: ID!) {
  user(id: $id) {
    id
    username
  }
}
```

**Authenticated session with nested data:**

```graphql
query MeForAccount {
  me {
    id
    email
    username
    orders {
      id
      status
    }
  }
}
```

---

## Stay close to default resolution (includes and performance)

graphql-gene's Sequelize plugin integrates **lookahead**: default resolvers use helpers such as **`getQueryInclude`** so nested associations are only loaded when the client actually selects those fields.

**Prefer:**

- Letting the **default resolver** load associations implied by the schema.
- Declaring associations and `include` / `geneConfig` in a way that matches how clients traverse the graph.

**Avoid:**

- Custom resolvers that duplicate what the default layer already does.
- **N+1** patterns or unconditional deep `include`s "just in case" when the field is not selected.

---

## Mutations should return the modified objects

If a mutation changes an entity of type `Foo`, the payload should include `Foo` with enough `id` and `__typename` for normalized caches to merge updates.

**Why:** Clients can update in-memory cache by `id` without issuing a second query.

---

## Computed and virtual fields: declare dependencies with `findOptions`

If a field is computed from sibling associations, use the field's `findOptions` hook to add the necessary `include`s whenever that field is requested.

---

## Prefer stable `id` on object types

Expose a stable, unique `id` on types that represent persisted entities. Normalized caches use `__typename` + `id` to merge records across queries and mutations.

---

## Paginate list fields that can grow

For fields that return unbounded collections, use offset-style pagination with `skip` and `limit` arguments. Unbounded arrays on hot fields are a common performance footgun.

---

## Schema hygiene

- **Reuse and discover** existing fields before adding near-duplicates.
- **Document fields** so consumers know intent and safe usage.
- **`@deprecated`** with a reason instead of silently removing fields.

---

## Security

- Do not expose sensitive profile data on types meant for anonymous flows.
- Do not leak raw server errors to clients.
- Use `geneConfig` to explicitly exclude models that must never appear as GraphQL objects.

```ts
static readonly geneConfig = defineGraphqlGeneConfig(AuthToken, {
  include: [], // don't include any field
})
```

---

## See also

- [Gene directives](/docs/guides/directives)
- [Polymorphic page blocks](/docs/guides/polymorphic-blocks)
- [Writing a plugin](/docs/reference/writing-a-plugin)
