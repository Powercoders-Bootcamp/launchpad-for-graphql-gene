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
- optional rich project and issue context inputs for developer-facing MCP tools
- playground maintainer MCP tools for scenario inspection, planning, validation, parity comparison, and parity gate listing
- source-fingerprint-based cached site knowledge catalog invalidation for docs-backed catalog rebuilds
- catalog diagnostics that flag required playground parity gates and unverified displayed-code parity
- explicit `yaml` runtime dependency in `mcp-server/`
- package-local lockfile for reproducible `mcp-server/` installs
- golden MCP evaluation coverage for answer quality and provenance, runnable through `npm run mcp:eval` and `npm run mcp:verify`
- playground maintainer verification coverage via `npm run mcp:playground-verify`
- auto-detected workspace/package roots plus package-local adoption presets, so built MCP runtimes load the same canonical docs-backed knowledge surface as source tests

This backlog is intentionally implementation-oriented so a coding agent can pick
up concrete work from it.

## Open TODOs

### 1. Upstream Provenance And Example Parity Audit

Priority: high

Goal:

- move source provenance from repo-local `workspace` metadata toward explicit upstream refs
- prove which playground examples are canonical, adapted, or simulated
- keep displayed playground code aligned with upstream docs/source expectations

Tasks:

- audit upstream GraphQL Gene docs, examples, tests, and plugin packages
- assign explicit `sourceRepo`, `sourceRef`, `sourcePath`, and `sourceType` values where possible
- update playground example entries once parity is proven
- add drift checks for any scenario that claims canonical runtime or displayed-code parity

Acceptance criteria:

- every playground example has clear canonical/adapted/simulated status
- no adapted scenario is presented as exact upstream runtime behavior
- `validate_playground_scenario` passes for existing scenario implementation summaries
- catalog diagnostics stop warning about displayed-code parity only after parity is actually proven

### 2. Public HTTP Deployment Policy

Priority: medium

Goal:

- document the production boundary for Streamable HTTP MCP deployments
- keep the built-in HTTP hardening as an inner safety layer, not the only edge control

Tasks:

- define the recommended reverse proxy/TLS/auth deployment pattern
- decide whether bearer auth should be mandatory for non-local HTTP deployments
- document log retention and observability expectations

Acceptance criteria:

- production deployment docs clearly distinguish local stdio, local HTTP, and public HTTP usage
- public HTTP examples include auth and edge hardening guidance
- `mcp:doctor` remains able to verify a secured HTTP endpoint

## Explicit Non-Goals

These are intentionally not part of the backlog:

- do not add generic local filesystem tools; the host coding agent already has local project awareness
- do not make playground demos the primary truth source for MCP answers
- do not turn the MCP server into a generic IDE assistant unrelated to GraphQL Gene

## Suggested Execution Order

1. homepage and product-positioning pass
2. upstream provenance and playground parity audit
3. public HTTP deployment policy
