# MCP Developer Task Implementation Plan

## Objective

Turn the GraphQL Gene MCP server into a task-aware developer assistant for teams adopting GraphQL Gene in their own projects.

The MCP server should not be limited to the website playground. It should help coding agents answer questions such as:

- Should this project use GraphQL Gene?
- Which plugin path should this project choose?
- How should GraphQL Gene be added to an existing server?
- How should schema generation, type exports, directives, filters, lookahead, and custom plugins be implemented?
- How should issues in generated schema or runtime behavior be diagnosed?

The implementation must keep the MCP API small and composable. Many developer tasks are allowed, but each task must not become a separate MCP tool.

## Architectural Principles

1. Treat developer tasks as canonical knowledge, not as hardcoded MCP tool names.
2. Keep tool count small and task count data-driven.
3. Prefer upstream GraphQL Gene docs, package exports, and source-backed knowledge over website playground behavior.
4. Treat playground scenarios as conceptual demonstrations, not copy-paste implementation sources.
5. Attach evidence, confidence, version notes, and parity warnings to every important task recommendation.
6. Let the host coding agent inspect local project files, then pass summarized project context to MCP tools.
7. Do not turn the MCP server into a generic IDE assistant unrelated to GraphQL Gene.

## Phase 1: Canonical Developer Task Taxonomy

Extend the developer task catalog in `packages/graphql-gene-knowledge/src/developer/task-patterns.ts`.

The current four playground-aligned patterns should become part of a broader task taxonomy. The task catalog should include at least these task families:

1. `evaluate-graphql-gene-fit`
2. `choose-plugin-strategy`
3. `bootstrap-sequelize-project`
4. `create-canonical-types-module`
5. `setup-typescript-augmentation`
6. `generate-executable-schema`
7. `inspect-generated-schema`
8. `configure-scalars-and-datatype-map`
9. `control-field-exposure`
10. `model-auth-scopes-with-aliases`
11. `add-generated-query-fields`
12. `use-generated-filters-order-pagination`
13. `optimize-lookahead-loading`
14. `add-custom-query-or-mutation`
15. `design-cache-friendly-mutations`
16. `attach-directive-middleware`
17. `decide-directive-sdl-visibility`
18. `model-polymorphic-content-blocks`
19. `write-custom-plugin`
20. `debug-schema-generation`
21. `debug-runtime-resolution`
22. `upgrade-version-and-parity-check`
23. `combine-with-graphql-codegen`
24. `migrate-from-handwritten-schema`

Each task entry should include:

- `id`
- `title`
- `summary`
- `developerGoal`
- `stage`
- `capabilities`
- `whenToUse`
- `requiredProjectSignals`
- `implementationSteps`
- `validationChecklist`
- `commonPitfalls`
- `sourceEvidence`
- `confidence`
- `versionNotes`
- `warnings`
- `relatedScenario`
- `relatedDocs`
- `relatedRecipes`
- `relatedPlugins`
- `relatedExamples`

The task taxonomy should be serializable so resources, tools, prompts, tests, and future docs pages can consume the same canonical data.

## Phase 2: Provenance, Confidence, And Parity

Add an evidence model for task entries.

Recommended shape:

```ts
interface DeveloperTaskEvidence {
  sourcePath: string
  sourceKind: 'upstream-doc' | 'local-doc' | 'package-export' | 'package-readme' | 'curated-knowledge' | 'playground-demo'
  claim: string
  confidence: 'high' | 'medium' | 'low'
}
```

Add version awareness:

- Record the currently installed `graphql-gene` version.
- Record the currently installed `@graphql-gene/plugin-sequelize` version.
- Return version notes from planning and diagnosis tools.

Add parity warnings:

- If docs describe a capability but package exports do not confirm it, return a warning.
- If a playground scenario demonstrates a behavior but source/package evidence is incomplete, return a warning.
- If a task is website-only or demo-adapted, mark it as conceptual support only.

Known parity-sensitive area:

- The docs describe a `@Polymorphic` pattern, but the currently installed `@graphql-gene/plugin-sequelize@1.2.6` public export surface should be verified before MCP presents it as a directly importable API.

## Phase 3: MCP Tool Surface

Keep the developer tool surface composable.

Target developer-facing tools:

1. `list_developer_task_patterns`
2. `classify_developer_goal`
3. `plan_developer_task`
4. `adapt_example_to_project`
5. `validate_developer_task_plan`
6. `diagnose_developer_issue`

Do not create one MCP tool per task family.

### `list_developer_task_patterns`

Purpose: list and filter task patterns.

Inputs:

- `query`
- `stage`
- `capability`
- `orm`
- `confidence`
- `scenario`

Output:

- matching task summaries
- required project signals
- confidence
- source counts
- related docs, recipes, plugins, and examples

### `classify_developer_goal`

Purpose: map a developer goal to one or more task ids.

Inputs:

- `goal`
- `project`
- `constraints`

Output:

- ranked task candidates
- rationale
- missing context questions for the host coding agent to answer from local files
- recommended next tool call

### `plan_developer_task`

Purpose: produce an actionable implementation plan for a selected task.

Inputs:

- `taskId`
- `goal`
- `project`
- `constraints`
- `targetVersion`

Output:

- chosen task
- plugin strategy
- implementation steps
- validation checklist
- risks
- version notes
- source evidence
- docs, recipes, plugins, and examples

### `adapt_example_to_project`

Purpose: adapt a canonical GraphQL Gene example or concept to the developer's project.

Inputs:

- `taskId`
- `exampleId`
- `goal`
- `project`
- `targetModels`
- `constraints`

