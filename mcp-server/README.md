# GraphQL Gene MCP Server

This package is the thin, separately deployable MCP transport wrapper for the
shared GraphQL Gene knowledge layer.

It does not contain GraphQL Gene domain logic itself.

That logic lives in:

- `../packages/graphql-gene-knowledge/src`

This wrapper is responsible for:

- loading the canonical knowledge catalog
- exposing resources, prompts, and tools through MCP
- surfacing docs, examples, plugins, recipes, and troubleshooting guidance from one shared graph
- exposing a task-aware developer assistant layer for real GraphQL Gene project work
- exposing separate playground maintainer tools for scenario contracts, parity gates, and implementation validation
- running over stdio so local coding agents can attach directly
- optionally running over Streamable HTTP for separate deployment
- generating client-ready adoption presets
- verifying runtime health and maintainer tool invocation with a doctor command
- checking answer quality and provenance with a golden evaluation harness

It now resolves the workspace root automatically for both source and compiled
runtime layouts, so the built server can validate the same docs-backed knowledge
surface that the source tests exercise.

## Supported Release Shape

The current official support story is:

- repo-local stdio usage as the primary path
- separately deployed Streamable HTTP service as the secondary path
- standalone npm publication deferred for now

Why publication is deferred:

- the canonical knowledge layer still depends on docs and metadata that live in this repository
- the current boundary is optimized for provenance and correctness, not for a thin published package

## Commands

```bash
npm install
npm run build
npm run start
```

For development:

```bash
npm run dev
```

For Streamable HTTP mode:

```bash
GRAPHQL_GENE_MCP_PORT=3001 npm run start:http
```

To print local registration snippets:

```bash
npm run print-config
```

To verify build outputs plus stdio/HTTP runtime handshakes:

```bash
npm run doctor
```

To emit the same verification report in machine-readable JSON:

```bash
npm run doctor -- --json
```

From the repository root, the MCP-focused verification shortcuts are:

```bash
npm run mcp:eval
npm run mcp:playground-verify
npm run mcp:test
npm run mcp:verify
```

Optional environment variables:

- `GRAPHQL_GENE_MCP_WORKSPACE_ROOT`
- `GRAPHQL_GENE_MCP_SOURCE_REPO`
- `GRAPHQL_GENE_MCP_SOURCE_REF`
- `GRAPHQL_GENE_MCP_GRAPHQL_GENE_VERSION_RANGE`
- `GRAPHQL_GENE_MCP_HOST`
- `GRAPHQL_GENE_MCP_PORT`
- `GRAPHQL_GENE_MCP_PATH`
- `GRAPHQL_GENE_MCP_HEALTH_PATH`
- `GRAPHQL_GENE_MCP_AUTH_TOKEN`
- `GRAPHQL_GENE_MCP_MAX_BODY_BYTES`
- `GRAPHQL_GENE_MCP_RATE_LIMIT_WINDOW_MS`
- `GRAPHQL_GENE_MCP_RATE_LIMIT_MAX_REQUESTS`
- `GRAPHQL_GENE_MCP_ENABLE_ACCESS_LOGS`

## Tool Families

Developer-facing discovery and explanation tools help agents use GraphQL Gene in their own projects:

- `search_knowledge`
- `recommend_integration_path`
- `choose_plugin_strategy`
- `explain_graphql_gene_feature`
- `plan_graphql_gene_integration`
- `diagnose_graphql_gene_issue`

Task-aware developer tools help agents turn GraphQL Gene capabilities into
project-specific implementation plans without confusing demos for source of
truth:

- `list_developer_task_patterns`
- `classify_developer_goal`
- `plan_developer_task`
- `adapt_example_to_project`
- `validate_developer_task_plan`
- `diagnose_developer_issue`

Developer task resources are also exposed through:

- `developer-tasks://overview`
- `developer-tasks://task/{id}`

Playground maintainer tools help agents implement this website's playground
scenarios without confusing adapted demos with upstream GraphQL Gene behavior:

