# Delivery Phases

Phase 1 (product and contract definition) is complete — it produced the docs you are reading now.
Phases 2–5 are the implementation work. Each phase lists exact files to create and acceptance
criteria an agent can verify.

Phases 2 and 3 (backend) and Phase 4 (frontend + docs) can run in parallel once the API contract
is locked. Phase 5 is sequential — it requires a working build.

---

## Phase 2 — Backend Foundation

**Goal:** Nitro routes accept structured requests and return deterministic responses. No real
graphql-gene execution yet — stubs are fine.

**Files to create:**

| File | What it does |
|---|---|
| `types/index.ts` | All types and Zod schemas from `01-types.md` |
| `server/utils/playground/response.ts` | `okResponse` and `errorResponse` helpers |
| `server/utils/playground/registry.ts` | Example catalog + `getAllExamples` / `getExample` |
| `server/utils/playground/fixtures.ts` | Seeded fixture data per scenario (stub returns `{}`) |
| `server/utils/playground/engine.ts` | `runGenerate`, `runQuery`, `runDirective` — return hardcoded stubs |
| `server/api/health.get.ts` | Returns `{ status: 'ok' }` |
| `server/api/playground/examples.get.ts` | Returns full example catalog |
| `server/api/playground/generate.post.ts` | Validates request, calls `runGenerate`, returns response |
| `server/api/playground/query.post.ts` | Validates request, calls `runQuery`, returns response |
| `server/api/playground/directives.post.ts` | Validates request, calls `runDirective`, returns response |

**Acceptance criteria:**

```bash
# Health
curl http://localhost:3000/api/health
# → { "status": "ok" }

# Examples catalog
curl http://localhost:3000/api/playground/examples
# → { "requestId": "...", "status": "ok", "examples": [...] }

# Valid generate request returns ok shape
curl -X POST http://localhost:3000/api/playground/generate \
  -H "Content-Type: application/json" \
  -d '{"scenario":"model-to-schema","input":{"exampleId":"user-orders-basic"}}'
# → { "requestId": "...", "status": "ok", "scenario": "model-to-schema", "schema": { "sdl": "..." }, "diagnostics": [] }

# Unknown scenario returns UNKNOWN_SCENARIO error
curl -X POST http://localhost:3000/api/playground/generate \
  -H "Content-Type: application/json" \
  -d '{"scenario":"fake-scenario","input":{"exampleId":"x"}}'
# → { "status": "error", "error": { "code": "VALIDATION_ERROR", ... } }

# Invalid body returns VALIDATION_ERROR
curl -X POST http://localhost:3000/api/playground/query \
  -H "Content-Type: application/json" \
  -d '{"scenario":"query-lookahead","input":{}}'
# → { "status": "error", "error": { "code": "VALIDATION_ERROR", ... } }

# Unknown example returns UNKNOWN_EXAMPLE
curl -X POST http://localhost:3000/api/playground/query \
  -H "Content-Type: application/json" \
  -d '{"scenario":"query-lookahead","input":{"exampleId":"nonexistent","query":"{ me { id } }"}}'
# → { "status": "error", "error": { "code": "UNKNOWN_EXAMPLE", ... } }
```

---

## Phase 3 — graphql-gene Runtime Integration

**Goal:** Replace engine stubs with real `graphql-gene` + Sequelize + SQLite execution.

**Dependencies:** Phase 2 complete. Packages installed:
```bash
npm install graphql-gene @graphql-gene/plugin-sequelize sequelize sqlite3
```

**Files to update:**

| File | What changes |
|---|---|
| `server/utils/playground/fixtures.ts` | Real seeded Sequelize model instances per scenario |
| `server/utils/playground/engine.ts` | Real graphql-gene calls; SQL capture; timeout enforcement |

**What each engine function must do:**

### `runGenerate`
1. Build graphql-gene model config from the example definition + `modelEdits`.
2. Call `graphql-gene` to generate the schema.
3. Capture the generated SDL string.
4. Optionally extract `typeSummary` from the schema AST.
5. Wrap in `withTimeout(promise, 3000)`.
6. Return `{ sdl, typeSummary, diagnostics }`.

### `runQuery`
1. Seed an in-memory SQLite database with `getFixture(scenario, exampleId)`.
2. Initialize Sequelize models and associations.
3. Call `graphql-gene` with the `@graphql-gene/plugin-sequelize` plugin.
4. Capture the Sequelize SQL string via: `logging: (sql) => { capturedSql = sql }`.
5. Execute the GraphQL query string against the schema.
6. Extract the include graph from the Sequelize query plan or plugin diagnostics.
7. Wrap in `withTimeout(promise, 5000)`.
8. Return `{ data, includeGraph, sql: capturedSql, notes, diagnostics }`.

### `runDirective`
1. Build a schema with the directive attached per `directiveMode`.
2. Print the relevant SDL excerpt.
3. Describe runtime behavior in `runtimeBehaviorSummary`.
4. Wrap in `withTimeout(promise, 3000)`.
5. Return `{ directive, sdlExcerpt, diagnostics }`.

**Acceptance criteria:**

