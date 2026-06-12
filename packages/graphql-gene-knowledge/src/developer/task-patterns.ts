import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
  TroubleshootingStage,
} from '../contracts'

export type DeveloperTaskId =
  | 'evaluate-graphql-gene-fit'
  | 'choose-plugin-strategy'
  | 'bootstrap-sequelize-project'
  | 'create-canonical-types-module'
  | 'setup-typescript-augmentation'
  | 'generate-executable-schema'
  | 'inspect-generated-schema'
  | 'configure-scalars-and-datatype-map'
  | 'control-field-exposure'
  | 'model-auth-scopes-with-aliases'
  | 'add-generated-query-fields'
  | 'use-generated-filters-order-pagination'
  | 'optimize-lookahead-loading'
  | 'add-custom-query-or-mutation'
  | 'design-cache-friendly-mutations'
  | 'attach-directive-middleware'
  | 'decide-directive-sdl-visibility'
  | 'model-polymorphic-content-blocks'
  | 'write-custom-plugin'
  | 'debug-schema-generation'
  | 'debug-runtime-resolution'
  | 'upgrade-version-and-parity-check'
  | 'combine-with-graphql-codegen'
  | 'migrate-from-handwritten-schema'

export type DeveloperTaskPatternId =
  | DeveloperTaskId
  | 'model-to-schema'
  | 'query-lookahead'
  | 'polymorphic-blocks'
  | 'directive-middleware'

export type DeveloperTaskStage =
  | 'evaluate'
  | 'setup'
  | 'typing'
  | 'schema'
  | 'server'
  | 'customization'
  | 'query'
  | 'directive'
  | 'plugin'
  | 'debug'
  | 'upgrade'
  | 'integration'
  | 'migration'

export type DeveloperTaskCapability =
  | 'adoption'
  | 'plugin-strategy'
  | 'setup'
  | 'typing'
  | 'schema-generation'
  | 'schema-inspection'
  | 'scalars'
  | 'field-exposure'
  | 'aliases'
  | 'generated-query'
  | 'filtering'
  | 'lookahead'
  | 'mutation'
  | 'directive'
  | 'polymorphism'
  | 'plugin-authoring'
  | 'debugging'
  | 'upgrade'
  | 'codegen'
  | 'migration'

export type DeveloperTaskConfidence = 'high' | 'medium' | 'low'
export type DeveloperTaskPlanStatus = 'pass' | 'warn' | 'fail'
export type DeveloperTaskPlanIssueSeverity = 'error' | 'warning' | 'info'
export type DeveloperTaskEvidenceKind =
  | 'upstream-doc'
  | 'local-doc'
  | 'package-export'
  | 'package-readme'
  | 'curated-knowledge'
  | 'playground-demo'

export interface DeveloperTaskEvidence {
  sourcePath: string
  sourceKind: DeveloperTaskEvidenceKind
  claim: string
  confidence: DeveloperTaskConfidence
}

export interface DeveloperTaskVersionMetadata {
  requestedTargetVersion: string | null
  effectiveGraphqlGeneVersion: string | null
  workspaceGraphqlGeneRange: string | null
  workspacePluginSequelizeRange: string | null
  installedPluginSequelizeVersion: string | null
  notes: string[]
  parityWarnings: string[]
}

export interface DeveloperProjectContext {
  packageManager?: string
  runtime?: string
  language?: string
  serverStack?: string
  orm?: string
  currentGraphqlSetup?: string
  constraints?: string[]
  targetOutcome?: string
  graphqlGeneVersion?: string
}

export interface ListDeveloperTaskPatternsInput {
  query?: string
  scenario?: string
  stage?: DeveloperTaskStage
  capability?: DeveloperTaskCapability
  orm?: string
  confidence?: DeveloperTaskConfidence
}

export interface DeveloperGoalClassificationInput {
  goal: string
  project?: DeveloperProjectContext
  constraints?: string[]
  targetVersion?: string
}

export interface DeveloperTaskPlanInput {
  taskId?: string
  patternId?: string
  goal?: string
  project?: DeveloperProjectContext
  constraints?: string[]
  targetVersion?: string
}

export interface AdaptExampleToProjectInput {
  taskId?: string
  patternId?: string
  exampleId?: string
  goal?: string
  project?: DeveloperProjectContext
  targetModels?: string[]
  constraints?: string[]
  targetVersion?: string
}

export interface ValidateDeveloperTaskPlanInput {
  taskId?: string
  patternId?: string
  goal?: string
  project?: DeveloperProjectContext
  proposedSteps?: string[]
  selectedPlugin?: string
  usesPlaygroundCodeAsSource?: boolean
  usesPlaygroundRuntimeAsSource?: boolean
  includesSchemaInspection?: boolean
  includesTests?: boolean
  includesPluginDecision?: boolean
  handlesLookahead?: boolean
  handlesDirectiveRuntimeMode?: boolean
  handlesPolymorphicResolution?: boolean
}

export interface DiagnoseDeveloperIssueInput {
  taskId?: string
  patternId?: string
  symptom: string
  stage?: TroubleshootingStage
  project?: DeveloperProjectContext
  observedBehavior?: string
  expectedBehavior?: string
  selectedPlugin?: string
  schemaExcerpt?: string
  operationExcerpt?: string
  targetVersion?: string
}

export interface DeveloperTaskPlanIssue {
  severity: DeveloperTaskPlanIssueSeverity
  code: string
  message: string
  remediation?: string
}

interface DeveloperTaskSeed {
  id: DeveloperTaskId
  patternAlias?: DeveloperTaskPatternId
  relatedScenario?: 'model-to-schema' | 'query-lookahead' | 'polymorphic-blocks' | 'directive-middleware'
  stage: DeveloperTaskStage
  capabilities: DeveloperTaskCapability[]
  confidence: DeveloperTaskConfidence
  title: string
  summary: string
  developerGoal: string
  whenToUse: string[]
  requiredProjectSignals: string[]
  implementationSteps: string[]
  validationChecklist: string[]
  commonPitfalls: string[]
  sourceEvidence: DeveloperTaskEvidence[]
  versionNotes: string[]
  warnings: string[]
  orms: string[]
  docIds: string[]
  exampleIds: string[]
  recipeIds: string[]
  pluginIds: string[]
  keywords: string[]
}

interface WorkspacePackageMetadata {
  workspaceGraphqlGeneRange: string | null
  workspacePluginSequelizeRange: string | null
  installedPluginSequelizeVersion: string | null
  pluginExportsPolymorphic: boolean
}

const DOC_IDS = {
  gettingStarted: 'doc:/docs/concepts/getting-started',
  schemaDesign: 'doc:/docs/guides/schema-design',
  directives: 'doc:/docs/guides/directives',
  polymorphicBlocks: 'doc:/docs/guides/polymorphic-blocks',
  writingAPlugin: 'doc:/docs/reference/writing-a-plugin',
} as const

const EXAMPLE_IDS = {
  modelToSchema: 'example:model-to-schema:user-orders-basic',
  queryLookahead: 'example:query-lookahead:me-with-orders',
  polymorphicBlocks: 'example:polymorphic-blocks:page-blocks-basic',
  directiveMiddleware: 'example:directive-middleware:user-auth-directive',
} as const

const RECIPE_IDS = {
  sequelizeBootstrap: 'recipe:sequelize-bootstrap',
  queryLookaheadShape: 'recipe:query-lookahead-shape',
  directiveMiddlewareAuth: 'recipe:directive-middleware-auth',
  polymorphicContentBlocks: 'recipe:polymorphic-content-blocks',
  customPluginEvaluation: 'recipe:custom-plugin-evaluation',
} as const

const PLUGIN_IDS = {
  sequelize: 'plugin:sequelize',
  customPlugin: 'plugin:custom-plugin',
} as const

const WORKSPACE_METADATA = readWorkspacePackageMetadata()
const POLYMORPHIC_EXPORT_WARNING = WORKSPACE_METADATA.pluginExportsPolymorphic
  ? null
  : 'The docs describe a @Polymorphic pattern, but the installed @graphql-gene/plugin-sequelize export surface did not confirm a public "Polymorphic" export. Verify upstream/package parity before presenting it as a directly importable API.'

