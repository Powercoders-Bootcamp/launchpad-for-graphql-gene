# GraphQL Gene MCP Server Open TODOs

## Purpose

This file tracks the remaining product, capability, and hardening work after the
foundation and adoption layers of the GraphQL Gene MCP server were implemented.

Current foundation already in place:

- canonical knowledge package
- docs and playground normalization into a shared catalog
- standalone `mcp-server/` package
- stdio and Streamable HTTP transports
- client registration presets via `npm run mcp:print-config`
- runtime verification via `npm run mcp:doctor`

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

### 2. Knowledge Wave 2: Ingest Plugins, Recipes, And Troubleshooting

Priority: high

Why this remains open:

- the current canonical catalog is strongest for `doc` and `example` entries
- real developer workflows also need plugin guidance, integration recipes, and troubleshooting material

Tasks:

- add first-class knowledge entry kinds for `plugin`, `recipe`, and `troubleshooting` or an equivalent normalized model
- ingest upstream GraphQL Gene material for:
  - Sequelize integration guidance
  - custom plugin authoring
  - common setup and runtime debugging paths
  - version-sensitive notes where upstream material supports them
- preserve provenance, version, confidence, and source-of-truth metadata for all new entries

Acceptance criteria:

- canonical catalog exposes the new entry kinds
- search can return the new kinds
- MCP resources can expose the new kinds
- tests cover ingestion, parity, and provenance

### 3. Replace Heuristic Tool Logic With Structured Decision Knowledge

Priority: high

Why this remains open:

- the current MCP tool surface exists
- but several tool outputs still depend partly on keyword inference in `packages/graphql-gene-knowledge/src/mcp/tools.ts`

Tasks:

- introduce a structured recipe-selection model
- introduce a structured plugin-decision model
- make these tools consume structured knowledge rather than relying mainly on inferred keyword buckets:
  - `recommend_integration_path`
  - `choose_plugin_strategy`
  - `plan_graphql_gene_integration`
  - `diagnose_graphql_gene_issue`
- require every recommendation to reference supporting canonical entries

Acceptance criteria:

- tool outputs stay concise but become more source-backed
- returned recommendations point to concrete supporting docs, examples, recipes, or plugin entries
- tests cover at least:
  - Sequelize-first path
  - custom plugin path
  - polymorphic blocks
  - directives
  - debugging flows

### 4. Add Second-Wave MCP Resources And Prompts

Priority: medium

Tasks:

- add resources for the new knowledge kinds, for example:
  - `plugins://catalog`
  - `plugins://plugin/{id}`
  - `recipes://catalog`
  - `recipes://recipe/{id}`
  - `troubleshooting://catalog`
  - `troubleshooting://issue/{id}`
- add prompts focused on:
  - plugin authoring
  - migration or upgrade planning
  - troubleshooting triage

Acceptance criteria:

- new resources are listed by `capabilities://server`
- new prompts are discoverable through the MCP manifest surface
- transport tests cover resource listing and at least one read per new resource family

### 5. Adoption, Release, And CI Readiness

Priority: medium

Tasks:

- add CI automation for:
  - site build
  - MCP build
  - targeted knowledge and MCP tests
  - `npm run mcp:doctor -- --json`
- decide the release shape for the MCP server:
  - repo-local only
  - publishable package
  - separately deployed HTTP service template
- document the version contract between the website and `mcp-server`
- optionally add a deployment recipe or container template for HTTP mode

Acceptance criteria:

- broken MCP handshakes are caught in CI before release
- supported transports and environment variables are documented in one stable place
- release steps are repeatable by another engineer without hidden context

### 6. HTTP Hardening And Operations

Priority: medium

Tasks:

- define auth expectations for separately deployed HTTP mode
- add rate limits
- add request size limits
- add safe and redacted logging
- add a health or readiness signal suitable for deployment checks

Acceptance criteria:

- HTTP mode has a clear "local trusted" vs "deployed service" operating story
- public-ish deployment defaults are safer than the current developer-default posture
- docs explain when stdio is enough and when HTTP should be used

### 7. Evaluation Harness For Answer Quality

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

1. knowledge wave 2
2. structured tool reasoning
3. second-wave resources and prompts
4. CI and release readiness
5. HTTP hardening
6. evaluation harness
7. homepage and product-positioning pass