```bash
# Generate returns real SDL
curl -X POST http://localhost:3000/api/playground/generate \
  -H "Content-Type: application/json" \
  -d '{"scenario":"model-to-schema","input":{"exampleId":"user-orders-basic","modelEdits":{"includeOrders":true},"options":{"showTypeSummary":true}}}'
# → schema.sdl contains "type User" and "orders" field
# → schema.typeSummary contains { name: "User", kind: "object", fields: [...] }

# Query returns result + SQL
curl -X POST http://localhost:3000/api/playground/query \
  -H "Content-Type: application/json" \
  -d '{"scenario":"query-lookahead","input":{"exampleId":"me-with-orders","query":"{ me { id email orders { id status } } }"}}'
# → result.data.me.id exists
# → execution.sql is a non-null string containing "JOIN" or "SELECT"
# → execution.includeGraph.User contains "orders"

# Timeout is enforced (test by injecting a delay > 5s in engine)
# → response is { "status": "error", "error": { "code": "EXECUTION_TIMEOUT" } }

# No stack traces in error responses
# → error.message does not contain file paths, "node_modules", or "\n    at "
```

---

## Phase 4 — Frontend Playground and Docs

**Goal:** Users can select a scenario, edit inputs, run it, and see output. Docs pages render
from `content/graphql-gene/`. URL hash state is shareable.

**Files to create:**

| File | What it does |
|---|---|
| `composables/usePlayground.ts` | Full state + API call actions (see `03-frontend.md`) |
| `composables/useEditor.ts` | Monaco instance manager |
| `pages/playground.vue` | Playground page — scenario tabs, input panel, output panels |
| `pages/docs/[...slug].vue` | Docs catch-all page using `<ContentRenderer>` |
| `components/docs/DocsPlaygroundCallout.vue` | MDC callout with "Try in Playground" button |
| `components/docs/DocsSidebar.vue` | Sidebar built from `queryContent()` |
| `components/docs/DocsArticle.vue` | Doc page wrapper (title, edit link, status badge) |
| `nuxt.config.ts` | Content module config (see `04-docs-pipeline.md`) |
| `content/graphql-gene/` | Docs content present (submodule or manual — see `04-docs-pipeline.md`) |

**Acceptance criteria:**

```
Playground page
  ✓ /playground loads without error
  ✓ Scenario tabs render all 4 scenarios
  ✓ Selecting a scenario updates the example list
  ✓ Run button fires the correct API endpoint for each scenario
  ✓ SDL output panel displays returned sdl string
  ✓ Result output panel displays JSON
  ✓ SQL panel is visible for query-lookahead and polymorphic-blocks scenarios
  ✓ SQL panel is hidden for model-to-schema and directive-middleware
  ✓ isLoading disables the Run button and shows a spinner
  ✓ Error state shows an error banner with a safe message
  ✓ URL hash updates on scenario/example/query change
  ✓ Pasting a hash URL restores the correct scenario + example
  ✓ /playground?scenario=query-lookahead pre-selects that scenario on mount
  ✓ /api/health is fetched on mount (check Network tab)

Docs pages
  ✓ /docs/guides/directives renders the correct markdown content
  ✓ Sidebar shows all sections from docs.config.ts in order
  ✓ A page with playgroundScenario frontmatter renders the DocsPlaygroundCallout
  ✓ Callout button links to /playground?scenario=<value>
  ✓ Code blocks are syntax-highlighted
```

---

## Phase 5 — Polish and Launch Readiness

**Goal:** Experience is coherent, search works, and the service is safe for public traffic.

**Tasks (complete all before launch):**

```
Search
  ✓ pagefind --source .output/public runs without error after nuxt generate
  ✓ Search input in docs layout returns relevant results

Docs pipeline
  ✓ Nuxt build hook runs validation — missing required frontmatter fails the build
  ✓ Unknown section in frontmatter fails the build
  ✓ Duplicate slug fails the build
  ✓ Missing summary logs a warning only

Rate limiting
  ✓ Nitro middleware applies per-IP rate limits on /api/playground/* endpoints
  ✓ Exceeding the limit returns HTTP 429 with a safe message

Observability
  ✓ Every playground request logs: requestId, scenario, exampleId, durationMs, status
  ✓ Timeout events are logged with EXECUTION_TIMEOUT code

Security
  ✓ Response bodies never contain file paths, node_modules references, or raw stack traces
  ✓ Max request body size is enforced (returns HTTP 413 for oversized payloads)
  ✓ Query string > 2 000 characters is rejected with VALIDATION_ERROR

Performance
  ✓ /api/health returns within 200 ms (confirms pre-warm is useful)
  ✓ Playground cold start felt by user is < 3 s after health ping

Visual
  ✓ Playground and docs pages are responsive at 375 px, 768 px, and 1280 px viewports
  ✓ All output panels have copy-to-clipboard buttons
  ✓ Status badges render for experimental/planned/deprecated doc pages

Definition of Done
  ✓ All Phase 2–4 acceptance criteria still pass
  ✓ All Phase 5 tasks checked off above
  ✓ At least one end-to-end run of each scenario returns correct output on the deployed URL
```
