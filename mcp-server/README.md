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

To emit the same verification report in machine-readable JSON:

```bash
npm run doctor -- --json
```

From the repository root, the MCP-focused verification shortcuts are:

```bash
npm run mcp:test
npm run mcp:verify
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

## CI Notes

The repository includes a dedicated GitHub Actions workflow at:

- `.github/workflows/mcp-server-ci.yml`

It verifies:

- MCP wrapper build output
- site build integrity
- MCP-focused Vitest coverage
- doctor JSON generation for stdio and Streamable HTTP handshakes

The workflow currently installs `mcp-server/` dependencies with `npm install`
because that package does not yet have its own committed lockfile.
