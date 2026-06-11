# GraphQL Gene Canonical Knowledge Layer And Developer MCP Plan

## Goal

Create a single canonical knowledge layer that serves three surfaces:

1. the docs website
2. the playground
3. the GraphQL Gene developer MCP server

The main product goal is still the MCP server for developers using GraphQL Gene in their
own projects, but the best architecture is not MCP-only. The best architecture is a shared,
normalized knowledge layer that all three surfaces can consume.

## Executive Conclusion

Do not force all sources into one authoring format.

Do build one canonical content model.

This is the key architectural decision.

That means:

- docs can remain markdown + frontmatter
- playground examples can remain structured catalog entries
- MCP can consume normalized entries

But all of them should converge into one shared `KnowledgeEntry` graph.

Additional rule:

- playground code and example semantics should remain aligned with upstream GraphQL Gene sources
  rather than drifting into website-only demo implementations

## Current Reality

### Docs surface

The docs surface is currently frontmatter-first.

Observed behavior:

- markdown pages are ingested by `@nuxt/content`
- frontmatter is schema-validated
- navigation, search, status, related links, and slugs depend on frontmatter

Relevant files:

- [content.config.ts](C:/Users/yusBug/Desktop/GraphQL%20Gene/content.config.ts)
- [pages/docs/[...slug].vue](C:/Users/yusBug/Desktop/GraphQL%20Gene/pages/docs/[...slug].vue)
- [components/docs/DocsSidebar.vue](C:/Users/yusBug/Desktop/GraphQL%20Gene/components/docs/DocsSidebar.vue)
- [components/docs/DocsSearch.vue](C:/Users/yusBug/Desktop/GraphQL%20Gene/components/docs/DocsSearch.vue)
- [server/utils/docs-validation.ts](C:/Users/yusBug/Desktop/GraphQL%20Gene/server/utils/docs-validation.ts)

Current doc ingestion model:

- source format: markdown with YAML frontmatter
- digest model: frontmatter metadata + markdown body
- runtime usage: docs rendering, nav, search, page metadata

### Playground surface

The playground surface is currently catalog-first, not markdown-first.

Observed behavior:

- examples are sourced from a structured TypeScript registry
- UI loads examples from an API backed by that registry
- scenario execution is driven by runtime code, not doc frontmatter

Relevant files:

- [server/utils/playground/registry.ts](C:/Users/yusBug/Desktop/GraphQL%20Gene/server/utils/playground/registry.ts)
- [server/api/playground/examples.get.ts](C:/Users/yusBug/Desktop/GraphQL%20Gene/server/api/playground/examples.get.ts)
- [composables/usePlayground.ts](C:/Users/yusBug/Desktop/GraphQL%20Gene/composables/usePlayground.ts)
- [pages/playground.vue](C:/Users/yusBug/Desktop/GraphQL%20Gene/pages/playground.vue)

Current playground ingestion model:

- source format: structured code catalog
- digest model: strongly typed example metadata + runtime scenario wiring
- runtime usage: scenario picker, example selection, execution inputs

### Docs to playground relationship

There is a relationship, but it is enrichment, not ownership.

Examples:

- docs frontmatter may reference a `playgroundScenario`
- docs can link into playground
- this does not make docs the source of truth for playground scenarios

Architectural implication:

- docs and playground are related surfaces
- they should not be collapsed into one source format
- playground should be treated as a projection layer over canonical examples, not as an
  independent truth source for GraphQL Gene behavior

## Architectural Decision

The unified solution is:

`source-specific ingestion + canonical normalization + multi-surface delivery`

This is the recommended professional architecture.

## Core Assumption About The Host Agent

The host coding agent already has access to the developer's local project and can:

- inspect source code
- inspect project structure
- inspect model files
- inspect `package.json`
- inspect GraphQL server setup
- inspect existing GraphQL Gene usage
- run commands and edit files

Because of that, the MCP server should not duplicate generic local file access.

The MCP server should provide GraphQL Gene expertise.

The canonical knowledge layer should provide GraphQL Gene knowledge.

