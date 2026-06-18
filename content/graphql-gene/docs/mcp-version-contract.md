---
title: MCP Version Contract
description: Understand how the website, canonical knowledge layer, GraphQL Gene version range, and MCP wrapper version are expected to stay aligned.
section: reference
category: mcp
order: 2
slug: /docs/reference/mcp-version-contract
status: experimental
summary: "The website repo is the release unit; docs, knowledge, playground projections, and the MCP wrapper should be built from the same commit whenever possible, while audit resources keep provenance and package-parity explicit."
related:
  - /docs/guides/mcp-server-setup
  - /docs/guides/mcp-server-deployment
  - /docs/reference/writing-a-plugin
---

# GraphQL Gene MCP version contract

The GraphQL Gene MCP server is not just a transport wrapper.

It serves knowledge compiled from:

- docs markdown in this repository
- canonical example metadata
- curated plugin, recipe, and troubleshooting entries

Because of that, version alignment must be explicit.

It must also stay auditable from the client side.

## The release unit

The **repository commit** is the real release unit.

In practical terms:

- website docs
- canonical knowledge compilation
- playground metadata projections
- MCP resources, prompts, and tools

should be built from the same commit whenever possible.

## The three version signals

### 1. `graphql-gene` version range

Source:

- root `package.json`

Meaning:

- the GraphQL Gene library range this repo is currently aligned with

Usage:

- included in canonical knowledge provenance
- exposed to MCP consumers as part of the knowledge context

### 2. `mcp-server` version

Source:

- `mcp-server/package.json`

Meaning:

- the wrapper and transport release version for the MCP server surface

Usage:

- exposed in the MCP manifest
- useful for deployment and rollout tracking

### 3. `sourceRef`

Source:

- current workspace or release commit

Meaning:

- the exact knowledge snapshot the MCP server was built from

Usage:

- provenance and debugging
- drift detection between docs, examples, and deployed MCP behavior

The built MCP runtime exposes this context through `knowledge://overview` and `audit://upstream-snapshot`.

## Package-parity contract

Version alignment alone is not enough for advanced GraphQL Gene capabilities.

Some guidance may be:

- confirmed by the currently installed public package surface
- conceptual but still useful for design guidance
- parity-sensitive and in need of explicit verification

That distinction is part of the runtime contract now. The MCP server exposes it through `audit://package-parity`, and developer-task outputs carry parity findings so coding agents can tell the difference between a released API surface and a higher-level pattern.

## Alignment rules

1. Build the deployed MCP server from the same commit as the docs it is expected to represent.
2. Treat upstream-aligned docs as the primary truth source when playground behavior is adapted.
3. Re-run `npm run mcp:verify` whenever the docs, recipes, troubleshooting catalog, or transport code changes so transport health, answer quality, provenance policy, and package-parity coverage are rechecked together.
4. Do not assume the MCP wrapper version alone is enough to describe behavioral compatibility.

## Publication rule

Standalone npm publication is intentionally deferred for now.

That becomes appropriate only when:

- the canonical knowledge assets have a cleaner extracted packaging story
- direct runtime dependencies are explicit and self-contained
- the release contract can be enforced without depending on the surrounding website repo layout

Until then, the supported approaches are:

- repo-local stdio
- separately deployed HTTP service built from this repository
