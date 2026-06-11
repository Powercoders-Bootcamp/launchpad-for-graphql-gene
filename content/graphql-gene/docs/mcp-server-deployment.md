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

Recommended defaults:

```bash
GRAPHQL_GENE_MCP_WORKSPACE_ROOT=/app
GRAPHQL_GENE_MCP_SOURCE_REPO=graphql-gene-site
GRAPHQL_GENE_MCP_SOURCE_REF=workspace
GRAPHQL_GENE_MCP_GRAPHQL_GENE_VERSION_RANGE=
GRAPHQL_GENE_MCP_HOST=0.0.0.0
GRAPHQL_GENE_MCP_PORT=3001
GRAPHQL_GENE_MCP_PATH=/mcp
GRAPHQL_GENE_MCP_HEALTH_PATH=/healthz
GRAPHQL_GENE_MCP_AUTH_TOKEN=replace-me
GRAPHQL_GENE_MCP_MAX_BODY_BYTES=262144
GRAPHQL_GENE_MCP_RATE_LIMIT_WINDOW_MS=60000
GRAPHQL_GENE_MCP_RATE_LIMIT_MAX_REQUESTS=120
GRAPHQL_GENE_MCP_ENABLE_ACCESS_LOGS=true
```

`GRAPHQL_GENE_MCP_WORKSPACE_ROOT` is the most important override when the repo snapshot is mounted somewhere other than the default auto-detected layout.

## HTTP hardening defaults

The Streamable HTTP wrapper now supports the following protection layer directly:

- optional bearer-token auth for the MCP endpoint
- request body size limits
- per-process in-memory rate limiting
- safe request logging without request bodies or token values

Important behavior notes:

- the MCP endpoint can be protected with `GRAPHQL_GENE_MCP_AUTH_TOKEN`
- the health endpoint stays intentionally minimal so deployment probes can still work
- the built-in rate limiter is process-local, so a reverse proxy or API gateway is still the better outer layer for multi-instance deployments

## Recommended deployment stance

For an internal shared service, use all of the following together:

- `GRAPHQL_GENE_MCP_AUTH_TOKEN`
- the default body limit unless you have a measured reason to raise it
- the default rate limit unless another platform layer already enforces stricter limits
- a reverse proxy or platform ingress if the service will be reachable beyond localhost or a single trusted subnet

## Release guidance

Before you deploy a new HTTP image or long-running process, run:

```bash
npm run mcp:verify
```

That verifies:

- the MCP build output
- MCP-focused tests
- golden answer-quality and provenance evaluations
- stdio handshake
- Streamable HTTP handshake
- canonical resource availability
- HTTP health endpoint availability

## Current operational boundary

This HTTP mode is now appropriate for **trusted internal deployments**.

It is still better treated as an internal service than a raw public internet endpoint. If you expose it more broadly, put it behind stronger platform controls such as managed auth, ingress filtering, and edge rate limiting.