The host agent should provide local project context.

## High-Level Architecture

```text
upstream graphql-gene repo
  |- README
  |- docs
  |- plugin docs
  |- packages
  `- examples/tests

website repo runtime catalogs
  `- playground registry and scenario metadata

source adapters
  |- docs markdown adapter
  |- playground catalog adapter
  |- plugin/package adapter
  |- recipe/workflow adapter
  `- troubleshooting adapter

canonical knowledge compiler
  `- normalized KnowledgeEntry graph

delivery surfaces
  |- docs site
  |- playground
  `- developer MCP server
```

## Design Principles

1. Unify the model, not the authoring format.
2. Keep docs markdown-native.
3. Keep playground example metadata structured.
4. Normalize everything into one canonical schema.
5. Let each surface consume what it needs from that schema.
6. Keep MCP domain-expert and version-aware.
7. Keep playground examples upstream-aligned in both displayed code and intended semantics.

## Source Of Truth Rules

These rules are mandatory.

1. Upstream GraphQL Gene repository is the primary truth source for library behavior.
2. Website docs are a delivery surface for canonical docs content, not an independent truth source.
3. Playground examples are a projection of canonical examples, not an independent truth source.
4. If playground behavior and upstream code or docs disagree, upstream wins.
5. MCP resources and tools must prefer upstream-derived knowledge over website-local demo behavior.

## Playground Parity Rules

The playground is a capability showcase, not a separate implementation track.

Required parity rules:

1. Every canonical example should carry source provenance:
   - `sourcePath`
   - `sourceRepo`
   - `sourceRef`
2. Displayed example code should come from upstream sources or generated artifacts derived from them.
3. If the website needs a runtime adapter for execution, the adapter should wrap or project upstream
   example intent rather than inventing an unrelated example.
4. If execution is simulated or adapted, the system must not misrepresent it as the exact canonical
   library runtime unless that is actually true.
5. CI or validation scripts should detect drift between upstream example sources and website example
   projections where feasible.

## Recommended Repository Layout

```text
root
|- pages/
|- components/
|- composables/
|- server/
|- packages/
|  `- graphql-gene-knowledge/
|     `- src/
|        |- contracts/
|        |- adapters/
|        |- compiler/
|        |- graph/
|        |- docs/
|        |- examples/
|        |- plugins/
|        |- recipes/
|        |- troubleshooting/
|        |- workflows/
|        `- index.ts
`- mcp-server/
   `- src/
      |- resources/
      |- prompts/
      |- tools/
      |- transport/
      |- auth/
      |- logging/
      `- index.ts
```

## Canonical Knowledge Layer

The `graphql-gene-knowledge` package should be the single normalized content source for:

- docs metadata
- docs body references
- example metadata
- plugin metadata
- recipes
- troubleshooting entries
- workflow definitions
- source provenance
- version metadata

It should not contain:

- generic filesystem browsing
- host-agent-only runtime logic
- website-only wrappers
- MCP transport logic

## Canonical Knowledge Schema

The package should normalize all sources into a common graph.

### Base type

```ts
type KnowledgeKind =
  | 'doc'
  | 'example'
  | 'plugin'
  | 'recipe'
  | 'troubleshooting'
  | 'workflow'

interface KnowledgeEntryBase {
  id: string
  kind: KnowledgeKind
  title: string
  summary: string
  topics: string[]
  relatedIds: string[]
  sourcePath: string
  sourceRepo: string
  sourceRef: string
  sourceType: 'canonical-doc' | 'canonical-code' | 'canonical-test' | 'demo-catalog' | 'demo-runtime'
  confidence: 'high' | 'medium' | 'low'
  versionRange?: string
  stability?: 'stable' | 'experimental' | 'planned' | 'deprecated'
}
```

### Specialized entries

```ts
interface DocEntry extends KnowledgeEntryBase {
  kind: 'doc'
  slug: string
  section: string
  category?: string
  body: string
  sidebarLabel?: string
  playgroundScenario?: string
}

