# Upstream GraphQL Gene Audit Spec

## Goal

Audit the upstream `graphql-gene` repository as the primary truth source for the canonical
knowledge layer.

This audit exists to produce reliable, source-backed inputs for:

1. the canonical knowledge compiler
2. the docs and playground integration layers
3. the GraphQL Gene developer MCP server

This is not a generic repo summary. It is a structured content extraction task.

## Scope

The audit must cover the upstream repository areas that define or clarify:

- library concepts
- public API shape
- supported workflows
- plugin model
- example usage
- troubleshooting signals
- version and source provenance

Primary source areas:

- repository root docs such as `README.md`
- root package metadata and workspace metadata
- `docs/`
- `docs/plugins/` if present
- `packages/`
- plugin packages
- examples, fixtures, or sample code if present
- tests that reveal intended behavior

Secondary source areas:

- migration notes
- roadmap or architecture notes
- release notes if they exist and are needed for version-awareness

## Non-Goals

- Do not rewrite upstream docs during the audit.
- Do not infer unsupported behavior from website demos.
- Do not treat this website repo as the primary source of GraphQL Gene truth.
- Do not produce a marketing summary instead of a structured audit.
- Do not skip code and rely only on markdown docs.

## Required Inputs

The audit must record:

- upstream repository URL
- audited branch, tag, or commit ref
- audit date
- auditor identity

If possible, prefer a stable ref over an unqualified `main` branch snapshot.

## Required Deliverables

The audit must produce all of the following deliverables.

### 1. Repository inventory

A structured inventory of:

- root files of interest
- docs directories
- package directories
- plugin directories
- example or test directories used for knowledge extraction

### 2. Docs inventory

For every meaningful upstream docs page, capture:

- source path
- title
- short summary
- topic area
- audience level if inferable
- related packages or plugins
- whether it looks canonical, tutorial, example, or troubleshooting-oriented

### 3. Package inventory

For every relevant package, capture:

- package name
- directory path
- short purpose
- public role in the GraphQL Gene architecture
- whether it is core, plugin, support, or internal

### 4. Plugin inventory

For every plugin or plugin-like package, capture:

- plugin id or package name
- target ORM or integration style
- setup expectations
- docs paths
- example or test evidence paths

### 5. Example inventory

For every example-worthy source discovered, capture:

- source path
- what capability it demonstrates
- whether it is suitable for docs, playground, MCP example resources, or all three
- whether it appears canonical, adapted, or incomplete

### 6. Concept map

A concept map covering at least:

- schema generation
- typing model
- `geneConfig`
- resolvers
- filters
- directives
- plugins
- server integration
- customization model

### 7. Developer scenario matrix

A scenario-first map of what a developer is trying to do when using GraphQL Gene.

Each scenario should include:

- scenario id
- user goal
- required knowledge areas
- likely packages or plugins involved
- key docs
- key examples
- expected MCP resources, prompts, and tools

### 8. Provenance and confidence report

Each extracted fact or entry class should be traceable to evidence and carry a confidence level:

- `high`
- `medium`
- `low`

### 9. Conflict log

Capture any contradictions or ambiguities such as:

- docs vs code mismatch
- package docs vs tests mismatch
- website playground vs upstream code mismatch
- version ambiguity

Each conflict should include:

- conflicting sources
- current best judgment
- recommended resolution rule

## Audit Reading Order

Use the following reading order unless a strong reason emerges to change it.

### Pass 1: Repository shape

Read:

- root `README.md`
- root package metadata
- workspace configuration
- top-level directory list

Goal:

- identify the main architectural components and public surfaces

### Pass 2: Docs surface

Read:

- all upstream docs pages
- plugin docs
- architecture and usage docs

Goal:

- build the initial docs inventory and concept map

### Pass 3: Code surface

Read:

- core package entrypoints
- exported types and config surfaces
- plugin package entrypoints

Goal:

- verify the public API and architecture claims made by docs

### Pass 4: Example and test surface

Read:

- examples if present
- representative tests that clarify intended behavior

Goal:

- identify canonical usage patterns and evidence for behavior

### Pass 5: Scenario synthesis

Using the outputs from the previous passes:

- derive developer scenarios
- identify MCP capability opportunities
- identify canonical example candidates

## Extraction Rules

### Rule 1: Evidence first

Every important statement in the audit must be traceable to at least one source path.

### Rule 2: Separate observed from inferred

Use this distinction explicitly:

- `observed`: directly evidenced by docs, code, or tests
- `inferred`: reasonably concluded from multiple sources but not explicitly stated

