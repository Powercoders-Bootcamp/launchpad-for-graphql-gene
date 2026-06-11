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
- running over stdio so local coding agents can attach directly
- optionally running over Streamable HTTP for separate deployment
- generating client-ready adoption presets
- verifying runtime health with a doctor command
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