const DEVELOPER_TASKS: DeveloperTaskSeed[] = [
  {
    id: 'evaluate-graphql-gene-fit',
    stage: 'evaluate',
    capabilities: ['adoption', 'plugin-strategy'],
    confidence: 'high',
    title: 'Evaluate whether GraphQL Gene fits the project',
    summary: 'Decide whether GraphQL Gene should own schema generation or whether the current project architecture points elsewhere.',
    developerGoal: 'Determine whether a project should adopt GraphQL Gene before changing schema ownership boundaries.',
    whenToUse: [
      'The team is comparing GraphQL Gene with a hand-written schema builder.',
      'The project already has models and wants generator-first GraphQL adoption.',
      'The current GraphQL ownership boundary is unclear.',
    ],
    requiredProjectSignals: [
      'Current GraphQL schema ownership model',
      'ORM or model layer in use',
      'Server stack',
      'Custom resolver surface area',
    ],
    implementationSteps: [
      'Identify whether the project already has a stable model layer that can act as the GraphQL source of truth.',
      'Confirm whether the project wants generated schema ownership or manual schema authoring.',
      'Evaluate plugin fit before committing to schema migration work.',
      'Choose the first low-risk GraphQL Gene adoption milestone before touching runtime behavior.',
    ],
    validationChecklist: [
      'The team knows whether GraphQL Gene should own schema generation.',
      'The target ORM/plugin path is identified.',
      'Existing hand-written schema boundaries are explicitly acknowledged.',
    ],
    commonPitfalls: [
      'Treating GraphQL Gene as a generic schema builder instead of a model-first generator.',
      'Starting migration work before validating plugin fit.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'GraphQL Gene positions itself as executable schema generation from models.'),
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README emphasizes one source of truth, generated resolvers, and ORM/plugin adoption paths.'),
    ],
    versionNotes: [
      'Adoption decisions should be checked against the installed graphql-gene dependency range and plugin surface.',
    ],
    warnings: [
      'Do not let website playground ergonomics drive the adoption decision ahead of docs and package behavior.',
    ],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.schemaDesign, DOC_IDS.writingAPlugin],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap, RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['evaluate', 'fit', 'should we use', 'adopt', 'migration risk', 'generator-first', 'schema ownership'],
  },
  {
    id: 'choose-plugin-strategy',
    stage: 'plugin',
    capabilities: ['plugin-strategy'],
    confidence: 'high',
    title: 'Choose the GraphQL Gene plugin strategy',
    summary: 'Select the documented Sequelize path or a custom plugin evaluation path before implementation.',
    developerGoal: 'Pick the correct GraphQL Gene plugin strategy for the target ORM and model layer.',
    whenToUse: [
      'The ORM choice is known but the plugin path is not.',
      'The project is not using Sequelize.',
      'The team is unsure whether custom plugin work is justified.',
    ],
    requiredProjectSignals: [
      'ORM or persistence layer',
      'Model access patterns',
      'Unsupported capabilities that might require custom plugin work',
    ],
    implementationSteps: [
      'Confirm whether the project model layer truly matches the Sequelize plugin assumptions.',
      'If the ORM is not Sequelize, evaluate the custom plugin path before adapting examples.',
      'Keep the first implementation aligned with the chosen plugin strategy.',
    ],
    validationChecklist: [
      'The chosen plugin path matches the actual ORM.',
      'Custom plugin work is justified by explicit unsupported capabilities.',
    ],
    commonPitfalls: [
      'Forcing a non-Sequelize ORM through the Sequelize plugin path.',
      'Starting custom plugin work without studying the reference implementation.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/writing-a-plugin.md', 'The custom plugin path is positioned as the answer when the Sequelize path does not fit.'),
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README exposes a plugin system and points to the Sequelize plugin as the first-class path.'),
    ],
    versionNotes: [
      'Plugin strategy decisions should be checked against the currently installed plugin package version.',
    ],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.writingAPlugin],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap, RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['plugin', 'sequelize', 'prisma', 'typeorm', 'custom plugin', 'orm strategy'],
  },
  {
    id: 'bootstrap-sequelize-project',
    stage: 'setup',
    capabilities: ['setup', 'schema-generation'],
    confidence: 'high',
    title: 'Bootstrap GraphQL Gene in a Sequelize project',
    summary: 'Install GraphQL Gene with the Sequelize plugin and get to the first schema generation milestone.',
    developerGoal: 'Set up GraphQL Gene in a Sequelize project with the documented bootstrap flow.',
    whenToUse: [
      'The project already uses Sequelize.',
      'The developer wants the shortest path to a generated schema.',
    ],
    requiredProjectSignals: [
      'Sequelize model module locations',
      'Package manager',
      'GraphQL server entrypoint',
    ],
    implementationSteps: [
      'Install graphql-gene and @graphql-gene/plugin-sequelize.',
      'Create a canonical module that re-exports every GraphQL Gene type.',
      'Generate the schema using pluginSequelize().',
      'Attach the schema to the server only after SDL inspection passes.',
    ],
    validationChecklist: [
      'The correct packages are installed.',
      'Schema generation runs locally.',
      'The project uses the documented Sequelize plugin path.',
    ],
    commonPitfalls: [
      'Skipping the canonical type export module.',
      'Treating website example code as runtime source.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'The Getting Started doc shows the documented Sequelize bootstrap flow.'),
      evidenceCurated('packages/graphql-gene-knowledge/src/site/curated-knowledge.ts', 'The curated recipe catalog already models the Sequelize bootstrap path.'),
    ],
    versionNotes: [
      'The generated schema flow should be validated against the workspace graphql-gene dependency range.',
    ],
    warnings: [],
    orms: ['Sequelize'],
    docIds: [DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['install', 'setup', 'bootstrap', 'sequelize', 'start', 'first schema'],
  },
  {
    id: 'create-canonical-types-module',
    stage: 'schema',
    capabilities: ['schema-generation'],
    confidence: 'high',
    title: 'Create the canonical GraphQL Gene types module',
    summary: 'Re-export every model, enum, plain type, input, and alias that should participate in schema generation.',
    developerGoal: 'Build one canonical module that GraphQL Gene can consume for schema generation.',
    whenToUse: [
      'Schema generation is missing expected types.',
      'The project has models spread across several modules.',
    ],
    requiredProjectSignals: [
      'All model and GraphQL helper export locations',
      'Aliases that should be part of the schema',
    ],
    implementationSteps: [
      'Identify every model and GraphQL helper that should feed schema generation.',
      'Create one module that re-exports all intended GraphQL Gene types.',
      'Keep aliases and plain types in the same canonical export surface.',
      'Inspect SDL after changes before debugging server wiring.',
    ],
    validationChecklist: [
      'Every intended type is re-exported from one module.',
      'Aliases are exported where needed.',
      'Missing-schema debugging starts from the types module first.',
    ],
    commonPitfalls: [
      'Exporting only models and forgetting aliases or plain object types.',
      'Debugging downstream server errors before confirming type exports.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'The Getting Started flow requires a single canonical module exporting GraphQL Gene types.'),
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README shows one module re-exporting models and helper types as the schema input.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['exports', 'graphqlTypes', 'canonical module', 'missing types', 're-export'],
  },
  {
    id: 'setup-typescript-augmentation',
    stage: 'typing',
    capabilities: ['typing'],
    confidence: 'high',
    title: 'Set up GraphQL Gene TypeScript augmentation',
    summary: 'Augment GeneSchema and GeneContext so generated types and server context stay typed.',
    developerGoal: 'Type GraphQL Gene schema and context augmentation in a project-safe way.',
    whenToUse: [
      'The project wants type-safe GeneSchema or GeneContext.',
      'The developer is wiring GraphQL Yoga or another server context into GraphQL Gene types.',
    ],
    requiredProjectSignals: [
      'Type declaration file location',
      'Server context type source',
      'Canonical GraphQL Gene types module',
    ],
    implementationSteps: [
      'Create a declaration file for graphql-gene schema and context augmentation.',
      'Use GeneTypesToTypescript with the canonical types module.',
      'Extend GeneContext with the server context type only where needed.',
    ],
    validationChecklist: [
      'The declaration file resolves correctly in TypeScript.',
      'GeneSchema includes the generated types module.',
      'GeneContext matches the real server context shape.',
    ],
    commonPitfalls: [
      'Pointing GeneTypesToTypescript at the wrong module.',
      'Treating runtime context shape as implicit instead of typed.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README includes a dedicated typing and module augmentation section.'),
    ],
    versionNotes: [
      'Typing helpers should be validated against the installed graphql-gene version range.',
    ],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted],
    exampleIds: [],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['typescript', 'augmentation', 'GeneSchema', 'GeneContext', 'types', 'd.ts'],
  },
  {
    id: 'generate-executable-schema',
    patternAlias: 'model-to-schema',
    relatedScenario: 'model-to-schema',
    stage: 'schema',
    capabilities: ['schema-generation', 'schema-inspection'],
    confidence: 'high',
    title: 'Generate an executable GraphQL schema',
    summary: 'Call generateSchema with the chosen plugin path and inspect the result before attaching it to a server.',
    developerGoal: 'Turn the project model layer into an executable GraphQL schema.',
    whenToUse: [
      'The project has a canonical types module.',
      'The team wants a generated schema instead of hand-written root types.',
    ],
    requiredProjectSignals: [
      'Canonical types module path',
      'Plugin choice',
      'Server integration point',
    ],
    implementationSteps: [
      'Call generateSchema with the canonical types object and chosen plugins.',
      'Inspect schema, typeDefs, and resolvers before wiring runtime behavior.',
      'Attach the resulting schema to the target server stack once SDL checks pass.',
    ],
    validationChecklist: [
      'generateSchema runs without missing-type errors.',
      'The SDL contains the expected types and fields.',
      'The server uses the generated schema output.',
    ],
    commonPitfalls: [
      'Attaching the schema to the server before inspecting the generated output.',
      'Keeping parallel hand-written schema ownership alive by accident.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'The documented flow centers on generateSchema producing an executable schema.'),
      evidenceExport('node_modules/graphql-gene/dist/schema.d.ts', 'The public schema export surface includes schema, typeDefs, resolvers, schemaString, and schemaHtml outputs.'),
    ],
    versionNotes: [
      'Schema generation output should be validated against the target graphql-gene version before migration work expands.',
    ],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap, RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['generateSchema', 'schema', 'model-to-schema', 'sdl', 'typeDefs', 'resolvers'],
  },
  {
    id: 'inspect-generated-schema',
    stage: 'schema',
    capabilities: ['schema-inspection'],
    confidence: 'high',
    title: 'Inspect generated SDL and schema output',
    summary: 'Use schemaString, schemaHtml, or snapshots to verify generated output before runtime debugging.',
    developerGoal: 'Inspect generated schema output as a first-class validation step.',
    whenToUse: [
      'The team wants to confirm generated fields before wiring resolvers or server behavior.',
      'Schema generation appears to miss or mis-shape types.',
    ],
    requiredProjectSignals: [
      'Schema generation entrypoint',
      'Expected types or fields',
    ],
    implementationSteps: [
      'Capture schemaString or schemaHtml from generateSchema.',
      'Compare the SDL against expected types, aliases, directives, and fields.',
      'Use schema inspection before investigating downstream server errors.',
    ],
    validationChecklist: [
      'Schema inspection is part of the workflow.',
      'Expected types and fields are visible in SDL output.',
    ],
    commonPitfalls: [
      'Debugging runtime errors before inspecting SDL.',
      'Assuming missing behavior is a server issue when the type never generated.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README explicitly recommends using schemaString and schemaHtml for inspection.'),
      evidenceExport('node_modules/graphql-gene/dist/schema.d.ts', 'The schema export surface includes schemaString and schemaHtml outputs.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['inspect schema', 'schemaString', 'schemaHtml', 'snapshot', 'sdl'],
  },
  {
    id: 'configure-scalars-and-datatype-map',
    stage: 'schema',
    capabilities: ['scalars', 'schema-generation'],
    confidence: 'high',
    title: 'Configure scalars and data type mapping',
    summary: 'Wire custom scalars and confirm how GraphQL Gene maps model data types into GraphQL output types.',
    developerGoal: 'Control scalar behavior for Date, DateTime, JSON, and related generated fields.',
    whenToUse: [
      'The project uses dates, JSON, or custom scalar expectations.',
      'Generated scalar output does not match the API contract.',
    ],
    requiredProjectSignals: [
      'Model data types in use',
      'Server scalar implementation availability',
    ],
    implementationSteps: [
      'Review which generated fields depend on Date, DateTime, JSON, or custom scalar behavior.',
      'Pass scalar resolvers to generateSchema where required.',
      'Validate SDL and runtime serialization behavior after scalar wiring.',
    ],
    validationChecklist: [
      'The project provides required scalar resolvers.',
      'Generated scalar fields serialize as expected.',
    ],
    commonPitfalls: [
      'Relying on fallback String behavior without realizing it.',
      'Validating SDL only and not runtime serialization behavior.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'The Getting Started doc notes Date, DateTime, and JSON scalar handling in generateSchema.'),
      evidenceExport('node_modules/@graphql-gene/plugin-sequelize/dist/constants.d.ts', 'The Sequelize plugin export surface declares Date, DateTime, JSON scalar mappings.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize'],
    docIds: [DOC_IDS.gettingStarted],
    exampleIds: [],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['scalar', 'Date', 'DateTime', 'JSON', 'dataTypeMap'],
  },
  {
    id: 'control-field-exposure',
    stage: 'customization',
    capabilities: ['field-exposure'],
    confidence: 'high',
    title: 'Control field exposure with geneConfig',
    summary: 'Use geneConfig include, exclude, timestamps, and variable-type settings to shape the generated schema surface.',
    developerGoal: 'Decide exactly which model fields should or should not appear in generated GraphQL types.',
    whenToUse: [
      'Sensitive fields must stay out of the schema.',
      'Timestamp behavior or input/output type behavior needs adjustment.',
    ],
    requiredProjectSignals: [
      'Model fields requiring inclusion or exclusion',
      'Sensitive fields or timestamp policy',
    ],
    implementationSteps: [
      'Identify fields that must be excluded or explicitly included.',
      'Apply geneConfig include/exclude/includeTimestamps settings on the relevant models.',
      'Regenerate the schema and inspect resulting field exposure.',
    ],
    validationChecklist: [
      'Sensitive fields are absent from generated GraphQL types.',
      'Timestamp behavior matches the desired contract.',
    ],
    commonPitfalls: [
      'Assuming model fields are filtered without explicit geneConfig.',
      'Missing regex-driven include/exclude behavior when field sets are broad.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README documents geneConfig include, exclude, includeTimestamps, varType, and aliases.'),
      evidenceExport('node_modules/graphql-gene/dist/defineConfig.d.ts', 'The public geneConfig type surface exposes include, exclude, includeTimestamps, varType, and directives.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.schemaDesign],
    exampleIds: [],
    recipeIds: [],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['geneConfig', 'include', 'exclude', 'timestamps', 'field exposure', 'security'],
  },
  {
    id: 'model-auth-scopes-with-aliases',
    stage: 'customization',
    capabilities: ['aliases', 'directive'],
    confidence: 'high',
    title: 'Model auth scopes with aliases and directives',
    summary: 'Use aliases plus directives to expose different GraphQL scopes for the same underlying model.',
    developerGoal: 'Represent public and authenticated views of the same model without forking the source of truth.',
    whenToUse: [
      'One model needs multiple GraphQL visibility scopes.',
      'Auth-sensitive fields must appear only under stricter access patterns.',
    ],
    requiredProjectSignals: [
      'Models that need multiple visibility scopes',
      'Access rules for each scope',
      'Context/auth loading behavior',
    ],
    implementationSteps: [
      'Define the base model exposure and the alias-specific field scope.',
      'Attach directives to the alias or fields that need stricter runtime behavior.',
      'Export aliases from the canonical GraphQL types module.',
      'Validate SDL and runtime behavior for both scopes.',
    ],
    validationChecklist: [
      'Aliases are exported correctly.',
      'Public and authenticated fields are intentionally separated.',
      'Directive behavior matches the alias scope.',
    ],
    commonPitfalls: [
      'Creating an alias without exporting it from the canonical types module.',
      'Using directives without verifying the alias field set.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/schema-design.md', 'The schema design doc gives a public User versus AuthenticatedUser alias pattern.'),
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README documents aliases and auth-oriented directive examples.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize'],
    docIds: [DOC_IDS.schemaDesign, DOC_IDS.directives],
    exampleIds: [EXAMPLE_IDS.directiveMiddleware],
    recipeIds: [RECIPE_IDS.directiveMiddlewareAuth],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['alias', 'AuthenticatedUser', 'scope', 'auth', 'public user', 'me query'],
  },
  {
    id: 'add-generated-query-fields',
    stage: 'schema',
    capabilities: ['generated-query', 'schema-generation'],
    confidence: 'high',
    title: 'Add generated query fields with extendTypes',
    summary: 'Use extendTypes and default resolver behavior to add query fields without hand-writing the full resolution path.',
    developerGoal: 'Define GraphQL query roots that stay close to GraphQL Gene default generation behavior.',
    whenToUse: [
      'The project wants generated query roots over manual resolver wiring.',
      'Default resolver behavior should own filtering and association traversal.',
    ],
    requiredProjectSignals: [
      'Query root names and return types',
      'Associated model types',
    ],
    implementationSteps: [
      'Define Query or Mutation fields with extendTypes.',
      'Use resolver: default where GraphQL Gene should own the query path.',
      'Confirm the generated field arguments and return types in SDL.',
    ],
    validationChecklist: [
      'The generated root field exists in SDL.',
      'The root field uses the intended return type and default resolver path.',
    ],
    commonPitfalls: [
      'Hand-writing a custom resolver before validating the default resolver path.',
      'Defining root fields without checking generated arguments.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README documents extendTypes with default resolver-based query fields.'),
      evidenceExport('node_modules/graphql-gene/dist/utils/extend.d.ts', 'The public extendTypes export surface exists for Query and Mutation augmentation.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['extendTypes', 'Query', 'Mutation', 'default resolver', 'root field'],
  },
  {
    id: 'use-generated-filters-order-pagination',
    stage: 'query',
    capabilities: ['filtering', 'generated-query'],
    confidence: 'high',
    title: 'Use generated filters, order, and pagination',
    summary: 'Lean on GraphQL Gene default resolver arguments instead of hand-building filter and order input surfaces.',
    developerGoal: 'Expose generated where/order/page/perPage behavior consistently across root and association fields.',
    whenToUse: [
      'The API needs filter and sort behavior from generated resolvers.',
      'The project wants consistent pagination and operators across associations.',
    ],
    requiredProjectSignals: [
      'Target models and fields',
      'Expected filter operators',
      'Pagination expectations',
    ],
    implementationSteps: [
      'Use default resolver-backed fields for the relevant model or association.',
      'Inspect generated SDL for where, order, page, and perPage arguments.',
      'Test filtering, sorting, and pagination against real model data.',
    ],
    validationChecklist: [
      'where/order/page/perPage arguments exist where expected.',
      'Generated operators behave as expected for target fields.',
      'Hot list fields are paginated intentionally.',
    ],
    commonPitfalls: [
      'Re-creating filter inputs manually before validating generated behavior.',
      'Leaving hot list fields unbounded.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README documents default resolver filtering, operators, ordering, and pagination.'),
      evidenceExport('node_modules/graphql-gene/dist/defaultResolver.d.ts', 'The public default resolver types include page, perPage, where, and order argument shapes.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize'],
    docIds: [DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.queryLookahead],
    recipeIds: [RECIPE_IDS.queryLookaheadShape],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['filter', 'where', 'order', 'pagination', 'perPage', 'page', 'operators'],
  },
  {
    id: 'optimize-lookahead-loading',
    patternAlias: 'query-lookahead',
    relatedScenario: 'query-lookahead',
    stage: 'query',
    capabilities: ['lookahead', 'debugging'],
    confidence: 'high',
    title: 'Optimize lookahead-driven loading',
    summary: 'Keep nested query behavior aligned with GraphQL Gene and plugin lookahead expectations.',
    developerGoal: 'Avoid N+1 behavior and unexpected includes by staying close to default lookahead-aware resolution.',
    whenToUse: [
      'Nested association loading is slow or surprising.',
      'The project has custom resolvers that may bypass default includes.',
    ],
    requiredProjectSignals: [
      'Hot nested query shape',
      'Associations involved',
      'SQL/include logging availability',
      'Custom resolver surface area',
    ],
    implementationSteps: [
      'Inspect the selected GraphQL fields for the hot nested query.',
      'Compare the selected fields with actual include or SQL behavior.',
      'Prefer the default resolver path until lookahead behavior is understood.',
      'Only customize the resolver path after preserving or deliberately replacing lookahead behavior.',
    ],
    validationChecklist: [
      'Selected fields correspond to loaded associations.',
      'SQL/include behavior changes when nested selections change.',
      'Custom resolvers do not silently bypass lookahead.',
    ],
    commonPitfalls: [
      'Copying website demo SQL assumptions into project code.',
      'Customizing resolvers before validating generated behavior.',
      'Debugging SQL without the GraphQL selection set beside it.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/schema-design.md', 'The schema design doc explains the default resolver and lookahead-driven include path.'),
      evidenceExport('node_modules/@graphql-gene/plugin-sequelize/dist/utils/public.d.ts', 'The Sequelize plugin exports getQueryInclude and getQueryIncludeOf helpers for lookahead-driven loading.'),
    ],
    versionNotes: [
      'Lookahead behavior should be validated against the installed plugin export surface and runtime behavior.',
    ],
    warnings: [],
    orms: ['Sequelize'],
    docIds: [DOC_IDS.schemaDesign, DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.queryLookahead],
    recipeIds: [RECIPE_IDS.queryLookaheadShape],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['lookahead', 'n+1', 'include', 'sql', 'join', 'query performance'],
  },
  {
    id: 'add-custom-query-or-mutation',
    stage: 'customization',
    capabilities: ['mutation', 'generated-query'],
    confidence: 'high',
    title: 'Add custom queries or mutations',
    summary: 'Define typed custom fields where the default generation path is not enough.',
    developerGoal: 'Add custom Query or Mutation fields without losing GraphQL Gene typing and schema ownership clarity.',
    whenToUse: [
      'The project needs business logic beyond the default resolver path.',
      'A mutation should return a custom shape or perform side effects.',
    ],
    requiredProjectSignals: [
      'Field name',
      'Argument shape',
      'Return type',
      'Business logic boundary',
    ],
    implementationSteps: [
      'Define the field with explicit args and returnType.',
      'Keep the return type aligned with GraphQL Gene types or plain helper types.',
      'Add runtime tests for the custom logic path.',
    ],
    validationChecklist: [
      'Argument types and return type are explicit.',
      'The custom field appears in SDL.',
      'The runtime logic is tested.',
    ],
    commonPitfalls: [
      'Adding custom logic when the default resolver path already covers the use case.',
      'Returning shapes that do not match the declared GraphQL type.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README includes a custom mutation example with typed args and return types.'),
      evidenceExport('node_modules/graphql-gene/dist/defineConfig.d.ts', 'The public field config types model custom args, resolver, and returnType behavior.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.schemaDesign],
    exampleIds: [],
    recipeIds: [],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['custom mutation', 'custom query', 'args', 'returnType', 'business logic'],
  },
  {
    id: 'design-cache-friendly-mutations',
    stage: 'customization',
    capabilities: ['mutation'],
    confidence: 'high',
    title: 'Design cache-friendly mutations',
    summary: 'Return modified objects with stable identity so normalized GraphQL clients can merge updates predictably.',
    developerGoal: 'Shape mutation results so GraphQL clients can update cache without redundant fetches.',
    whenToUse: [
      'The project has Apollo Client, urql, Relay, or another normalized cache.',
      'Mutations update persisted entities.',
    ],
    requiredProjectSignals: [
      'Mutation return types',
      'Client cache expectations',
    ],
    implementationSteps: [
      'Return modified entity objects where possible instead of opaque success flags only.',
      'Ensure id and __typename can be recovered by clients.',
      'Validate mutation result shapes against the client cache strategy.',
    ],
    validationChecklist: [
      'Mutation payloads include stable identity where needed.',
      'Client cache updates do not require avoidable refetches.',
    ],
    commonPitfalls: [
      'Returning status-only payloads for entity-changing mutations.',
      'Ignoring client cache behavior while designing mutation output.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/schema-design.md', 'The schema design doc recommends returning modified objects for cache-friendly mutation behavior.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.schemaDesign],
    exampleIds: [],
    recipeIds: [],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['mutation payload', 'cache', 'id', '__typename', 'apollo client', 'urql', 'relay'],
  },
  {
    id: 'attach-directive-middleware',
    patternAlias: 'directive-middleware',
    relatedScenario: 'directive-middleware',
    stage: 'directive',
    capabilities: ['directive'],
    confidence: 'high',
    title: 'Attach runtime behavior with directives',
    summary: 'Use directives to keep auth, validation, and middleware behavior near generated types and fields.',
    developerGoal: 'Add runtime middleware to GraphQL Gene types or fields with clear SDL expectations.',
    whenToUse: [
      'Auth or middleware belongs at a type or field boundary.',
      'The project wants reusable directive factories.',
    ],
    requiredProjectSignals: [
      'Target type or field',
      'Directive handler behavior',
      'Context shape',
    ],
    implementationSteps: [
      'Define the directive handler around the resolver lifecycle.',
      'Attach the directive at the narrowest boundary that owns the behavior.',
      'Validate runtime behavior separately from SDL visibility.',
    ],
    validationChecklist: [
      'Directive placement is intentional.',
      'Runtime tests prove the middleware behavior runs.',
      'The team knows whether SDL should show the directive.',
    ],
    commonPitfalls: [
      'Testing SDL output without testing runtime behavior.',
      'Attaching middleware too broadly.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/directives.md', 'The directives guide frames Gene directives as resolver middleware.'),
      evidenceExport('node_modules/graphql-gene/dist/defineConfig.d.ts', 'The public directive config type surface exposes name, args, handler, filter, and resolve semantics.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.directives, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.directiveMiddleware],
    recipeIds: [RECIPE_IDS.directiveMiddlewareAuth],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['directive', 'middleware', 'auth', 'handler', 'runtime-only', 'geneConfig directives'],
  },
  {
    id: 'decide-directive-sdl-visibility',
    stage: 'directive',
    capabilities: ['directive'],
    confidence: 'high',
    title: 'Decide directive SDL visibility',
    summary: 'Distinguish runtime-only directives from SDL-visible directives so testing and developer expectations stay aligned.',
    developerGoal: 'Make directive SDL visibility explicit and testable.',
    whenToUse: [
      'A directive seems to work at runtime but is missing from SDL.',
      'The team needs to choose between a named or anonymous directive pattern.',
    ],
    requiredProjectSignals: [
      'Whether SDL visibility is required',
      'Directive name policy',
    ],
    implementationSteps: [
      'Decide whether the directive should have a printed name.',
      'Use runtime tests and SDL snapshots to confirm the chosen mode.',
      'Document the distinction for the team before debugging further.',
    ],
    validationChecklist: [
      'The directive visibility mode is explicit.',
      'Tests cover both runtime behavior and SDL expectations.',
    ],
    commonPitfalls: [
      'Assuming every working directive must appear in SDL.',
      'Confusing runtime-only directives with broken schema generation.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/directives.md', 'The directives guide explicitly explains named versus empty-name directive behavior.'),
      evidenceCurated('packages/graphql-gene-knowledge/src/site/curated-knowledge.ts', 'The troubleshooting catalog already models directive-not-printed-in-sdl as a first-class issue.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.directives],
    exampleIds: [EXAMPLE_IDS.directiveMiddleware],
    recipeIds: [RECIPE_IDS.directiveMiddlewareAuth],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['directive missing in sdl', 'anonymous directive', 'named directive', 'runtime-only directive'],
  },
  {
    id: 'model-polymorphic-content-blocks',
    patternAlias: 'polymorphic-blocks',
    relatedScenario: 'polymorphic-blocks',
    stage: 'query',
    capabilities: ['polymorphism'],
    confidence: POLYMORPHIC_EXPORT_WARNING ? 'medium' : 'high',
    title: 'Model polymorphic content blocks',
    summary: 'Represent ordered heterogeneous content blocks with fragment-friendly GraphQL access while keeping the model layer authoritative.',
    developerGoal: 'Expose polymorphic content blocks without abandoning model-native schema generation.',
    whenToUse: [
      'One ordered list contains multiple concrete block types.',
      'Clients should query block-specific fields with inline fragments.',
    ],
    requiredProjectSignals: [
      'Hub or parent model for ordering',
      'Concrete block models',
      'Member type resolution strategy',
    ],
    implementationSteps: [
      'Model the hub row that owns ordering or grouping.',
      'List the concrete block models and confirm how member types resolve.',
      'Validate __typename and inline-fragment behavior with tests.',
      'Verify upstream/package parity before claiming a directly importable polymorphic API surface.',
    ],
    validationChecklist: [
      'Member types are mapped explicitly.',
      'Tests cover __typename and inline fragments.',
      'Ordering survives runtime resolution.',
      'Package export parity is checked before implementation assumptions are locked in.',
    ],
    commonPitfalls: [
      'Overclaiming polymorphism as the main differentiator instead of model-native generation.',
      'Skipping member-type resolution tests.',
      'Assuming docs guarantee the installed package export surface.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/polymorphic-blocks.md', 'The docs describe a hub-pattern polymorphic content block workflow.'),
      evidenceDoc('content/graphql-gene/docs/directives.md', 'The directives guide links the polymorphic pattern to runtime rewriting behavior.'),
      evidenceExport('node_modules/@graphql-gene/plugin-sequelize/dist/index.d.ts', 'The installed plugin export surface should be checked before claiming public polymorphic imports.'),
    ],
    versionNotes: [
      'This task is more sensitive than others to docs-versus-package parity.',
    ],
    warnings: POLYMORPHIC_EXPORT_WARNING ? [POLYMORPHIC_EXPORT_WARNING] : [],
    orms: ['Sequelize'],
    docIds: [DOC_IDS.polymorphicBlocks, DOC_IDS.directives, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.polymorphicBlocks],
    recipeIds: [RECIPE_IDS.polymorphicContentBlocks],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['polymorphic', 'blocks', 'cms', 'inline fragments', '__typename', 'heterogeneous list'],
  },
  {
    id: 'write-custom-plugin',
    stage: 'plugin',
    capabilities: ['plugin-authoring'],
    confidence: 'high',
    title: 'Write a custom GraphQL Gene plugin',
    summary: 'Study the Sequelize reference implementation and build only the minimum plugin surface the project actually needs.',
    developerGoal: 'Author a custom plugin for an ORM or backend that does not fit the Sequelize path.',
    whenToUse: [
      'The target ORM is not Sequelize.',
      'The project needs plugin behavior the documented Sequelize path cannot provide.',
    ],
    requiredProjectSignals: [
      'Target ORM or backend',
      'Minimum required plugin capabilities',
      'Reference package behavior to imitate',
    ],
    implementationSteps: [
      'Study the Sequelize plugin as the reference implementation.',
      'Define the minimum plugin behavior the project actually needs.',
      'Prototype a narrow plugin surface before extending behavior.',
      'Validate generated types and runtime behavior with tests before broader adoption.',
    ],
    validationChecklist: [
      'The custom plugin scope is explicitly narrow.',
      'The team can explain why the Sequelize path was insufficient.',
      'Plugin behavior is backed by tests.',
    ],
    commonPitfalls: [
      'Building a broad abstraction before validating the minimum missing capability.',
      'Skipping the reference implementation study step.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/writing-a-plugin.md', 'The plugin guide explicitly points developers to the Sequelize plugin as the reference implementation.'),
      evidenceExport('node_modules/graphql-gene/dist/types/plugin.d.ts', 'The public GraphQL Gene plugin surface is typed and intended for extension.'),
    ],
    versionNotes: [
      'Plugin authoring should be re-validated whenever the graphql-gene plugin type surface changes.',
    ],
    warnings: [],
    orms: ['Custom ORM'],
    docIds: [DOC_IDS.writingAPlugin, DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.customPlugin],
    keywords: ['write plugin', 'custom plugin', 'prisma', 'typeorm', 'plugin api', 'reference implementation'],
  },
  {
    id: 'debug-schema-generation',
    stage: 'debug',
    capabilities: ['debugging', 'schema-generation'],
    confidence: 'high',
    title: 'Debug generated schema issues',
    summary: 'Diagnose missing types, wrong fields, or schema drift by starting from exports, plugin fit, and SDL inspection.',
    developerGoal: 'Resolve generated schema issues without guessing past the source of truth.',
    whenToUse: [
      'Expected types or fields are missing from SDL.',
      'Schema generation seems to ignore parts of the model graph.',
    ],
    requiredProjectSignals: [
      'Observed missing types or fields',
      'Canonical types module',
      'Plugin path in use',
    ],
    implementationSteps: [
      'Inspect the canonical types module before debugging server wiring.',
      'Inspect generated SDL before runtime behavior.',
      'Re-check plugin fit if the model graph is not generating as expected.',
    ],
    validationChecklist: [
      'The missing behavior is reproduced at the schema layer.',
      'Types export and plugin assumptions were checked first.',
    ],
    commonPitfalls: [
      'Blaming the server layer before confirming SDL.',
      'Debugging missing schema output without re-checking exports.',
    ],
    sourceEvidence: [
      evidenceCurated('packages/graphql-gene-knowledge/src/site/curated-knowledge.ts', 'The troubleshooting catalog explicitly models missing-types and wrong-plugin-path schema issues.'),
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'The documented setup path starts from canonical type exports and schema generation.'),
    ],
    versionNotes: [],
    warnings: [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.writingAPlugin],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap, RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['missing schema', 'missing types', 'schema drift', 'sdl wrong', 'schema debug'],
  },
  {
    id: 'debug-runtime-resolution',
    stage: 'debug',
    capabilities: ['debugging', 'lookahead', 'directive'],
    confidence: 'high',
    title: 'Debug runtime resolution behavior',
    summary: 'Diagnose runtime issues by separating lookahead, directive behavior, plugin fit, and adaptation boundaries.',
    developerGoal: 'Resolve runtime behavior problems without confusing SDL generation with execution behavior.',
    whenToUse: [
      'A directive works differently than expected at runtime.',
      'The include graph or nested loading path looks wrong.',
      'The team is unsure whether a problem is canonical or website-demo-specific.',
    ],
    requiredProjectSignals: [
      'Runtime symptom',
      'Stage of the issue',
      'Observed query or directive behavior',
    ],
    implementationSteps: [
      'Identify whether the issue is query, directive, plugin, or adaptation related.',
      'Prefer canonical docs and troubleshooting entries over adapted website demo behavior.',
      'Confirm whether the issue reproduces at the canonical runtime boundary or only in the adapted demo.',
    ],
    validationChecklist: [
      'The issue is tied to a specific runtime layer.',
      'Canonical and adapted behaviors are not being conflated.',
    ],
    commonPitfalls: [
      'Using website demo behavior as the final truth source.',
      'Conflating missing SDL with missing runtime middleware.',
    ],
    sourceEvidence: [
      evidenceCurated('packages/graphql-gene-knowledge/src/site/curated-knowledge.ts', 'The troubleshooting catalog includes directive, lookahead, and playground-parity runtime issues.'),
      evidenceDoc('content/graphql-gene/docs/directives.md', 'The directives guide separates runtime behavior from SDL output.'),
    ],
    versionNotes: [],
    warnings: [
      'When website demo behavior conflicts with source-backed guidance, canonical docs and package behavior should win.',
    ],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.schemaDesign, DOC_IDS.directives],
    exampleIds: [EXAMPLE_IDS.queryLookahead, EXAMPLE_IDS.directiveMiddleware, EXAMPLE_IDS.polymorphicBlocks],
    recipeIds: [RECIPE_IDS.queryLookaheadShape, RECIPE_IDS.directiveMiddlewareAuth, RECIPE_IDS.polymorphicContentBlocks],
    pluginIds: [PLUGIN_IDS.sequelize],
    keywords: ['runtime issue', 'directive issue', 'lookahead issue', 'query issue', 'playground parity'],
  },
  {
    id: 'upgrade-version-and-parity-check',
    stage: 'upgrade',
    capabilities: ['upgrade'],
    confidence: 'medium',
    title: 'Check versions and parity before upgrades',
    summary: 'Review installed versions, docs assumptions, and package export parity before changing the GraphQL Gene integration surface.',
    developerGoal: 'Reduce upgrade and documentation-parity risk before implementation changes.',
    whenToUse: [
      'The team is upgrading graphql-gene or a plugin.',
      'Docs and package behavior seem inconsistent.',
    ],
    requiredProjectSignals: [
      'Current dependency versions',
      'Expected behavior from docs',
      'Target upgrade or migration goal',
    ],
    implementationSteps: [
      'Record current dependency ranges and installed package versions.',
      'Check whether docs assumptions match the installed package export surface.',
      'Validate the riskiest capabilities with targeted tests before upgrading further.',
    ],
    validationChecklist: [
      'Dependency versions are recorded.',
      'Package export parity was checked for risky capabilities.',
      'Targeted tests protect the highest-risk behaviors.',
    ],
    commonPitfalls: [
      'Upgrading while assuming docs always match the installed package surface.',
      'Skipping parity-sensitive checks for advanced capabilities.',
    ],
    sourceEvidence: [
      evidenceLocal('packages/graphql-gene-knowledge/src/developer/task-patterns.ts', 'Developer task planning can inspect local dependency ranges and export-parity-sensitive capabilities.'),
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README is a key instructional source but still needs package-version context.'),
    ],
    versionNotes: [
      'This task should always return the workspace dependency range and installed plugin version when available.',
    ],
    warnings: POLYMORPHIC_EXPORT_WARNING ? [POLYMORPHIC_EXPORT_WARNING] : [],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.writingAPlugin],
    exampleIds: [],
    recipeIds: [RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['upgrade', 'version', 'parity', 'docs mismatch', 'package export', 'migration risk'],
  },
  {
    id: 'combine-with-graphql-codegen',
    stage: 'integration',
    capabilities: ['codegen'],
    confidence: 'medium',
    title: 'Combine GraphQL Gene with GraphQL Code Generator',
    summary: 'Use generated schema output as the input for downstream typed client or server code generation workflows.',
    developerGoal: 'Feed GraphQL Gene-generated schema output into a broader GraphQL tooling pipeline.',
    whenToUse: [
      'The project wants typed client operations from the generated schema.',
      'GraphQL Code Generator is already part of the stack.',
    ],
    requiredProjectSignals: [
      'Schema output artifact path',
      'GraphQL Code Generator workflow expectations',
    ],
    implementationSteps: [
      'Generate stable SDL output from GraphQL Gene.',
      'Use the generated schema artifact as the codegen input.',
      'Validate codegen output after schema changes.',
    ],
    validationChecklist: [
      'Codegen consumes generated schema output rather than hand-maintained SDL.',
      'Codegen artifacts update when schema changes.',
    ],
    commonPitfalls: [
      'Treating GraphQL Code Generator as a replacement for GraphQL Gene instead of a downstream consumer.',
      'Using stale SDL snapshots as codegen input.',
    ],
    sourceEvidence: [
      evidenceReadme('node_modules/graphql-gene/README.md', 'The upstream README exposes schemaString and schemaHtml outputs that can feed downstream tooling.'),
    ],
    versionNotes: [
      'This is an adjacent workflow; validate it against the generated schema artifact rather than assuming first-class GraphQL Gene support.',
    ],
    warnings: [
      'GraphQL Code Generator integration is a downstream workflow, not a first-class GraphQL Gene feature described in the canonical docs set.',
    ],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['codegen', 'graphql-code-generator', 'client types', 'schema artifact'],
  },
  {
    id: 'migrate-from-handwritten-schema',
    stage: 'migration',
    capabilities: ['migration', 'adoption'],
    confidence: 'medium',
    title: 'Migrate from a hand-written schema',
    summary: 'Move from manual GraphQL schema ownership toward model-first generation without losing control of high-risk runtime boundaries.',
    developerGoal: 'Adopt GraphQL Gene incrementally in a project that already owns a hand-written schema or resolver layer.',
    whenToUse: [
      'The project already has a hand-written GraphQL schema.',
      'The team wants to move toward generator-first ownership incrementally.',
    ],
    requiredProjectSignals: [
      'Current hand-written schema scope',
      'Resolver customization hotspots',
      'Low-risk pilot surface',
    ],
    implementationSteps: [
      'Identify the smallest low-risk model surface to migrate first.',
      'Decide which parts of the current schema should remain hand-written temporarily.',
      'Validate schema generation and runtime behavior on the pilot surface before wider migration.',
    ],
    validationChecklist: [
      'The first migration surface is intentionally narrow.',
      'Parallel schema ownership boundaries are explicit.',
      'The team can explain which runtime layers remain hand-written and why.',
    ],
    commonPitfalls: [
      'Attempting a full-schema rewrite before validating the generated model-first path.',
      'Allowing hidden parallel ownership boundaries to survive indefinitely.',
    ],
    sourceEvidence: [
      evidenceDoc('content/graphql-gene/docs/getting-started.md', 'The documented setup path assumes generated schema ownership from a canonical types module.'),
      evidenceDoc('content/graphql-gene/docs/schema-design.md', 'The schema design guide gives patterns that help preserve intentional schema boundaries while migrating.'),
    ],
    versionNotes: [
      'Migration work should pin expected GraphQL Gene behavior to the target dependency range.',
    ],
    warnings: [
      'Do not treat the website playground as a migration template for a production handwritten schema.',
    ],
    orms: ['Sequelize', 'Custom ORM'],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.schemaDesign, DOC_IDS.writingAPlugin],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap, RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
    keywords: ['migrate', 'handwritten schema', 'manual resolvers', 'incremental adoption'],
  },
]

export function listDeveloperTaskPatterns(
  catalog: KnowledgeCatalog,
  options: ListDeveloperTaskPatternsInput = {},
) {
  const query = normalize(options.query ?? '')
  const normalizedOrm = normalize(options.orm ?? '')
  const patterns = DEVELOPER_TASKS.filter((task) => {
    if (options.scenario && task.relatedScenario !== options.scenario && task.patternAlias !== options.scenario && task.id !== options.scenario) {
      return false
    }

    if (options.stage && task.stage !== options.stage) {
      return false
    }

    if (options.capability && !task.capabilities.includes(options.capability)) {
      return false
    }

    if (options.confidence && task.confidence !== options.confidence) {
      return false
    }

    if (normalizedOrm && !task.orms.some(orm => normalize(orm).includes(normalizedOrm) || normalizedOrm.includes(normalize(orm)))) {
      return false
    }

    if (!query) {
      return true
    }

    return normalize([
      task.id,
      task.patternAlias,
      task.title,
      task.summary,
      task.developerGoal,
      task.stage,
      ...task.capabilities,
      ...task.whenToUse,
      ...task.commonPitfalls,
      ...task.keywords,
    ].filter(Boolean).join(' ')).includes(query)
  })

  return {
    count: patterns.length,
    filters: {
      query: options.query ?? null,
      scenario: options.scenario ?? null,
      stage: options.stage ?? null,
      capability: options.capability ?? null,
      orm: options.orm ?? null,
      confidence: options.confidence ?? null,
    },
    patterns: patterns.map(task => serializeTask(catalog, task, {})),
  }
}

export function classifyDeveloperGoal(
  catalog: KnowledgeCatalog,
  input: DeveloperGoalClassificationInput,
) {
  const project = input.project ?? {}
  const constraints = uniqueStrings([...(input.constraints ?? []), ...(project.constraints ?? [])])
  const ranked = DEVELOPER_TASKS
    .map(task => ({
      task,
      score: scoreTask(task, input.goal, project, constraints),
    }))
    .filter(entry => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)

  const selected = ranked.length
    ? ranked
    : [{ task: fallbackTaskForGoal(input.goal), score: 1 }]

  const topTask = selected[0].task
  const versionMetadata = buildVersionMetadata(topTask, project, input.targetVersion)

  return {
    goal: input.goal,
    projectContext: serializeProject(project),
    targetVersion: input.targetVersion ?? project.graphqlGeneVersion ?? null,
    rankedTasks: selected.map(({ task, score }) => ({
      taskId: task.id,
      patternId: task.patternAlias ?? task.relatedScenario ?? task.id,
      title: task.title,
      summary: task.summary,
      stage: task.stage,
      capabilities: task.capabilities,
      confidence: task.confidence,
      relatedScenario: task.relatedScenario ?? null,
      score,
      rationale: buildClassificationRationale(task, project, constraints),
      warnings: dedupeStrings([...task.warnings, ...versionMetadata.parityWarnings]),
    })),
    missingContextQuestions: buildMissingContextQuestions(topTask, project),
    recommendedNextTool: 'plan_developer_task',
    versionMetadata,
  }
}

export function planDeveloperTask(
  catalog: KnowledgeCatalog,
  input: DeveloperTaskPlanInput,
) {
  const task = resolveTask(input.taskId ?? input.patternId, input.goal)
  const project = input.project ?? {}
  const constraints = uniqueStrings([...(input.constraints ?? []), ...(project.constraints ?? [])])
  const pluginStrategy = choosePluginStrategy(project)
  const versionMetadata = buildVersionMetadata(task, project, input.targetVersion)

  return {
    taskId: task.id,
    patternId: task.patternAlias ?? task.relatedScenario ?? task.id,
    title: task.title,
    summary: task.summary,
    stage: task.stage,
    capabilities: task.capabilities,
    confidence: task.confidence,
    goal: input.goal ?? project.targetOutcome ?? task.developerGoal,
    targetVersion: input.targetVersion ?? project.graphqlGeneVersion ?? null,
    relatedScenario: task.relatedScenario ?? null,
    projectContext: serializeProject(project),
    pluginStrategy,
    fit: buildFitSummary(task, project, pluginStrategy),
    steps: buildDeveloperTaskSteps(task, project, pluginStrategy, constraints),
    validationChecklist: task.validationChecklist,
    risks: buildDeveloperTaskRisks(task, project, pluginStrategy),
    sourceEvidence: task.sourceEvidence,
    sourceCounts: countEvidenceKinds(task.sourceEvidence),
    versionMetadata,
    warnings: dedupeStrings([...task.warnings, ...versionMetadata.parityWarnings]),
    docs: findDocs(catalog, task.docIds),
    examples: findExamples(catalog, task.exampleIds),
    recipes: findRecipes(catalog, task.recipeIds),
    plugins: findPlugins(catalog, pluginStrategy.recommendedPluginIds.length ? pluginStrategy.recommendedPluginIds : task.pluginIds),
    agentInstructions: [
      'Use the host coding agent to inspect local files and summarize project context before applying this plan.',
      'Treat website playground examples as conceptual demonstrations, not as the implementation source for the developer project.',
      'Prefer canonical docs, recipes, package exports, and package behavior when example behavior and project constraints differ.',
    ],
  }
}

export function adaptExampleToProject(
  catalog: KnowledgeCatalog,
  input: AdaptExampleToProjectInput,
) {
  const task = resolveTask(input.taskId ?? input.patternId, input.goal)
  const project = input.project ?? {}
  const targetModels = input.targetModels ?? inferTargetModels(task)
  const example = resolveExample(catalog, task, input.exampleId)
  const versionMetadata = buildVersionMetadata(task, project, input.targetVersion)

  return {
    taskId: task.id,
    patternId: task.patternAlias ?? task.relatedScenario ?? task.id,
    exampleId: example?.id ?? null,
    exampleTitle: example?.title ?? null,
    targetVersion: input.targetVersion ?? project.graphqlGeneVersion ?? null,
    relatedScenario: task.relatedScenario ?? null,
    projectContext: serializeProject(project),
    sourcePolicy: {
      usePlaygroundAs: 'conceptual-reference',
      doNotUsePlaygroundAs: 'copy-paste runtime source',
      preferredTruthSource: 'canonical GraphQL Gene docs, recipes, package exports, and upstream package behavior',
    },
    conceptMapping: buildConceptMapping(task, targetModels),
    adaptationSteps: buildAdaptationSteps(task, project, targetModels),
    validationChecklist: task.validationChecklist,
    sourceEvidence: task.sourceEvidence,
    versionMetadata,
    docs: findDocs(catalog, task.docIds),
    examples: example ? [mapExample(example)] : findExamples(catalog, task.exampleIds),
    recipes: findRecipes(catalog, task.recipeIds),
    warnings: dedupeStrings([...buildAdaptationWarnings(task, project), ...task.warnings, ...versionMetadata.parityWarnings]),
  }
}

export function validateDeveloperTaskPlan(
  catalog: KnowledgeCatalog,
  input: ValidateDeveloperTaskPlanInput,
) {
  const task = resolveTask(input.taskId ?? input.patternId, input.goal)
  const project = input.project ?? {}
  const issues: DeveloperTaskPlanIssue[] = []

  if (input.usesPlaygroundRuntimeAsSource) {
    issues.push({
      severity: 'error',
      code: 'PLAYGROUND_RUNTIME_USED_AS_SOURCE',
      message: 'The plan treats the website playground runtime as the developer project implementation source.',
      remediation: 'Use playground scenarios as conceptual examples and rely on canonical docs, recipes, package exports, and package behavior for implementation.',
    })
  }

  if (input.usesPlaygroundCodeAsSource) {
    issues.push({
      severity: 'warning',
      code: 'PLAYGROUND_CODE_COPY_RISK',
      message: 'The plan appears to copy website demo code into the developer project.',
      remediation: 'Adapt the task to the project model layer and server stack instead of copying demo implementation details.',
    })
  }

  if (input.includesPluginDecision === false || !input.selectedPlugin) {
    issues.push({
      severity: 'warning',
      code: 'PLUGIN_DECISION_MISSING',
      message: 'The plan does not clearly choose the Sequelize plugin path or a custom plugin path.',
      remediation: 'Select the plugin strategy before changing schema generation code.',
    })
  }

  if (input.includesSchemaInspection === false) {
    issues.push({
      severity: 'warning',
      code: 'SCHEMA_INSPECTION_MISSING',
      message: 'The plan does not include generated SDL/schema inspection.',
      remediation: 'Inspect generated SDL before attaching or expanding runtime behavior.',
    })
  }

  if (input.includesTests === false) {
    issues.push({
      severity: 'warning',
      code: 'TESTS_MISSING',
      message: 'The plan does not include validation or regression tests.',
      remediation: 'Add smoke tests, schema checks, or query/runtime tests matching the selected task.',
    })
  }

  if (task.id === 'optimize-lookahead-loading' && input.handlesLookahead === false) {
    issues.push({
      severity: 'error',
      code: 'LOOKAHEAD_NOT_HANDLED',
      message: 'The plan targets lookahead optimization but does not validate selected-field-driven loading.',
      remediation: 'Add SQL/include graph checks or equivalent resolver-path validation.',
    })
  }

  if ((task.id === 'attach-directive-middleware' || task.id === 'decide-directive-sdl-visibility') && input.handlesDirectiveRuntimeMode === false) {
    issues.push({
      severity: 'error',
      code: 'DIRECTIVE_RUNTIME_MODE_NOT_HANDLED',
      message: 'The plan targets directive middleware but does not distinguish runtime-only behavior from SDL-visible directives.',
      remediation: 'Decide and test whether the directive should print into SDL or remain runtime-only.',
    })
  }

  if (task.id === 'model-polymorphic-content-blocks' && input.handlesPolymorphicResolution === false) {
    issues.push({
      severity: 'error',
      code: 'POLYMORPHIC_RESOLUTION_NOT_HANDLED',
      message: 'The plan targets polymorphic blocks but does not validate member type resolution.',
      remediation: 'Add __typename and inline fragment tests for each concrete block type and verify package export parity before locking implementation assumptions.',
    })
  }

  return {
    taskId: task.id,
    patternId: task.patternAlias ?? task.relatedScenario ?? task.id,
    status: summarizeIssues(issues),
    issueCount: issues.length,
    issues,
    canonicalChecks: task.validationChecklist,
    sourceEvidence: task.sourceEvidence,
    versionMetadata: buildVersionMetadata(task, project, undefined),
    warnings: task.warnings,
    docs: findDocs(catalog, task.docIds),
    recipes: findRecipes(catalog, task.recipeIds),
    projectContext: serializeProject(project),
  }
}

export function diagnoseDeveloperIssue(
  catalog: KnowledgeCatalog,
  input: DiagnoseDeveloperIssueInput,
) {
  const task = resolveTask(input.taskId ?? input.patternId, input.symptom)
  const project = input.project ?? {}
  const troubleshooting = selectTroubleshooting(catalog, task, input)
  const docs = task.docIds.length
    ? findDocs(catalog, task.docIds)
    : findDocs(catalog, troubleshooting.flatMap(issue => issue.recommendedDocIds))
  const recipes = task.recipeIds.length
    ? findRecipes(catalog, task.recipeIds)
    : findRecipes(catalog, troubleshooting.flatMap(issue => issue.recommendedRecipeIds))
  const versionMetadata = buildVersionMetadata(task, project, input.targetVersion)
  const likelyCauses = dedupeStrings([
    ...troubleshooting.flatMap(issue => issue.likelyCauses),
    ...buildFallbackLikelyCauses(input.stage, task),
  ])
  const recommendedChecks = dedupeStrings([
    ...troubleshooting.flatMap(issue => issue.recommendedChecks),
    ...buildFallbackRecommendedChecks(input.stage, task),
  ])

  return {
    taskId: task.id,
    patternId: task.patternAlias ?? task.relatedScenario ?? task.id,
    diagnosisArea: inferDiagnosisArea(task, input.stage),
    symptom: input.symptom,
    stage: input.stage ?? null,
    projectContext: serializeProject(project),
    summary: `The strongest task-aware diagnosis path is "${task.title}". Start from canonical guidance before trusting adapted runtime demos.`,
    likelyCauses,
    recommendedChecks,
    warnings: dedupeStrings([...task.warnings, ...versionMetadata.parityWarnings]),
    versionMetadata,
    sourceEvidence: task.sourceEvidence,
    relatedTasks: relatedTasksForDiagnosis(task).map(relatedTask => ({
      taskId: relatedTask.id,
      patternId: relatedTask.patternAlias ?? relatedTask.relatedScenario ?? relatedTask.id,
      title: relatedTask.title,
      stage: relatedTask.stage,
    })),
    docs,
    recipes,
    troubleshooting: troubleshooting.map(mapTroubleshooting),
    nextTool: 'plan_developer_task',
  }
}

export function buildDeveloperTaskOverviewResource(catalog: KnowledgeCatalog) {
  const tasks = DEVELOPER_TASKS.map(task => serializeTask(catalog, task, {}))
  return {
    count: tasks.length,
    byStage: countBy(tasks.map(task => task.stage)),
    byConfidence: countBy(tasks.map(task => task.confidence)),
    parityWarningCount: tasks.filter(task => task.warnings.length > 0).length,
    tasks,
  }
}

export function readDeveloperTaskResource(
  catalog: KnowledgeCatalog,
  taskId: string,
) {
  const task = resolveTask(taskId, taskId)
  return serializeTask(catalog, task, {})
}

function serializeTask(
  catalog: KnowledgeCatalog,
  task: DeveloperTaskSeed,
  options: { project?: DeveloperProjectContext, targetVersion?: string },
) {
  const versionMetadata = buildVersionMetadata(task, options.project ?? {}, options.targetVersion)

  return {
    taskId: task.id,
    patternId: task.patternAlias ?? task.relatedScenario ?? task.id,
    relatedScenario: task.relatedScenario ?? null,
    stage: task.stage,
    capabilities: task.capabilities,
    confidence: task.confidence,
    title: task.title,
    summary: task.summary,
    developerGoal: task.developerGoal,
    whenToUse: task.whenToUse,
    requiredProjectSignals: task.requiredProjectSignals,
    validationChecklist: task.validationChecklist,
    commonPitfalls: task.commonPitfalls,
    orms: task.orms,
    sourceEvidence: task.sourceEvidence,
    sourceCounts: countEvidenceKinds(task.sourceEvidence),
    versionNotes: task.versionNotes,
    versionMetadata,
    warnings: dedupeStrings([...task.warnings, ...versionMetadata.parityWarnings]),
    docs: findDocs(catalog, task.docIds),
    examples: findExamples(catalog, task.exampleIds),
    recipes: findRecipes(catalog, task.recipeIds),
    plugins: findPlugins(catalog, task.pluginIds),
  }
}

function resolveTask(taskId?: string, goal?: string) {
  const normalizedTaskId = normalize(taskId ?? '')
  const direct = DEVELOPER_TASKS.find(task => (
    task.id === normalizedTaskId
    || task.patternAlias === normalizedTaskId
    || task.relatedScenario === normalizedTaskId
  ))

  if (direct) {
    return direct
  }

  return fallbackTaskForGoal(goal ?? '')
}

function fallbackTaskForGoal(goal: string) {
  const explicit = detectExplicitGoalTask(goal)
  if (explicit) {
    return explicit
  }

  const normalizedGoal = normalize(goal)
  const matches = DEVELOPER_TASKS
    .map(task => ({ task, score: scoreTask(task, goal, {}, []) }))
    .sort((left, right) => right.score - left.score)

  return matches[0]?.score
    ? matches[0].task
    : getTask('generate-executable-schema')
}

function getTask(id: DeveloperTaskId) {
  const task = DEVELOPER_TASKS.find(entry => entry.id === id)
  if (!task) {
    throw new Error(`Unknown developer task "${id}".`)
  }
  return task
}

function choosePluginStrategy(project: DeveloperProjectContext) {
  const orm = normalize(project.orm ?? '')
  const isSequelize = orm.includes('sequelize') || !orm

  if (isSequelize) {
    return {
      strategy: 'plugin-sequelize',
      recommendedPlugin: '@graphql-gene/plugin-sequelize',
      recommendedPluginIds: [PLUGIN_IDS.sequelize],
      rationale: orm
        ? 'The project ORM is Sequelize, so the documented first-class plugin path is the best starting point.'
        : 'No ORM was provided; start by confirming whether the project can use the documented Sequelize plugin path.',
    }
  }

  return {
    strategy: 'custom-plugin-evaluation',
    recommendedPlugin: null,
    recommendedPluginIds: [PLUGIN_IDS.customPlugin],
    rationale: `The project ORM "${project.orm}" is not Sequelize, so evaluate a custom GraphQL Gene plugin instead of forcing the Sequelize path.`,
  }
}

function buildVersionMetadata(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
  targetVersion?: string,
): DeveloperTaskVersionMetadata {
  const requestedTargetVersion = targetVersion ?? project.graphqlGeneVersion ?? null
  const parityWarnings = dedupeStrings([
    ...task.warnings,
    ...(POLYMORPHIC_EXPORT_WARNING && task.id === 'model-polymorphic-content-blocks'
      ? [POLYMORPHIC_EXPORT_WARNING]
      : []),
  ])
  const notes = dedupeStrings([
    ...task.versionNotes,
    requestedTargetVersion
      ? `The requested target GraphQL Gene version is "${requestedTargetVersion}".`
      : 'No explicit target GraphQL Gene version was provided; using workspace dependency context.',
    WORKSPACE_METADATA.workspaceGraphqlGeneRange
      ? `The workspace currently depends on graphql-gene ${WORKSPACE_METADATA.workspaceGraphqlGeneRange}.`
      : 'The workspace graphql-gene dependency range could not be detected.',
    WORKSPACE_METADATA.workspacePluginSequelizeRange
      ? `The workspace currently depends on @graphql-gene/plugin-sequelize ${WORKSPACE_METADATA.workspacePluginSequelizeRange}.`
      : 'The workspace @graphql-gene/plugin-sequelize dependency range could not be detected.',
    WORKSPACE_METADATA.installedPluginSequelizeVersion
      ? `The installed @graphql-gene/plugin-sequelize package version is ${WORKSPACE_METADATA.installedPluginSequelizeVersion}.`
      : 'The installed @graphql-gene/plugin-sequelize package version could not be detected.',
  ])

  return {
    requestedTargetVersion,
    effectiveGraphqlGeneVersion: requestedTargetVersion ?? WORKSPACE_METADATA.workspaceGraphqlGeneRange,
    workspaceGraphqlGeneRange: WORKSPACE_METADATA.workspaceGraphqlGeneRange,
    workspacePluginSequelizeRange: WORKSPACE_METADATA.workspacePluginSequelizeRange,
    installedPluginSequelizeVersion: WORKSPACE_METADATA.installedPluginSequelizeVersion,
    notes,
    parityWarnings,
  }
}

function buildFitSummary(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
  pluginStrategy: ReturnType<typeof choosePluginStrategy>,
) {
  return [
    `Task "${task.title}" fits when the developer goal is: ${task.developerGoal}`,
    `Plugin strategy: ${pluginStrategy.strategy}. ${pluginStrategy.rationale}`,
    project.serverStack ? `Server stack: ${project.serverStack}.` : 'Server stack was not provided; the host agent should identify it before implementation.',
  ].join(' ')
}

function buildDeveloperTaskSteps(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
  pluginStrategy: ReturnType<typeof choosePluginStrategy>,
  constraints: string[],
) {
  const steps = [
    pluginStrategy.recommendedPlugin
      ? `Adopt the recommended plugin path: ${pluginStrategy.recommendedPlugin}.`
      : 'Evaluate the custom plugin path before trying to adapt the Sequelize plugin.',
    ...task.implementationSteps,
  ]

  if (project.serverStack) {
    steps.push(`Wire the final generated schema into ${project.serverStack} only after schema inspection passes.`)
  }

  if (constraints.length) {
    steps.push(`Validate project constraints explicitly: ${constraints.join(', ')}.`)
  }

  return dedupeStrings(steps)
}

function buildDeveloperTaskRisks(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
  pluginStrategy: ReturnType<typeof choosePluginStrategy>,
) {
  return dedupeStrings([
    ...task.commonPitfalls,
    ...(pluginStrategy.strategy === 'custom-plugin-evaluation'
      ? ['A non-Sequelize ORM usually requires explicit custom plugin evaluation before implementation.']
      : []),
    ...(project.currentGraphqlSetup
      ? ['Existing hand-written schema or resolvers may conflict with generated schema ownership boundaries.']
      : []),
    ...task.warnings,
  ])
}

function buildConceptMapping(task: DeveloperTaskSeed, targetModels: string[]) {
  switch (task.id) {
    case 'generate-executable-schema':
    case 'bootstrap-sequelize-project':
    case 'create-canonical-types-module':
      return [
        { exampleConcept: 'User/Order models', projectSubstitution: formatModels(targetModels), guidance: 'Replace demo models with the project ORM models that should own the generated GraphQL API.' },
        { exampleConcept: 'generated SDL panel', projectSubstitution: 'schema inspection output', guidance: 'Print or snapshot the generated SDL before server integration.' },
      ]
    case 'optimize-lookahead-loading':
      return [
        { exampleConcept: 'me { orders } query', projectSubstitution: 'project hot nested query', guidance: 'Use the query that currently drives performance or association-loading risk.' },
        { exampleConcept: 'captured SQL/include graph', projectSubstitution: 'project ORM logging', guidance: 'Compare selected fields with actual ORM loading behavior.' },
      ]
    case 'model-polymorphic-content-blocks':
      return [
        { exampleConcept: 'Page blocks', projectSubstitution: formatModels(targetModels), guidance: 'Map the parent or hub model and concrete block models before designing union or interface behavior.' },
        { exampleConcept: '__typename and inline fragments', projectSubstitution: 'client fragment contract', guidance: 'Require query tests for every concrete member type.' },
      ]
    case 'attach-directive-middleware':
    case 'decide-directive-sdl-visibility':
      return [
        { exampleConcept: '@userAuth directive', projectSubstitution: 'project auth or validation middleware', guidance: 'Attach runtime behavior at the narrowest generated type or field boundary.' },
        { exampleConcept: 'named or anonymous mode', projectSubstitution: 'SDL-visible or runtime-only policy', guidance: 'Decide whether the directive should print into SDL before writing tests.' },
      ]
    default:
      return [
        { exampleConcept: 'canonical GraphQL Gene example', projectSubstitution: formatModels(targetModels), guidance: 'Map the example concepts to the actual project model, server, and plugin boundaries.' },
      ]
  }
}

function buildAdaptationSteps(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
  targetModels: string[],
) {
  return dedupeStrings([
    `Identify the project equivalents for this task: ${formatModels(targetModels)}.`,
    `Use the "${task.title}" docs and recipes as the source-backed implementation path.`,
    'Ask the host coding agent to inspect local model definitions, server setup, and package versions before editing code.',
    'Adapt concept names and relationships to the project model layer instead of copying website playground runtime code.',
    ...(project.orm ? [`Validate the plugin strategy against ORM "${project.orm}".`] : ['Identify the ORM or data layer before choosing a plugin strategy.']),
    'Add the validation checks listed by this tool before treating the implementation as complete.',
  ])
}

function buildAdaptationWarnings(task: DeveloperTaskSeed, project: DeveloperProjectContext) {
  return dedupeStrings([
    'Playground examples are demonstrations of capability, not project-ready implementation templates.',
    ...(normalize(project.orm ?? '').includes('sequelize') || !project.orm
      ? []
      : [`The documented Sequelize plugin path may not fit ORM "${project.orm}" without custom plugin work.`]),
    ...(task.id === 'model-polymorphic-content-blocks'
      ? ['Do not overclaim polymorphism as unique; emphasize model-native, generator-first schema generation.']
      : []),
  ])
}

function inferTargetModels(task: DeveloperTaskSeed) {
  switch (task.id) {
    case 'generate-executable-schema':
    case 'bootstrap-sequelize-project':
    case 'create-canonical-types-module':
    case 'optimize-lookahead-loading':
      return ['User', 'Order']
    case 'model-polymorphic-content-blocks':
      return ['Page', 'HeroBlock', 'TextBlock']
    case 'attach-directive-middleware':
    case 'decide-directive-sdl-visibility':
    case 'model-auth-scopes-with-aliases':
      return ['User']
    default:
      return ['ProjectModel']
  }
}

function scoreTask(
  task: DeveloperTaskSeed,
  goal: string,
  project: DeveloperProjectContext,
  constraints: string[],
) {
  const haystack = normalize([
    goal,
    project.targetOutcome,
    project.currentGraphqlSetup,
    project.orm,
    project.serverStack,
    ...constraints,
  ].filter(Boolean).join(' '))
  let score = 0

  for (const keyword of task.keywords) {
    if (haystack.includes(normalize(keyword))) {
      score += 4
    }
  }

  if (task.relatedScenario && haystack.includes(normalize(task.relatedScenario))) {
    score += 5
  }

  if (project.orm && task.orms.some(orm => normalize(project.orm ?? '').includes(normalize(orm)))) {
    score += 2
  }

  if (!project.orm && task.orms.includes('Sequelize')) {
    score += 1
  }

  const explicit = detectExplicitGoalTask(goal)
  if (explicit?.id === task.id) {
    score += 25
  }

  if (task.stage === 'debug' && (haystack.includes('broken') || haystack.includes('missing') || haystack.includes('error') || haystack.includes('wrong'))) {
    score += 2
  }

  return score
}

function detectExplicitGoalTask(goal: string) {
  const normalizedGoal = normalize(goal)

  if (
    normalizedGoal.includes('hand-written schema')
    || normalizedGoal.includes('handwritten schema')
    || normalizedGoal.includes('manual schema')
    || (normalizedGoal.includes('migrate') && normalizedGoal.includes('schema'))
  ) {
    return getTask('migrate-from-handwritten-schema')
  }

  if (
    normalizedGoal.includes('n+1')
    || normalizedGoal.includes('lookahead')
    || normalizedGoal.includes('include graph')
    || normalizedGoal.includes('join shape')
    || (normalizedGoal.includes('nested') && normalizedGoal.includes('query'))
  ) {
    return getTask('optimize-lookahead-loading')
  }

  if (
    normalizedGoal.includes('missing model types')
    || normalizedGoal.includes('missing expected model')
    || normalizedGoal.includes('missing schema')
    || normalizedGoal.includes('missing types')
  ) {
    return getTask('debug-schema-generation')
  }

  if (
    normalizedGoal.includes('directive')
    && (normalizedGoal.includes('sdl') || normalizedGoal.includes('not appearing') || normalizedGoal.includes('not printed'))
  ) {
    return getTask('decide-directive-sdl-visibility')
  }

  if (normalizedGoal.includes('directive') || normalizedGoal.includes('auth')) {
    return getTask('attach-directive-middleware')
  }

  if (normalizedGoal.includes('polymorphic') || normalizedGoal.includes('inline fragments') || normalizedGoal.includes('content blocks')) {
    return getTask('model-polymorphic-content-blocks')
  }

  if (
    normalizedGoal.includes('custom plugin')
    || normalizedGoal.includes('write plugin')
    || normalizedGoal.includes('prisma')
    || normalizedGoal.includes('typeorm')
  ) {
    return getTask('choose-plugin-strategy')
  }

  if (
    normalizedGoal.includes('typescript')
    || normalizedGoal.includes('geneschema')
    || normalizedGoal.includes('genecontext')
    || normalizedGoal.includes('augmentation')
  ) {
    return getTask('setup-typescript-augmentation')
  }

  return null
}

function buildClassificationRationale(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
  constraints: string[],
) {
  return [
    `Stage: ${task.stage}.`,
    `Capabilities: ${task.capabilities.join(', ')}.`,
    project.orm ? `ORM signal: ${project.orm}.` : 'ORM signal is missing; verify it before implementation.',
    constraints.length ? `Active constraints: ${constraints.join(', ')}.` : 'No extra project constraints were provided.',
  ].join(' ')
}

function buildMissingContextQuestions(
  task: DeveloperTaskSeed,
  project: DeveloperProjectContext,
) {
  const questions: string[] = []
  const lowerSignals = task.requiredProjectSignals.map(signal => normalize(signal))

  if (!project.orm && lowerSignals.some(signal => signal.includes('orm'))) {
    questions.push('Which ORM or persistence layer does the project use?')
  }

  if (!project.serverStack && lowerSignals.some(signal => signal.includes('server'))) {
    questions.push('Which GraphQL server stack owns the runtime entrypoint?')
  }

  if (!project.currentGraphqlSetup && lowerSignals.some(signal => signal.includes('graphql schema ownership') || signal.includes('resolver') || signal.includes('current'))) {
    questions.push('What does the current GraphQL setup already own: schema, resolvers, both, or neither?')
  }

  if (task.requiredProjectSignals.some(signal => normalize(signal).includes('module')) && !project.targetOutcome) {
    questions.push('Which model or type modules should feed GraphQL Gene schema generation?')
  }

  return questions.slice(0, 3)
}

function selectTroubleshooting(
  catalog: KnowledgeCatalog,
  task: DeveloperTaskSeed,
  input: DiagnoseDeveloperIssueInput,
) {
  const normalizedSymptom = normalize([
    input.symptom,
    input.observedBehavior,
    input.expectedBehavior,
    input.schemaExcerpt,
    input.operationExcerpt,
  ].filter(Boolean).join(' '))

  const byStage = input.stage
    ? catalog.troubleshooting.filter(issue => issue.stages.includes(input.stage!))
    : catalog.troubleshooting

  const byScenario = task.relatedScenario
    ? byStage.filter(issue => issue.scenarios.includes(task.relatedScenario!))
    : byStage

  const scored = byScenario
    .map(issue => ({
      issue,
      score: scoreTroubleshooting(issue, normalizedSymptom),
    }))
    .filter(entry => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)

  if (scored.length) {
    return scored.map(entry => entry.issue)
  }

  return byStage
    .filter(issue => task.relatedScenario ? issue.scenarios.includes(task.relatedScenario) : true)
    .slice(0, 2)
}

function scoreTroubleshooting(issue: TroubleshootingKnowledgeEntry, symptom: string) {
  let score = 0

  for (const text of [...issue.symptoms, ...issue.likelyCauses, ...issue.recommendedChecks]) {
    if (symptom.includes(normalize(text))) {
      score += 3
    }
  }

  if (symptom.includes(normalize(issue.issueId))) {
    score += 5
  }

  return score
}

function inferDiagnosisArea(task: DeveloperTaskSeed, stage?: TroubleshootingStage) {
  if (stage) {
    return stage
  }

  switch (task.stage) {
    case 'query':
      return 'query'
    case 'directive':
      return 'directive'
    case 'plugin':
      return 'plugin'
    case 'debug':
      return 'runtime'
    default:
      return 'schema'
  }
}

function relatedTasksForDiagnosis(task: DeveloperTaskSeed) {
  const related = new Set<DeveloperTaskSeed>([task])

  if (task.id === 'debug-schema-generation') {
    related.add(getTask('create-canonical-types-module'))
    related.add(getTask('generate-executable-schema'))
    related.add(getTask('choose-plugin-strategy'))
  }

  if (task.id === 'debug-runtime-resolution') {
    related.add(getTask('optimize-lookahead-loading'))
    related.add(getTask('attach-directive-middleware'))
  }

  if (task.id === 'model-polymorphic-content-blocks') {
    related.add(getTask('upgrade-version-and-parity-check'))
  }

  return [...related]
}

function buildFallbackLikelyCauses(
  stage: TroubleshootingStage | undefined,
  task: DeveloperTaskSeed,
) {
  switch (stage) {
    case 'install':
      return [
        'The core package or plugin package is missing or version-misaligned.',
        'The initial setup drifted from the documented bootstrap flow.',
      ]
    case 'schema':
      return [
        'The GraphQL type exports are incomplete or inconsistent.',
        'The generated schema input does not match the intended model graph.',
      ]
    case 'plugin':
      return [
        'The chosen plugin strategy does not match the target ORM behavior.',
        'The project likely needs the custom plugin path instead of the Sequelize reference path.',
      ]
    case 'query':
      return [
        'The query shape does not align with the generated associations.',
        'Lookahead expectations differ from the current runtime adapter behavior.',
      ]
    case 'directive':
      return [
        'Directive middleware is attached at the wrong level.',
        'Runtime-only directive behavior was mistaken for SDL-visible behavior.',
      ]
    default:
      return [
        `The current "${task.title}" setup is not aligned with the documented integration path.`,
        'The issue may sit at the boundary between schema generation and runtime wiring.',
      ]
  }
}

function buildFallbackRecommendedChecks(
  stage: TroubleshootingStage | undefined,
  task: DeveloperTaskSeed,
) {
  switch (stage) {
    case 'install':
      return [
        'Verify graphql-gene and plugin package installation.',
        'Compare the setup against the Getting Started doc.',
      ]
    case 'schema':
      return [
        'Inspect the exported types module and confirm every intended type is re-exported.',
        'Print or inspect the generated schema before debugging downstream server behavior.',
      ]
    case 'plugin':
      return [
        'Check whether the target ORM truly maps to the recommended plugin.',
        'Review the plugin docs before widening custom behavior.',
      ]
    case 'query':
      return [
        'Compare the requested fields with the documented query/lookahead example.',
        'Inspect whether the runtime path is canonical or adapted.',
      ]
    case 'directive':
      return [
        'Check whether the directive should print into SDL or remain runtime-only.',
        'Verify handler placement on the relevant type or field.',
      ]
    default:
      return [
        `Start from the canonical docs linked to "${task.title}" before assuming runtime glue is correct.`,
        'Prefer upstream-aligned docs over adapted playground behavior when they differ.',
      ]
  }
}

function resolveExample(
  catalog: KnowledgeCatalog,
  task: DeveloperTaskSeed,
  exampleId?: string,
) {
  if (exampleId) {
    return catalog.examples.find(example => example.exampleId === exampleId || example.id === exampleId)
  }

  const ids = new Set(task.exampleIds)
  return catalog.examples.find(example => ids.has(example.id))
}

function findDocs(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.docs, ids).map(mapDoc)
}

