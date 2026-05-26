# Delivery Plan

## Product Goal

Build a real product demo for `graphql-gene` inside the marketing site: an interactive playground that runs actual graphql-gene execution on the backend — not a frontend simulation.

The audience is senior TypeScript and backend engineers. They want proof that:

- the model-to-schema story is real
- the developer experience is structured and scalable
- advanced GraphQL patterns (lookahead, polymorphism, directives) are supported
- runtime behavior stays aligned with schema design

## MVP Output

The first release includes:

- a public marketing site with a strong product story
- a public playground with four interactive scenarios
- a public documentation experience rendered from the graphql-gene GitHub repo
- a backend that runs real graphql-gene scenarios via Nitro server routes

## Playground Scenarios

Build in this order:

### 1. `model-to-schema`

User selects or edits a constrained model definition and sees:
- generated GraphQL SDL
- type summary
- diagnostics and warnings

### 2. `query-lookahead`

User runs a sample query and sees:
- response payload
- include graph (which associations were loaded and why)
- SQL output panel showing the Sequelize-generated JOIN query

The SQL panel is the most direct proof of the lookahead value proposition.

### 3. `polymorphic-blocks`

User runs a page query with inline fragments and sees:
- `__typename`-driven results
- concrete block types (`HeroBlock`, `TextBlock`, etc.)
- SQL output panel for the underlying queries

### 4. `directive-middleware`

User inspects a guided example showing:
- where a directive is attached
- what runtime behavior it applies
- whether it affects schema output, runtime behavior, or both

## UX Patterns

All four scenarios support:

- **URL-shareable state** — `scenarioId`, `exampleId`, and `query` encoded in the URL hash; copy the URL to share a specific state with a colleague
- **"Try in Playground" deep-links** — docs pages with `playgroundScenario` frontmatter render a callout that opens the playground pre-loaded with that scenario

## Security Boundaries

The playground must not become a generic remote code execution surface.

**What the backend accepts:**
- scenario identifiers (whitelist only)
- curated example IDs
- constrained query text
- limited variables
- safe configuration toggles

**What the backend never accepts:**
- arbitrary TypeScript or JavaScript
- npm package installation requests
- user-created plugins uploaded through the browser
- persistent user workspaces

**Hard limits per request:**
- generation: 2–3s timeout
- query execution: 3–5s timeout
- maximum request body size enforced
- maximum query text length enforced

**Error responses:**
- never expose raw stack traces, local file paths, or internal package layout
- always return a safe message, optional diagnostic hints, and a `requestId`

**Rate limiting:**
- by IP address, session identifier, and endpoint type

## Delivery Phases

### Phase 1 — Product and Contract Definition

- Finalize scenario list and editable fields per scenario
- Define frontend panel layout
- Lock API response shapes (see `api-contracts.md`)
- Define docs ingestion and routing rules
- Define `docs.config.ts` schema and validation rules

Outputs: approved examples catalog, API contract doc, docs pipeline rules

### Phase 2 — Backend Foundation

- Nitro server routes skeleton
- Request validation with Zod
- Scenario registry
- Execution orchestration layer
- Safe error model

Success: backend accepts structured requests and returns deterministic responses from real handlers

### Phase 3 — graphql-gene Runtime Integration

- Runtime adapter for graphql-gene and `@graphql-gene/plugin-sequelize`
- Seeded demo fixtures per scenario
- Schema generation path
- Query execution path
- Include graph extraction
- Sequelize SQL capture (`execution.sql`)

Success: at least one end-to-end scenario runs against the real engine with stable output

### Phase 4 — Frontend Playground and Docs

- Monaco input editor and output panels
- SQL output tab for `query-lookahead` and `polymorphic-blocks`
- Example switcher and scenario tabs
- Loading and error states
- URL hash state encoding and decoding
- "Try in Playground" deep-link intake on playground mount
- Docs rendering via `@nuxt/content` and git submodule
- Docs navigation generated from frontmatter and `docs.config.ts`

Success: users can pick an example, edit inputs, run it, and inspect outputs; docs pages render from GitHub without content drift

### Phase 5 — Polish and Launch Readiness

- Visual integration with the marketing site
- Pagefind search index wired into the docs layout
- "Try in Playground" callout blocks rendered in docs pages
- Request telemetry and observability
- Rate limiting active
- Copy review for technical clarity
- Responsive behavior verification

Success: experience feels coherent, fast, and reliable for public traffic

## Parallel Workstreams

Three workstreams can proceed in parallel after Phase 1:

1. **Backend runtime and API** — Phases 2 and 3
2. **Frontend playground and docs rendering** — Phase 4
3. **Content and example authoring** — fixtures, example copy, docs pages

Lock the API contract early so the frontend can start before every runtime detail is complete.

## Risks

| Risk | Mitigation |
|---|---|
| Scope expansion into a full online IDE | Hard security boundaries, curated inputs only |
| Backend latency making the experience feel unreliable | Timeouts, health ping pre-warm, fast fixture loading |
| Unstable runtime outputs during content design | Lock example outputs early; use fixture-driven execution |
| Security creep from allowing too much input freedom | Zod validation on all inputs, scenario whitelist |

## Definition of Done

The MVP is done when:

- the website contains a working public playground that runs through the real graphql-gene backend path
- the website contains a working public docs experience sourced from GitHub with no content drift
- visitors can understand at least three high-value graphql-gene capabilities interactively within a few minutes
- the service is safe, stable, and maintainable enough for public traffic
