---
title: MCP Server Setup
description: Run the GraphQL Gene MCP server locally over stdio or Streamable HTTP and register it in an MCP client.
section: guides
category: integration
order: 4
slug: /docs/guides/mcp-server-setup
status: experimental
summary: Build the standalone GraphQL Gene MCP server, print client-ready registration snippets, and choose between stdio and Streamable HTTP transports.
related:
  - /docs/concepts/getting-started
  - /docs/reference/writing-a-plugin
  - /docs/guides/mcp-server-deployment
  - /docs/reference/mcp-version-contract
---

# GraphQL Gene MCP server setup

The GraphQL Gene MCP server is a separate package in this repository. Its job is to give coding agents source-backed GraphQL Gene guidance through tools, prompts, and resources.

Use it when you want an agent to:

- search canonical GraphQL Gene docs and examples
- inspect curated plugin, recipe, and troubleshooting guidance
- choose a plugin strategy
- plan an integration path
- diagnose GraphQL Gene issues

## Build the server

From the repository root:

```bash
npm run mcp:build
```

## Print ready-to-use config

The repository includes a helper that prints local registration snippets based on your actual workspace path:

```bash
npm run mcp:print-config
```

For machine-readable output:

```bash
npm run mcp:print-config -- --json
```

## Option 1: stdio transport

This is the simplest local setup for process-spawned MCP clients.

Start it manually:

```bash
npm run mcp:start
```

Or register the printed command snippet in any MCP client that supports spawned stdio servers.

### Ready-to-use client presets

The printed config payload also includes client wrappers for:

- Claude Desktop style `mcpServers` config
- Cursor style `mcpServers` config
- a generic `mcpServers` wrapper
- generic transport-first stdio and HTTP registrations

Template files also live in:

- `mcp-server/examples/claude-desktop-config.json`
- `mcp-server/examples/cursor-mcp.json`
- `mcp-server/examples/generic-stdio-config.json`

## Option 2: Streamable HTTP transport

This is the better option when you want a separately deployed MCP service or a client that prefers HTTP.

Start it manually:

```bash
npm run mcp:start:http
```

Optional environment variables:

```bash
GRAPHQL_GENE_MCP_HOST=127.0.0.1
GRAPHQL_GENE_MCP_PORT=3001
GRAPHQL_GENE_MCP_PATH=/mcp
GRAPHQL_GENE_MCP_HEALTH_PATH=/healthz
```

The repository also includes:

- `mcp-server/examples/http.env.example`
- `mcp-server/examples/generic-stdio-config.json`
- `mcp-server/examples/generic-http-config.json`

For the official deployment story and Docker template, see:

- `/docs/guides/mcp-server-deployment`
- `/docs/reference/mcp-version-contract`

## Verify the installation

Before handing this MCP server to an agent or IDE, run:

```bash
npm run mcp:doctor
```

This checks:

- build artifacts for the production stdio and HTTP entrypoints
- generated client preset payloads
- a real stdio MCP handshake
- a real Streamable HTTP MCP handshake
- the HTTP health endpoint
- tool/resource listing plus knowledge resource reads

For machine-readable output:

```bash
npm run mcp:doctor -- --json
```

## What clients should use

The most useful MCP capabilities right now are:

- resources for overview, docs catalogs, examples catalogs, plugin catalogs, recipe catalogs, troubleshooting catalogs, and single entry records
- prompts for integration framing and plugin authoring
- tools such as `search_knowledge`, `choose_plugin_strategy`, `plan_graphql_gene_integration`, and `diagnose_graphql_gene_issue`

## Source-of-truth rule

The MCP server is backed by the canonical knowledge layer in this repo. That means:

- docs, examples, plugins, recipes, and troubleshooting entries are linked through one normalized graph
- playground examples are still marked when they are adapted rather than canonical runtime behavior
- if a demo surface and upstream-aligned docs disagree, prefer the docs and source-backed examples