function findExamples(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.examples, ids).map(mapExample)
}

function findRecipes(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.recipes, ids).map(mapRecipe)
}

function findPlugins(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.plugins, ids).map(mapPlugin)
}

function mapByIds<T extends { id: string }>(entries: T[], ids: string[]) {
  const entriesById = new Map(entries.map(entry => [entry.id, entry]))
  return ids
    .map(id => entriesById.get(id))
    .filter((entry): entry is T => Boolean(entry))
}

function mapDoc(doc: DocKnowledgeEntry) {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary,
  }
}

function mapExample(example: ExampleKnowledgeEntry) {
  return {
    id: example.id,
    title: example.title,
    scenario: example.scenario,
    summary: example.summary,
    executionMode: example.executionMode ?? null,
  }
}

function mapRecipe(recipe: RecipeKnowledgeEntry) {
  return {
    id: recipe.id,
    title: recipe.title,
    recipeId: recipe.recipeId,
    summary: recipe.summary,
  }
}

function mapPlugin(plugin: PluginKnowledgeEntry) {
  return {
    id: plugin.id,
    title: plugin.title,
    packageName: plugin.packageName ?? null,
    summary: plugin.summary,
  }
}

function mapTroubleshooting(issue: TroubleshootingKnowledgeEntry) {
  return {
    id: issue.id,
    title: issue.title,
    issueId: issue.issueId,
    summary: issue.summary,
  }
}