- `inspect_playground_scenario`
- `validate_playground_scenario`
- `plan_playground_scenario`
- `compare_playground_with_canonical`
- `list_playground_parity_gates`

The maintainer tools expect structured summaries from the host coding agent. They
do not read local files themselves; the host agent remains responsible for local
project inspection.

## Source Boundaries

The MCP server is designed for developers using GraphQL Gene in their own
projects, not only for this website playground.

Boundary rules:

- canonical docs, recipes, plugin metadata, package exports, and package behavior outrank playground demos
- playground examples are conceptual support unless parity is explicitly proven
- the host coding agent inspects local files; the MCP server consumes summarized context instead of reading the project directly

## Recommended Host-Agent Workflow

1. Inspect local files in the target project and summarize models, server wiring, plugin choices, schema ownership, and constraints.
2. Call `classify_developer_goal` to map the developer goal into the right task family.
3. Call `plan_developer_task` to get plugin strategy, implementation steps, validation checks, evidence, warnings, and version notes.
4. Call `adapt_example_to_project` only to translate concepts, not to copy playground runtime code.
5. Call `validate_developer_task_plan` before editing code when the task has non-obvious risk.
6. Call `diagnose_developer_issue` when behavior diverges during setup, schema generation, directives, query lookahead, or migration work.

## Example Client Calls

Representative tool calls:

- classify a migration goal:
  `classify_developer_goal { "goal": "Migrate part of our hand-written schema to GraphQL Gene", "project": { "orm": "Sequelize", "currentGraphqlSetup": "hand-written schema" } }`
- plan a directive task:
  `plan_developer_task { "taskId": "attach-directive-middleware", "project": { "orm": "Sequelize", "serverStack": "Apollo Server" } }`
- diagnose missing generated types:
  `diagnose_developer_issue { "symptom": "Generated schema is missing expected model fields", "stage": "schema", "project": { "orm": "Sequelize" } }`

HTTP hardening notes:

- `GRAPHQL_GENE_MCP_AUTH_TOKEN` protects the MCP endpoint with bearer auth
- the health endpoint remains intentionally lightweight for readiness probes
- request bodies are capped by default
- the built-in rate limiter is process-local and should be treated as an inner safety layer, not a full edge-control replacement
- access logs avoid request bodies and token values by default

Runtime layout notes:

- `print-config` now emits package-local `npm --prefix <absolute-mcp-server-root> run ...` commands instead of depending on root wrapper scripts
- `GRAPHQL_GENE_MCP_WORKSPACE_ROOT` can override the repo snapshot root when the package is deployed in a non-standard directory layout
- `GRAPHQL_GENE_MCP_SOURCE_REPO`, `GRAPHQL_GENE_MCP_SOURCE_REF`, and `GRAPHQL_GENE_MCP_GRAPHQL_GENE_VERSION_RANGE` let you keep provenance metadata explicit when the root `package.json` is not the authoritative release marker

## Docker HTTP Template

Build from the repository root:

```bash
docker build -f mcp-server/Dockerfile -t graphql-gene-mcp .
```

Run the HTTP service:

```bash
docker run --rm -p 3001:3001 --env-file mcp-server/examples/http.env.example graphql-gene-mcp
```

Default endpoints:

- MCP: `http://127.0.0.1:3001/mcp`
- health: `http://127.0.0.1:3001/healthz`

Example preset templates live in:

- `examples/claude-desktop-config.json`
- `examples/cursor-mcp.json`
- `examples/generic-stdio-config.json`
- `examples/generic-http-config.json`

## CI Notes

The repository includes a dedicated GitHub Actions workflow at:

- `.github/workflows/mcp-server-ci.yml`

It verifies:

- MCP wrapper build output
- site build integrity
- MCP-focused Vitest coverage
- golden answer-quality and provenance evaluations
- doctor JSON generation for stdio and Streamable HTTP handshakes plus the HTTP health endpoint
- built runtime coverage for canonical docs, examples, plugins, recipes, and troubleshooting resources

The workflow installs `mcp-server/` dependencies with `npm ci --prefix mcp-server`,
so the package boundary is now reproducible through its own committed lockfile.
