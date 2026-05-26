# Product Scope

## Objective

Build a real product demo for `graphql-gene` inside the marketing site: an interactive playground that uses a backend runtime instead of mocked frontend-only output.

The demo should help visitors understand what graphql-gene does in practice:

- generate GraphQL types from ORM-oriented model definitions
- reflect selection-set-driven loading behavior
- demonstrate directive-based runtime behavior
- showcase polymorphic content blocks with fragments and `__typename`

## Primary User

The primary audience is senior TypeScript and backend engineers evaluating whether graphql-gene is a serious architecture tool.

They are not looking for marketing animation alone. They want proof that:

- the model-to-schema story is real
- the developer experience is structured and scalable
- advanced GraphQL patterns are supported
- runtime behavior stays aligned with schema design

## Demo Goals

The playground should communicate four ideas clearly:

1. Define models once and derive GraphQL structure from them.
2. Fetching behavior follows the GraphQL operation shape.
3. Runtime middleware and directives can shape behavior safely.
4. Complex content models such as polymorphic page blocks remain ergonomic for frontend consumers.

## In-Scope MVP Experiences

### 1. Model to Schema

The user selects or edits a constrained demo model definition and sees:

- generated GraphQL SDL
- generated type summary
- warnings or diagnostics

### 2. Query to Include Graph

The user runs a sample query and sees:

- response payload
- selected relations or include tree
- execution notes explaining why specific associations were loaded

> **Amendment (2026-05-20):** Add a **SQL output panel** to this scenario. Alongside the response payload and include tree, show the actual SQL Sequelize generated for the query. This is the most direct proof of the lookahead capability — engineers can see exactly which joins were produced and why, without needing to understand the internals first.

### 3. Polymorphic Blocks

The user runs a page query with inline fragments and sees:

- `__typename`-driven results
- concrete block types such as `HeroBlock` and `TextBlock`
- a frontend-oriented explanation of fragment-based rendering

### 4. Directive Behavior

The user inspects a guided example showing:

- where a directive is attached
- what runtime behavior it applies
- whether it affects schema output, runtime behavior, or both

## Out of Scope for MVP

To keep the first version realistic and safe, the following are excluded:

- arbitrary user-supplied TypeScript execution
- unrestricted npm package loading
- user-created custom plugins uploaded through the browser
- multi-tenant persistent workspaces
- production-grade account features such as saved projects and collaboration

## UX Boundaries

The experience should feel real, but constrained:

- users can edit structured inputs, not raw unrestricted application code
- examples should be curated and high signal
- failures should produce helpful diagnostics, not raw internal stack traces
- every output panel should reinforce graphql-gene's architecture story

> **Amendment (2026-05-20):** Two additional UX patterns are in scope:
>
> - **URL-shareable playground state**: the active scenario, selected example, and query should be encoded in the URL hash. Users can copy the browser URL to share a specific playground state with a colleague.
> - **"Try in Playground" callouts in docs**: documentation pages that describe a playground scenario should embed a callout button that deep-links to the playground with that scenario pre-loaded. This closes the gap between reading about a feature and experiencing it.

## Success Criteria

The MVP is successful if a technical visitor can understand, within a few minutes:

- what graphql-gene generates
- how it differs from generic GraphQL tooling
- why its Sequelize-oriented architecture matters
- that the product can support real GraphQL patterns beyond trivial CRUD