### Rule 3: Prefer upstream code over prose when they conflict

If markdown docs and actual code disagree:

- treat code as the stronger source for behavior
- treat docs as the stronger source for instructional framing
- log the conflict

### Rule 4: Prefer tests over assumptions

If behavior is ambiguous but tests clearly constrain it:

- use tests as strong evidence
- still record ambiguity if docs tell a different story

### Rule 5: Preserve version context

Do not record an extracted fact without version or ref context at the audit level.

## Output Models

The audit should produce content that can later map into canonical knowledge entries.

### `AuditedDoc`

- `sourcePath`
- `title`
- `summary`
- `topics`
- `kind`
- `relatedPackages`
- `observedCapabilities`
- `confidence`

### `AuditedPackage`

- `packageName`
- `sourcePath`
- `role`
- `summary`
- `exportsOfInterest`
- `relatedDocs`
- `confidence`

### `AuditedExample`

- `sourcePath`
- `title`
- `capability`
- `relatedDocs`
- `relatedPackages`
- `playgroundSuitability`
- `paritySuitability`
- `confidence`

### `AuditedScenario`

- `scenarioId`
- `goal`
- `trigger`
- `requiredConcepts`
- `requiredPackages`
- `requiredDocs`
- `requiredExamples`
- `recommendedMcpResources`
- `recommendedMcpPrompts`
- `recommendedMcpTools`

## Scenario Extraction Targets

The audit must explicitly test whether the upstream repo supports, documents, or implies
scenarios in the following families:

1. evaluating whether GraphQL Gene fits a project
2. installation and initial setup
3. typing and context setup
4. schema generation
5. GraphQL server integration
6. `geneConfig` customization
7. generated resolvers and filters
8. directives and middleware
9. plugin selection and setup
10. plugin authoring or extension
11. debugging and troubleshooting
12. version upgrade and migration

If a family is weakly documented or unsupported, record that explicitly.

## Canonical Example Selection Rules

The audit should identify examples that are suitable for downstream use in docs, playground,
and MCP resources.

An example is a strong candidate if:

- it demonstrates a meaningful GraphQL Gene capability
- it is backed by upstream code, not only prose
- it has clear source provenance
- it can be summarized without distortion

An example is a weak candidate if:

- it is website-only
- it depends on local demo glue not present upstream
- it is too incomplete to teach a real workflow

## Playground Parity Extraction Rules

Because playground examples should remain upstream-aligned, the audit must identify:

- which upstream example sources are canonical enough to project into the website
- which examples can provide displayed code directly
- which examples would require an adapted website execution harness
- which examples should never be represented as canonical runtime behavior

For each canonical example candidate, record:

- `codeSourcePath`
- `supportsDisplayedCodeParity`
- `supportsRuntimeParity`
- `requiresAdapter`
- `adapterRisk`

## MCP Mapping Rules

The audit is not complete unless it produces concrete MCP mapping material.

For each major scenario, the audit must propose:

- which information belongs in resources
- which workflow belongs in prompts
- which tailored reasoning belongs in tools

Use these boundaries:

- resource: stable reference knowledge
- prompt: repeatable workflow starter
- tool: context-sensitive interpretation, planning, or diagnosis

## Acceptance Criteria

The audit spec is considered successfully executed only if:

- the upstream repo ref is recorded
- docs, packages, plugins, and examples are inventoried
- every major concept area has source-backed evidence
- every developer scenario family has been assessed
- canonical example candidates are identified
- parity suitability for playground is assessed
- initial MCP resource/prompt/tool mappings are proposed
- conflicts and ambiguities are logged

## Suggested Output Artifacts

The implementation agent performing the audit should create artifacts such as:

- `docs/audit/00-repo-inventory.md`
- `docs/audit/01-docs-inventory.md`
- `docs/audit/02-package-inventory.md`
- `docs/audit/03-plugin-inventory.md`
- `docs/audit/04-example-inventory.md`
- `docs/audit/05-concept-map.md`
- `docs/audit/06-scenario-matrix.md`
- `docs/audit/07-conflict-log.md`

The exact file split may change, but the content must exist.

## Out Of Scope For This Phase

- building the compiler
- implementing the source adapters
- changing the website runtime
- implementing the MCP server
- rewriting upstream docs

## Next Step After This Audit

After the audit is complete, the next mandatory step is:

- define the canonical schema and provenance model

That work should use this audit as its evidence base rather than re-reading the repo from scratch.
