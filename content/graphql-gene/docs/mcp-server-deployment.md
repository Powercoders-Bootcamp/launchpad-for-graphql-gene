---
title: MCP Server Deployment
description: Deploy the GraphQL Gene MCP server as a long-running Streamable HTTP service, with Docker as the recommended template.
section: guides
category: deployment
order: 5
slug: /docs/guides/mcp-server-deployment
status: experimental
summary: "Official release shape: repo-local stdio first, optional separately deployed HTTP service second, standalone npm publication deferred for now."
related:
  - /docs/guides/mcp-server-setup
  - /docs/reference/mcp-version-contract
---

# GraphQL Gene MCP deployment

The GraphQL Gene MCP server is designed around one canonical knowledge layer that lives in this repository.

That release shape matters.

## Official release shape

The currently supported packaging story is:

1. **Primary**: repo-local stdio usage for coding agents working inside this repository
2. **Secondary**: separately deployed Streamable HTTP service built from this same repository
3. **Deferred**: standalone npm publication as an independent package

Why npm publication is deferred:

- the MCP wrapper still depends on canonical knowledge compiled from this repo
- docs markdown is part of the runtime knowledge surface
- the current package boundary is optimized for correctness and provenance, not for ultra-thin publication

## When to use each mode

Use **stdio** when:

- the coding agent can spawn a local process
- the agent already has the repo checked out
- you want the simplest and safest setup

Use **HTTP** when:

- you need a long-running MCP endpoint
- you want one shared MCP service for multiple local clients
- you are deploying the server beside another internal tool or gateway

## Docker build

Build from the repository root because the MCP runtime needs canonical docs and knowledge assets outside `mcp-server/`.

```bash
docker build -f mcp-server/Dockerfile -t graphql-gene-mcp .
```

## Docker run

```bash
docker run --rm -p 3001:3001 --env-file mcp-server/examples/http.env.example graphql-gene-mcp
```

Default endpoints:

- MCP transport: `http://127.0.0.1:3001/mcp`
- Health endpoint: `http://127.0.0.1:3001/healthz`

## Environment contract

Supported HTTP deployment environment variables:

- `GRAPHQL_GENE_MCP_HOST`
- `GRAPHQL_GENE_MCP_PORT`
- `GRAPHQL_GENE_MCP_PATH`
- `GRAPHQL_GENE_MCP_HEALTH_PATH`

Recommended defaults:

```bash
GRAPHQL_GENE_MCP_HOST=0.0.0.0
GRAPHQL_GENE_MCP_PORT=3001
GRAPHQL_GENE_MCP_PATH=/mcp
GRAPHQL_GENE_MCP_HEALTH_PATH=/healthz
```

## Release guidance

Before you deploy a new HTTP image or long-running process, run:

```bash
npm run mcp:verify
```

That verifies:

- the MCP build output
- MCP-focused tests
- stdio handshake
- Streamable HTTP handshake
- canonical resource availability
- HTTP health endpoint availability

## Current operational boundary

This HTTP mode is appropriate for **trusted internal use** right now.

It is not yet positioned as a hardened public internet service because auth, rate limits, and request-size controls are still tracked as follow-up work.