interface ExampleEntry extends KnowledgeEntryBase {
  kind: 'example'
  exampleId: string
  scenario: string
  description: string
  editableFields: string[]
  recommendedDocIds: string[]
  codeSourcePath?: string
  executionMode?: 'canonical' | 'adapted' | 'simulated'
}

interface PluginEntry extends KnowledgeEntryBase {
  kind: 'plugin'
  pluginId: string
  orm?: string
  packageName?: string
}

interface RecipeEntry extends KnowledgeEntryBase {
  kind: 'recipe'
  recipeId: string
  workflowStage: 'setup' | 'integration' | 'customization' | 'debugging' | 'upgrade'
  steps: string[]
}

interface TroubleshootingEntry extends KnowledgeEntryBase {
  kind: 'troubleshooting'
  issueId: string
  symptoms: string[]
  likelyCauses: string[]
  checks: string[]
  fixes: string[]
}
```

### Graph model

The compiler should also build:

- `entriesById`
- `entriesByKind`
- `entriesByTopic`
- `reverseLinks`
- optional search index

## Source Adapters

### Docs markdown adapter

Input:

- upstream markdown docs
- frontmatter fields already validated or derivable

Output:

- `DocEntry`

Rules:

- preserve current frontmatter-driven docs behavior
- do not require converting docs into TS manifests
- allow enrichment from sidecar metadata when frontmatter is insufficient

### Playground catalog adapter

Input:

- structured example registry
- scenario ids
- editable fields
- descriptions

Output:

- `ExampleEntry`

Rules:

- preserve structured example catalog authoring
- do not force examples into markdown
- split runtime execution config from knowledge metadata if useful

### Plugin/package adapter

Input:

- upstream package metadata
- plugin docs
- package names

Output:

- `PluginEntry`

### Recipe adapter

Input:

- curated recipes and workflow definitions
- may be authored as markdown, JSON, or TS manifests

Output:

- `RecipeEntry`

### Troubleshooting adapter

Input:

- known issues
- guidance notes
- recurring setup failures

Output:

- `TroubleshootingEntry`

## Metadata Strategy

Do not require every source to expose the same metadata fields directly.

Instead:

1. define a strong canonical metadata schema
2. derive as much as possible automatically
3. enrich where needed per source type

### Docs metadata strategy

Docs are the place where frontmatter is already natural and useful.

Use current frontmatter fields as first-class inputs:

- `title`
- `description`
- `section`
- `order`
- `slug`
- `category`
- `status`
- `summary`
- `related`
- `sidebarLabel`
- `playgroundScenario`

Optional future enrichment fields for docs only:

- `topics`
- `audience`
- `featureArea`
- `workflowStage`
- `plugin`
- `orm`
- `versionRange`

These should be optional, not mandatory for initial ingestion.

### Playground metadata strategy

Playground example metadata should remain catalog-first.

Required structured fields:

- `exampleId`
- `scenario`
- `title`
- `description`
- `editableFields`

Optional enrichment fields:

- `recommendedDocIds`
- `topics`
- `workflowStage`
- `stability`

### Knowledge package rule

The knowledge package requires canonical metadata.
The raw sources do not all need to expose it in identical ways.

## Surface Consumption Model

### Docs site consumption

Short-term:

- keep `@nuxt/content` for page body rendering
- keep frontmatter-driven route and content parsing
- begin consuming canonical knowledge entries for:
  - nav enrichment
  - search indexing
  - related links
  - status and summary consistency checks

Long-term:

- docs site may consume more of the canonical graph directly
- markdown body rendering can still remain `@nuxt/content` based

### Playground consumption

Short-term:

- keep scenario execution runtime where it is
- begin consuming canonical `ExampleEntry` metadata for:
  - example list
  - descriptions
  - docs links
  - related knowledge

Long-term:

- split example metadata from runtime execution config
- let the runtime registry import canonical example metadata instead of duplicating it

### MCP consumption

The MCP server should consume the canonical knowledge layer directly.

It should not scrape website pages.

It should not treat playground RPC calls as its primary knowledge source.

## Developer MCP Capability Model

The MCP server remains a GraphQL Gene developer-enablement server.
It now sits on top of the canonical knowledge graph.

### Resources

Resources should be generated from normalized entries.

Required direct resources:

- `capabilities://server`
- `knowledge://overview`
- `docs://catalog`
- `examples://catalog`
- `plugins://catalog`
- `recipes://catalog`
- `troubleshooting://catalog`

