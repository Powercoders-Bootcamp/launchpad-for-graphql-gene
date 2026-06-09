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

Optional environment variables:

- `GRAPHQL_GENE_MCP_HOST`
- `GRAPHQL_GENE_MCP_PORT`
- `GRAPHQL_GENE_MCP_PATH`

Example preset templates live in:

- `examples/claude-desktop-config.json`
- `examples/cursor-mcp.json`
- `examples/generic-stdio-config.json`
- `examples/generic-http-config.json`