function countEvidenceKinds(evidence: DeveloperTaskEvidence[]) {
  return countBy(evidence.map(entry => entry.sourceKind))
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}

function serializeProject(project: DeveloperProjectContext) {
  const entries = Object.entries(project).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }

    return value !== undefined && value !== null && value !== ''
  })

  return entries.length ? Object.fromEntries(entries) : null
}

function summarizeIssues(issues: DeveloperTaskPlanIssue[]): DeveloperTaskPlanStatus {
  if (issues.some(issue => issue.severity === 'error')) {
    return 'fail'
  }

  if (issues.some(issue => issue.severity === 'warning')) {
    return 'warn'
  }

  return 'pass'
}

function formatModels(models: string[]) {
  return models.length ? models.join(', ') : 'project models'
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

function dedupeStrings(values: string[]) {
  return uniqueStrings(values.filter(Boolean))
}

function normalize(value: string | undefined) {
  return (value ?? '').toLowerCase()
}

function evidenceDoc(sourcePath: string, claim: string, confidence: DeveloperTaskConfidence = 'high'): DeveloperTaskEvidence {
  return {
    sourcePath,
    sourceKind: 'upstream-doc',
    claim,
    confidence,
  }
}

function evidenceReadme(sourcePath: string, claim: string, confidence: DeveloperTaskConfidence = 'high'): DeveloperTaskEvidence {
  return {
    sourcePath,
    sourceKind: 'package-readme',
    claim,
    confidence,
  }
}

function evidenceExport(sourcePath: string, claim: string, confidence: DeveloperTaskConfidence = 'high'): DeveloperTaskEvidence {
  return {
    sourcePath,
    sourceKind: 'package-export',
    claim,
    confidence,
  }
}

function evidenceCurated(sourcePath: string, claim: string, confidence: DeveloperTaskConfidence = 'high'): DeveloperTaskEvidence {
  return {
    sourcePath,
    sourceKind: 'curated-knowledge',
    claim,
    confidence,
  }
}

function evidenceLocal(sourcePath: string, claim: string, confidence: DeveloperTaskConfidence = 'medium'): DeveloperTaskEvidence {
  return {
    sourcePath,
    sourceKind: 'local-doc',
    claim,
    confidence,
  }
}

function readWorkspacePackageMetadata(): WorkspacePackageMetadata {
  const workspaceRoot = findWorkspaceRoot(process.cwd())
  if (!workspaceRoot) {
    return {
      workspaceGraphqlGeneRange: null,
      workspacePluginSequelizeRange: null,
      installedPluginSequelizeVersion: null,
      pluginExportsPolymorphic: false,
    }
  }

  const workspacePackage = readJson(resolve(workspaceRoot, 'package.json')) as {
    dependencies?: Record<string, string>
  } | null
  const pluginPackage = readJson(resolve(workspaceRoot, 'node_modules', '@graphql-gene', 'plugin-sequelize', 'package.json')) as {
    version?: string
  } | null
  const pluginExportSurface = readText(resolve(workspaceRoot, 'node_modules', '@graphql-gene', 'plugin-sequelize', 'dist', 'index.d.ts'))

  return {
    workspaceGraphqlGeneRange: workspacePackage?.dependencies?.['graphql-gene'] ?? null,
    workspacePluginSequelizeRange: workspacePackage?.dependencies?.['@graphql-gene/plugin-sequelize'] ?? null,
    installedPluginSequelizeVersion: pluginPackage?.version ?? null,
    pluginExportsPolymorphic: /\bPolymorphic\b/.test(pluginExportSurface),
  }
}

function findWorkspaceRoot(startDir: string) {
  let candidate = resolve(startDir)

  while (true) {
    if (
      existsSync(resolve(candidate, 'package.json'))
      && existsSync(resolve(candidate, 'content', 'graphql-gene', 'docs'))
    ) {
      return candidate
    }

    const parent = resolve(candidate, '..')
    if (parent === candidate) {
      return null
    }

    candidate = parent
  }
}

function readJson(filePath: string) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as unknown
  }
  catch {
    return null
  }
}

function readText(filePath: string) {
  try {
    return readFileSync(filePath, 'utf8')
  }
  catch {
    return ''
  }
}