Output:

- concept mapping from example to project
- adaptation steps
- source policy
- warnings against copying playground runtime code
- validation checklist

### `validate_developer_task_plan`

Purpose: validate a proposed implementation plan before a coding agent edits code.

Inputs:

- `taskId`
- `goal`
- `project`
- `proposedSteps`
- `selectedPlugin`
- `usesPlaygroundCodeAsSource`
- `usesPlaygroundRuntimeAsSource`
- `includesSchemaInspection`
- `includesTests`
- `includesPluginDecision`
- task-specific booleans such as `handlesLookahead`, `handlesDirectiveRuntimeMode`, and `handlesPolymorphicResolution`

Output:

- `pass`, `warn`, or `fail`
- issues
- remediation
- canonical checks
- source evidence

### `diagnose_developer_issue`

Purpose: diagnose implementation and runtime issues in a task-aware way.

Inputs:

- `symptom`
- `stage`
- `project`
- `observedBehavior`
- `expectedBehavior`
- `selectedPlugin`
- `schemaExcerpt`
- `operationExcerpt`

Output:

- likely diagnosis area
- likely causes
- recommended checks
- related troubleshooting entries
- related task ids
- source evidence
- next MCP tool recommendation

## Phase 4: MCP Resources And Prompts

Add task-focused resources:

- `developer-tasks://overview`
- `developer-tasks://task/{id}`

Each task resource should expose:

- full task definition
- evidence
- related docs
- related recipes
- related plugins
- related examples
- known warnings

Add or update prompts for repeatable workflows:

- adoption planning
- plugin strategy selection
- schema generation setup
- directive middleware implementation
- lookahead debugging
- custom plugin authoring
- handwritten schema migration

Prompt behavior:

- Prompts should instruct the host coding agent to inspect local files first.
- Prompts should not claim MCP can directly read the user's local project unless the host agent passes that context.
- Prompts should recommend MCP tools in sequence.

## Phase 5: Tests

Add unit tests for task catalog behavior:

- lists all expected task ids
- filters by capability, stage, ORM, and confidence
- includes source evidence for each task
- includes warnings for parity-sensitive tasks
- keeps playground as conceptual support only

Add MCP tool tests:

- `classify_developer_goal` maps setup, plugin strategy, directive, lookahead, schema debugging, and migration goals correctly.
- `plan_developer_task` returns steps, validation checklist, source evidence, and version notes.
- `adapt_example_to_project` refuses playground runtime as implementation source.
- `validate_developer_task_plan` fails plans that skip plugin decision, schema inspection, or task-specific checks.
- `diagnose_developer_issue` maps symptoms to task-aware diagnosis and related troubleshooting.

Add integration tests:

- MCP stdio lists all developer tools.
- MCP HTTP lists all developer tools.
- MCP stdio can call `classify_developer_goal`, `plan_developer_task`, and `diagnose_developer_issue`.
- MCP HTTP can call the same representative tools.

Add eval tests for:

- Sequelize setup
- non-Sequelize custom plugin decision
- auth directive implementation
- lookahead or N+1 diagnosis
- polymorphic parity warning
- missing schema type diagnosis
- migration from handwritten schema

## Phase 6: MCP Doctor

Update `mcp-server/scripts/doctor.mjs`.

Doctor should verify:

1. MCP build artifacts exist.
2. Client presets still generate.
3. Stdio runtime lists tools and resources.
4. HTTP runtime lists tools and resources.
5. `classify_developer_goal` works over stdio and HTTP.
6. `plan_developer_task` works over stdio and HTTP.
7. `diagnose_developer_issue` works over stdio and HTTP.
8. Developer task resources are readable.

Doctor output should include:

- developer tool count
- task count
- selected sample task ids
- version metadata
- parity warning count

## Phase 7: Documentation Updates

Update `mcp-server/README.md`.

Document:

- developer task assistant purpose
- six composable developer tools
- source and playground boundaries
- example client calls
- recommended host-agent workflow

Update `docs/07-mcp-server-architecture-and-implementation-plan.md`.

Document:

- data-driven task taxonomy
- tool composition model
- provenance and confidence rules
- task resources
- doctor acceptance criteria

Update `docs/09-mcp-server-open-todos.md`.

Track remaining work:

- upstream full audit
- package export parity pass
- deeper examples
- optional future schema/provenance compiler

## Acceptance Criteria

The implementation is complete when:

1. `npm run mcp:verify` passes.
2. The MCP manifest exposes the six composable developer tools.
3. Developer task resources are available.
4. The task catalog covers the target task families.
5. Every task has source evidence and confidence.
6. Planning outputs include plugin strategy, steps, validation checklist, risks, evidence, and version notes.
7. Validation catches playground-copy risk and missing schema inspection.
8. Diagnosis maps common developer symptoms to task-aware checks.
9. Doctor validates representative developer task calls over stdio and HTTP.
10. Playground code remains a conceptual reference, not the primary implementation source.

## Suggested Commit Slices

1. Add expanded developer task taxonomy and evidence model.
2. Add `classify_developer_goal` and `diagnose_developer_issue`.
3. Wire developer task resources and prompt updates.
4. Expand MCP server schemas and tests.
5. Update doctor verification.
6. Update docs and open TODOs.

## Non-Goals

- Do not rewrite the website playground runtime.
- Do not create one MCP tool per developer task.
- Do not make claims unsupported by upstream docs, package exports, or curated source-backed knowledge.
- Do not let website demos outrank package/source evidence.
- Do not inspect developer local files inside this MCP server unless a future local-mode architecture is explicitly designed.