Required template resources:

- `docs://page/{slug}`
- `examples://example/{exampleId}`
- `plugins://plugin/{pluginId}`
- `recipes://recipe/{recipeId}`
- `troubleshooting://issue/{issueId}`
- `workflows://pattern/{workflowId}`

Rules:

1. Catalog resources stay concise.
2. Detailed resources return one entry at a time.
3. Every resource should include source provenance and version metadata.

### Prompts

Prompts should guide common GraphQL Gene workflows using canonical resources.

Minimum prompt set:

1. `start_graphql_gene_integration`
2. `choose_integration_recipe`
3. `debug_graphql_gene_problem`
4. `author_graphql_gene_plugin`
5. `upgrade_graphql_gene_version`

### Tools

Tools should use canonical knowledge plus host-agent context.

Recommended core tools:

1. `search_knowledge`
2. `recommend_integration_path`
3. `choose_plugin_strategy`
4. `explain_graphql_gene_feature`
5. `plan_graphql_gene_integration`
6. `diagnose_graphql_gene_issue`

Optional later tools:

- `compare_graphql_gene_approaches`
- `summarize_version_changes`
- `playground_generate_schema`
- `playground_run_query`

The playground tools remain secondary.

## MCP Tool Contract Philosophy

The host agent already knows the local project.
The tools should accept structured summaries, not file paths to scan.

Recommended input models:

### `ProjectSummary`

- package manager
- runtime and language
- GraphQL server framework
- ORM or data access layer
- current GraphQL setup style
- relevant constraints
- target outcome

### `IssueReport`

- user goal
- observed error or failure
- relevant snippet summaries
- what has already been tried
- environment information
- GraphQL Gene version if known

### `FeatureQuestion`

- topic
- desired depth
- current context
- target version if known

## Version Awareness

Version awareness is mandatory across all three surfaces.

Why:

- docs may drift
- examples may evolve
- MCP advice can become incorrect if version-blind

Requirements:

1. every normalized entry records source provenance
2. compiler output includes source ref or release version when possible
3. MCP tools accept optional target version
4. search and lookup prefer the requested version when supported

## Build And Delivery Pipeline

### Source layer

- upstream docs markdown
- upstream package/plugin metadata
- playground example registry
- curated recipes and troubleshooting data

### Adapter layer

- parse source-specific fields
- validate source-specific constraints
- map to canonical intermediate objects

### Compiler layer

- normalize entries
- assign ids
- connect relationships
- build indexes
- emit JSON and TypeScript consumable artifacts

### Delivery layer

- docs site reads canonical metadata and markdown body
- playground reads canonical example metadata plus runtime config
- MCP server reads canonical graph directly

## Recommended Build Outputs

The knowledge package should emit at least:

- `entries.json`
- `entriesById.json`
- `catalogs.json`
- `searchIndex.json` or equivalent in-memory representation
- TypeScript exports for runtime consumers

## Implementation Phases

### Phase 1: Upstream Audit

Audit the upstream GraphQL Gene repository in full.

Execution details for this phase are defined in
[08-upstream-audit-spec.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/08-upstream-audit-spec.md).

Deliverables:

- docs inventory
- package inventory
- plugin inventory
- example inventory
- concept map
- versioning assumptions

### Phase 2: Canonical Schema And Provenance Model

Define the canonical knowledge types and validation rules.

Deliverables:

- `KnowledgeEntryBase`
- specialized entry types
- relationship model
- source provenance model
- confidence model
- example parity metadata model

### Phase 3: Source Adapters

Implement the source adapters.

Deliverables:

