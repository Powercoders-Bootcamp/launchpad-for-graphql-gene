# GraphQL Gene MCP Server Open TODOs

## Purpose

This file tracks the remaining product, capability, and hardening work after the
foundation and adoption layers of the GraphQL Gene MCP server were implemented.

Current foundation already in place:

- canonical knowledge package
- docs and playground normalization into a shared catalog
- structured plugin, recipe, and troubleshooting knowledge kinds
- standalone `mcp-server/` package
- stdio and Streamable HTTP transports
- structured decision-backed MCP tools for recommendation, planning, and diagnosis
- second-wave MCP resources for plugins, recipes, and troubleshooting
- second-wave MCP prompts for plugin authoring, upgrade planning, and issue triage
- client registration presets via `npm run mcp:print-config`
- runtime verification via `npm run mcp:doctor`
- documented release shape and version contract for repo-local plus HTTP deployment
- Docker deployment template for Streamable HTTP mode
- HTTP health endpoint for deployment checks
- optional bearer auth for the HTTP MCP endpoint
- built-in request size limits and process-local rate limiting for HTTP mode
- safe and redacted HTTP access logging
- explicit `yaml` runtime dependency in `mcp-server/`
- package-local lockfile for reproducible `mcp-server/` installs

This backlog is intentionally implementation-oriented so a coding agent can pick
up concrete work from it.

## Open TODOs

### 1. Product Positioning: Explain The Real Differentiator

Priority: high

Goal:

- make it clear that GraphQL Gene is not merely "a library that supports polymorphism"
- state the real positioning precisely: ORM-native, generator-first, automatic schema generation from real models

Tasks:

- update homepage copy with one concise proof point that contrasts GraphQL Gene with generic union/interface-capable builders
- keep the claim factual and non-defensive; do not imply that unions or interfaces themselves are unique to GraphQL Gene
- mirror the same positioning in the relevant docs and MCP-facing copy where helpful
- keep the current homepage structure intact; no redesign required

Acceptance criteria:

- homepage contains one concise message about the ORM-native plus generator-first difference
- message does not overclaim "exclusive polymorphism support"
- `MCP` messaging already added to the homepage remains intact
- site build passes after the copy update

### 2. Package Publication And Dependency Cleanup

Priority: medium

Tasks:

- keep the new CI workflow healthy across dependency updates
- keep the current official release shape explicit:
  - repo-local stdio is primary
  - separately deployed HTTP is supported
  - standalone npm publication is deferred
- if npm publication becomes a goal later, extract the remaining repo-coupled runtime assumptions
- make direct runtime dependencies fully explicit for the separately deployed package boundary

Acceptance criteria:

- broken MCP handshakes are caught in CI before release
- supported transports and environment variables are documented in one stable place
- release steps are repeatable by another engineer without hidden context

### 3. Evaluation Harness For Answer Quality

Priority: medium

Tasks:

- add golden MCP evaluation cases for:
  - docs search
  - plugin recommendation
  - integration planning
  - issue diagnosis
- test not only transport health but answer quality and provenance behavior
- include at least one case where upstream-aligned docs should win over adapted playground framing

Acceptance criteria:

- evaluation catches regressions in reasoning quality
- evaluation catches regressions in provenance policy
- evaluation can be run in CI or release validation

## Explicit Non-Goals

These are intentionally not part of the backlog:

- do not add generic local filesystem tools; the host coding agent already has local project awareness
- do not make playground demos the primary truth source for MCP answers
- do not turn the MCP server into a generic IDE assistant unrelated to GraphQL Gene

## Suggested Execution Order

1. CI and release readiness
2. evaluation harness
3. homepage and product-positioning pass