- docs markdown adapter
- playground catalog adapter

Deferred within this phase unless needed immediately:

- plugin/package adapter
- recipe adapter
- troubleshooting adapter

### Phase 4: Compiler

Build the canonical knowledge compiler.

Deliverables:

- normalized graph
- catalogs
- indexes
- emitted artifacts
- parity validation hooks for examples where feasible

### Phase 5: Docs Integration

Begin consuming canonical knowledge in the docs site without breaking current rendering.

Done when:

- nav can be derived or enriched from canonical entries
- search can consume canonical docs metadata
- related/status consistency is validated against canonical data
- markdown rendering remains `@nuxt/content` based

### Phase 6: Playground Integration

Begin consuming canonical example metadata in the playground.

Done when:

- example labels and descriptions come from canonical entries
- runtime scenario ids stay aligned with canonical example ids
- docs and examples can cross-link through shared ids
- displayed example code can be traced back to upstream source provenance

### Phase 7: MCP Server

Build the developer MCP server on top of the canonical knowledge graph.

Done when:

- resources expose canonical catalogs and detailed entries
- prompts point to canonical resources
- tools use canonical knowledge and host-agent summaries
- MCP does not rely on website page scraping or playground RPCs as primary truth sources

### Phase 8: Hardening

Add:

- rate limits
- auth as needed
- request size limits
- safe logging
- evaluation harness

## Definition Of Done

The implementation is complete only if all items below are true:

- docs, playground, and MCP all consume the same canonical knowledge layer
- docs remain markdown-native where that is already the right authoring model
- playground remains structured-catalog-native where that is already the right authoring model
- the system unifies on one canonical schema, not one raw source format
- MCP is clearly library-centric and not website-centric
- the host agent remains responsible for local project inspection
- MCP remains responsible for GraphQL Gene expertise
- search returns concise, provenance-aware hits
- version metadata is present across normalized knowledge
- structured errors include remediation hints

## Explicit Anti-Patterns

Do not do any of the following:

- do not force playground example data into markdown frontmatter
- do not force docs pages into TS catalogs just to satisfy uniformity
- do not make website pages the MCP server's knowledge source
- do not build generic filesystem tools the host agent already has
- do not return full docs bodies from search tools
- do not ignore version differences between sources
- do not duplicate metadata across docs, playground, and MCP without a compiler step

## Recommended First Scope

For the first serious implementation slice:

1. complete the upstream audit
2. define the canonical knowledge schema
3. implement the docs adapter
4. implement the playground catalog adapter
5. build the first compiler output
6. expose the first canonical catalogs:
   - docs
   - examples
7. add source provenance and confidence fields
8. add example parity metadata and validation hooks
9. wire MCP resources to those catalogs
10. add the first MCP prompts
11. add the first MCP decision tools

First-slice note:

- plugins, recipes, and troubleshooting should be modeled in the schema now
- but their full ingestion can remain a second wave after docs + examples are stable

Initial MCP capability set:

- resources:
  - `capabilities://server`
  - `knowledge://overview`
  - `docs://catalog`
  - `docs://page/{slug}`
  - `examples://catalog`
  - `examples://example/{exampleId}`
- prompts:
  - `start_graphql_gene_integration`
  - `choose_integration_recipe`
  - `debug_graphql_gene_problem`
  - `author_graphql_gene_plugin`
- tools:
  - `search_knowledge`
  - `recommend_integration_path`
  - `choose_plugin_strategy`
  - `explain_graphql_gene_feature`
  - `plan_graphql_gene_integration`
  - `diagnose_graphql_gene_issue`

Deferred:

- plugins full ingestion wave
- recipes full ingestion wave
- troubleshooting full ingestion wave
- playground demo execution tools
- advanced upgrade diff tools
- public registry publication
- any local-filesystem-aware capability beyond host-agent summaries

## Active Backlog

The current implementation backlog lives in:

- [docs/09-mcp-server-open-todos.md](C:/Users/yusBug/Desktop/GraphQL%20Gene/docs/09-mcp-server-open-todos.md)
