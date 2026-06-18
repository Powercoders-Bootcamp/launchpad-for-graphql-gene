import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  AuditConceptNode,
  AuditConflict,
  AuditSourceReference,
  AuditedAudienceLevel,
  AuditedDoc,
  AuditedDocKind,
  AuditedExample,
  AuditedPackage,
  AuditedPackageRole,
  AuditedPlugin,
  AuditedScenario,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  KnowledgeConfidence,
  PluginKnowledgeEntry,
  UpstreamAuditSnapshot,
  UpstreamRepositoryInventoryItem,
} from '../contracts'
import { buildPackageParityAudit } from './package-parity'
import { listDeveloperTaskPatterns } from '../developer/task-patterns'

interface BuildUpstreamAuditSnapshotOptions {
  workspaceRoot: string
  sourceRepo: string
  sourceRef: string
  versionRange?: string
  auditor?: string
  auditMetadata?: {
    upstreamRepo: string
    auditedRef: string
    auditor?: string
  }
  catalog: KnowledgeCatalog
}

interface PackageJsonLike {
  name?: string
  version?: string
  description?: string
  repository?: string | { url?: string }
  exports?: Record<string, unknown>
  main?: string
  module?: string
  types?: string
  typings?: string
}

export function buildUpstreamAuditSnapshot(
  options: BuildUpstreamAuditSnapshotOptions,
): UpstreamAuditSnapshot {
  const graphqlGenePackage = readPackageJson(resolve(options.workspaceRoot, 'node_modules/graphql-gene/package.json'))
  const sequelizePluginPackage = readPackageJson(resolve(
    options.workspaceRoot,
    'node_modules/@graphql-gene/plugin-sequelize/package.json',
  ))
  const packageParity = buildPackageParityAudit({
    workspaceRoot: options.workspaceRoot,
  })
  const upstreamRepo = options.auditMetadata?.upstreamRepo
    ?? inferUpstreamRepo(graphqlGenePackage)
    ?? options.sourceRepo
  const auditedRef = options.auditMetadata?.auditedRef
    ?? (options.sourceRef !== 'workspace'
      ? options.sourceRef
      : graphqlGenePackage?.version ?? options.versionRange ?? 'workspace')
  const explicitProvenanceCoverage = options.catalog.entries.every(entry => Boolean(entry.provenanceStatus))
  const status = options.auditMetadata?.auditedRef && explicitProvenanceCoverage ? 'full' : 'bootstrap'
  const limitations = dedupeStrings([
    status === 'bootstrap'
      ? 'This snapshot is a bootstrap audit derived from the local docs mirror, installed packages, and curated catalog rather than a pinned upstream git checkout.'
      : '',
    options.catalog.entries.some(entry => entry.provenanceStatus !== 'local-only' && !entry.upstreamSourcePath)
      ? 'Some entries still lack explicit authoritative upstream source paths and should not yet be treated as fully parity-audited.'
      : '',
    options.sourceRepo === 'graphql-gene-site'
      ? 'Current catalog docs still originate from the website workspace projection and must later be reconciled against explicit upstream source refs.'
      : '',
    'Playground parity remains partially unverified until upstream displayed-code and runtime drift checks are completed.',
  ]).filter(Boolean)

  const docs = buildAuditedDocs(options.catalog)
  const packages = buildAuditedPackages(options.workspaceRoot, options.catalog)
  const plugins = buildAuditedPlugins(options.catalog)
  const examples = buildAuditedExamples(options.catalog.examples)
  const conceptMap = buildConceptMap()
  const scenarios = buildScenarioMatrix(options.catalog)
  const conflicts = buildConflictLog(options.catalog)

  return {
    metadata: {
      status,
      upstreamRepo,
      auditedRef,
      auditDate: new Date().toISOString(),
      auditor: options.auditMetadata?.auditor ?? options.auditor ?? 'codex',
      workspaceVersionRange: options.versionRange,
      installedGraphqlGeneVersion: graphqlGenePackage?.version ?? null,
      installedPluginSequelizeVersion: sequelizePluginPackage?.version ?? null,
      limitations,
    },
    repositoryInventory: buildRepositoryInventory(options.workspaceRoot),
    docs,
    packages,
    packageParity,
    plugins,
    examples,
    conceptMap,
    scenarios,
    conflicts,
    provenanceSummary: {
      sourceTypeCounts: countBy(options.catalog.entries.map(entry => (
        entry.upstreamSourceType ?? entry.sourceType
      ))),
      sourceRepoCounts: countBy(options.catalog.entries.map(entry => (
        entry.upstreamSourceRepo ?? entry.sourceRepo
      ))),
      confidenceCounts: {
        high: options.catalog.entries.filter(entry => entry.confidence === 'high').length,
        medium: options.catalog.entries.filter(entry => entry.confidence === 'medium').length,
        low: options.catalog.entries.filter(entry => entry.confidence === 'low').length,
      },
    },
    coverage: {
      docs: docs.length,
      packages: packages.length,
      capabilities: packageParity.capabilities.length,
      plugins: plugins.length,
      examples: examples.length,
      scenarios: scenarios.length,
      conflicts: conflicts.length,
    },
  }
}

function buildRepositoryInventory(workspaceRoot: string): UpstreamRepositoryInventoryItem[] {
  return [
    inventoryItem(workspaceRoot, 'README.md', 'root-file', 'Root repository overview and usage framing.'),
    inventoryItem(workspaceRoot, 'package.json', 'root-file', 'Workspace dependency ranges and product-level scripts.'),
    inventoryItem(workspaceRoot, 'content/graphql-gene/docs', 'docs-directory', 'Current local docs mirror used by the canonical site catalog.'),
    inventoryItem(workspaceRoot, 'node_modules/graphql-gene', 'package-directory', 'Installed graphql-gene package surface used for package-level parity checks.'),
    inventoryItem(workspaceRoot, 'node_modules/@graphql-gene/plugin-sequelize', 'plugin-directory', 'Installed Sequelize plugin package surface used for parity checks.'),
    inventoryItem(workspaceRoot, 'server/utils/playground/registry.ts', 'workspace-file', 'Website playground example catalog used for adapted example projections.'),
    inventoryItem(workspaceRoot, 'server/utils/playground/engine.ts', 'workspace-file', 'Website playground runtime adapter used to determine execution-mode disclosure.'),
    inventoryItem(workspaceRoot, 'test', 'test-directory', 'Repository test suite that constrains canonical knowledge behavior and MCP output expectations.'),
  ]
}

function buildAuditedDocs(catalog: KnowledgeCatalog): AuditedDoc[] {
  return catalog.docs.map((doc) => {
    const authoritativeSource = resolveAuthoritativeSource(doc)

    return {
    sourcePath: authoritativeSource.sourcePath,
    title: doc.title,
    summary: doc.summary,
    topics: doc.topics,
    kind: inferDocKind(doc.slug, doc.topics),
    audienceLevel: inferAudienceLevel(doc.slug),
    relatedPackages: dedupeStrings(doc.relatedIds
      .filter(id => id.startsWith('plugin:'))
      .map(id => catalog.byId[id])
      .filter((entry): entry is PluginKnowledgeEntry => entry?.kind === 'plugin')
      .map(entry => entry.packageName)
      .filter((value): value is string => Boolean(value))),
    observedCapabilities: dedupeStrings([
      ...doc.topics,
      ...(doc.playgroundScenario ? [doc.playgroundScenario] : []),
    ]),
    confidence: doc.confidence,
    source: authoritativeSource,
    workspaceProjectionPath: doc.sourcePath,
  }
  })
}

function buildAuditedPackages(workspaceRoot: string, catalog: KnowledgeCatalog): AuditedPackage[] {
  const packageDefinitions: Array<{
    packageName: string
    role: AuditedPackageRole
    summary: string
    relatedDocs: string[]
  }> = [
    {
      packageName: 'graphql-gene',
      role: 'core',
      summary: 'Core GraphQL Gene package that owns schema generation, typing, configuration, and resolver patterns.',
      relatedDocs: ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/schema-design'],
    },
    {
      packageName: '@graphql-gene/plugin-sequelize',
      role: 'plugin',
      summary: 'First-class Sequelize integration plugin used by the project-facing adoption path.',
      relatedDocs: ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/polymorphic-blocks'],
    },
    {
      packageName: 'graphql',
      role: 'support',
      summary: 'GraphQL runtime dependency required for schema construction and execution.',
      relatedDocs: ['doc:/docs/concepts/getting-started'],
    },
    {
      packageName: 'sequelize',
      role: 'support',
      summary: 'ORM dependency that underpins the Sequelize plugin examples and query/runtime behavior.',
      relatedDocs: ['doc:/docs/guides/schema-design', 'doc:/docs/guides/polymorphic-blocks'],
    },
  ]

  return packageDefinitions
    .map((definition) => buildAuditedPackage(workspaceRoot, definition.packageName, definition.role, definition.summary, definition.relatedDocs))
    .filter((entry): entry is AuditedPackage => Boolean(entry))
    .map((entry) => ({
      ...entry,
      relatedDocs: entry.relatedDocs.filter(id => Boolean(catalog.byId[id])),
    }))
}

function buildAuditedPackage(
  workspaceRoot: string,
  packageName: string,
  role: AuditedPackageRole,
  summary: string,
  relatedDocs: string[],
): AuditedPackage | null {
  const packageJsonPath = resolve(workspaceRoot, 'node_modules', ...packageName.split('/'), 'package.json')
  const packageJson = readPackageJson(packageJsonPath)
  if (!packageJson) {
    return null
  }

  return {
    packageName,
    sourcePath: relativeToWorkspace(workspaceRoot, packageJsonPath),
    role,
    summary,
    exportsOfInterest: inferExportsOfInterest(packageJson),
    relatedDocs,
    confidence: role === 'support' ? 'medium' : 'high',
    source: toAuditSource(
      relativeToWorkspace(workspaceRoot, packageJsonPath),
      inferUpstreamRepo(packageJson) ?? packageName,
      packageJson.version ?? 'unknown',
      'package-metadata',
    ),
  }
}

function buildAuditedPlugins(catalog: KnowledgeCatalog): AuditedPlugin[] {
  return catalog.plugins.map((plugin) => {
    const authoritativeSource = inferPluginAuditSource(plugin)

    return {
    pluginId: plugin.pluginId,
    packageName: plugin.packageName,
    targetOrms: plugin.supportedOrms,
    integrationStyle: plugin.pluginId === 'custom-plugin'
      ? 'custom-plugin-authoring'
      : 'first-class-package',
    setupExpectations: plugin.whenToUse,
    docsPaths: plugin.recommendedDocIds,
    evidencePaths: dedupeStrings([
      plugin.sourcePath,
      plugin.upstreamSourcePath ?? '',
      ...plugin.recommendedDocIds,
      ...plugin.recommendedExampleIds,
    ].filter(Boolean)),
    confidence: plugin.confidence,
    source: authoritativeSource,
    workspaceProjectionPath: plugin.sourcePath,
  }
  })
}

function buildAuditedExamples(examples: ExampleKnowledgeEntry[]): AuditedExample[] {
  return examples.map((example) => {
    const authoritativeSource = resolveAuthoritativeSource(example)
    const suitableSurfaces = example.suitableSurfaces?.length
      ? [...example.suitableSurfaces]
      : dedupeStrings([
          'playground',
          'mcp',
          ...(example.recommendedDocIds.length ? ['docs'] : []),
        ]) as Array<'docs' | 'playground' | 'mcp'>

    return {
    sourcePath: authoritativeSource.sourcePath,
    title: example.title,
    capability: `${example.scenario}: ${example.summary}`,
    relatedDocs: example.recommendedDocIds,
    relatedPackages: dedupeStrings([
      '@graphql-gene/plugin-sequelize',
      'graphql-gene',
    ]),
    suitableSurfaces,
    paritySuitability: example.executionMode ?? 'unknown',
    confidence: example.confidence,
    source: authoritativeSource,
    workspaceProjectionPath: example.sourcePath,
  }
  })
}

function buildConceptMap(): AuditConceptNode[] {
  return [
    {
      conceptId: 'schema-generation',
      summary: 'GraphQL Gene generates executable schema artifacts from model-native inputs.',
      requiredDocs: ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/schema-design'],
      requiredPackages: ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      relatedExamples: ['example:model-to-schema:user-orders-basic'],
      relatedTasks: ['bootstrap-sequelize-project', 'generate-executable-schema', 'inspect-generated-schema'],
    },
    {
      conceptId: 'typing-model',
      summary: 'Typing and module augmentation shape the project-facing Gene context and exported schema inputs.',
      requiredDocs: ['doc:/docs/concepts/getting-started'],
      requiredPackages: ['graphql-gene'],
      relatedExamples: ['example:model-to-schema:user-orders-basic'],
      relatedTasks: ['create-canonical-types-module', 'setup-typescript-augmentation'],
    },
    {
      conceptId: 'gene-config',
      summary: 'geneConfig controls field exposure, aliases, filters, and schema-facing model metadata.',
      requiredDocs: ['doc:/docs/guides/schema-design'],
      requiredPackages: ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      relatedExamples: ['example:model-to-schema:user-orders-basic'],
      relatedTasks: ['configure-scalars-and-datatype-map', 'control-field-exposure', 'model-auth-scopes-with-aliases'],
    },
    {
      conceptId: 'resolvers-and-filters',
      summary: 'Generated queries, filters, ordering, and custom resolvers sit on top of the model graph rather than a hand-written schema-first stack.',
      requiredDocs: ['doc:/docs/guides/schema-design'],
      requiredPackages: ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      relatedExamples: ['example:query-lookahead:me-with-orders', 'example:generated-query:products-filters-order-pagination', 'example:custom-mutation:register-prospect'],
      relatedTasks: ['add-generated-query-fields', 'use-generated-filters-order-pagination', 'add-custom-query-or-mutation'],
    },
    {
      conceptId: 'directives',
      summary: 'Directive middleware must distinguish runtime-only behavior from SDL-visible behavior.',
      requiredDocs: ['doc:/docs/guides/directives'],
      requiredPackages: ['graphql-gene'],
      relatedExamples: ['example:directive-middleware:user-auth-directive'],
      relatedTasks: ['attach-directive-middleware', 'decide-directive-sdl-visibility'],
    },
    {
      conceptId: 'plugins',
      summary: 'Plugin strategy determines whether the project follows the first-class Sequelize path or a custom plugin path.',
      requiredDocs: ['doc:/docs/concepts/getting-started', 'doc:/docs/reference/writing-a-plugin'],
      requiredPackages: ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      relatedExamples: ['example:model-to-schema:user-orders-basic', 'example:custom-plugin:sequelize-reference-study'],
      relatedTasks: ['choose-plugin-strategy', 'write-custom-plugin'],
    },
    {
      conceptId: 'server-integration',
      summary: 'Generated schema output should be inspected before final GraphQL server wiring.',
      requiredDocs: ['doc:/docs/concepts/getting-started'],
      requiredPackages: ['graphql-gene'],
      relatedExamples: ['example:model-to-schema:user-orders-basic', 'example:schema-inspection:generate-schema-artifacts'],
      relatedTasks: ['bootstrap-sequelize-project', 'generate-executable-schema', 'migrate-from-handwritten-schema'],
    },
    {
      conceptId: 'customization-model',
      summary: 'Custom mutations, custom plugins, and polymorphic patterns require stronger provenance and parity checks than the basic path.',
      requiredDocs: ['doc:/docs/reference/writing-a-plugin', 'doc:/docs/guides/polymorphic-blocks'],
      requiredPackages: ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      relatedExamples: ['example:polymorphic-blocks:page-blocks-basic', 'example:custom-mutation:register-prospect', 'example:custom-plugin:sequelize-reference-study'],
      relatedTasks: ['design-cache-friendly-mutations', 'model-polymorphic-content-blocks', 'write-custom-plugin'],
    },
  ]
}

function buildScenarioMatrix(catalog: KnowledgeCatalog): AuditedScenario[] {
  const taskPatterns = listDeveloperTaskPatterns(catalog).patterns
  const taskIds = new Set<string>(taskPatterns.map(pattern => pattern.taskId))

  const scenarios: AuditedScenario[] = [
    scenario(
      'evaluate-fit',
      'Decide whether GraphQL Gene is the right abstraction for this project.',
      'A team is comparing generator-first GraphQL against a hand-written schema stack.',
      ['schema-generation', 'plugins'],
      ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/schema-design'],
      ['example:model-to-schema:user-orders-basic'],
      ['knowledge://overview', 'developer-tasks://task/evaluate-graphql-gene-fit'],
      ['start_graphql_gene_integration', 'select_graphql_gene_plugin_strategy'],
      ['classify_developer_goal', 'plan_developer_task'],
    ),
    scenario(
      'sequelize-setup',
      'Bootstrap a Sequelize-backed GraphQL Gene project.',
      'A developer wants a first runnable model-to-schema path using the first-class plugin.',
      ['schema-generation', 'plugins', 'server-integration'],
      ['graphql-gene', '@graphql-gene/plugin-sequelize', 'sequelize'],
      ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/schema-design'],
      ['example:model-to-schema:user-orders-basic'],
      ['developer-tasks://task/bootstrap-sequelize-project', 'plugins://plugin/sequelize'],
      ['setup_graphql_gene_schema_generation'],
      ['classify_developer_goal', 'plan_developer_task', 'validate_developer_task_plan'],
    ),
    scenario(
      'schema-generation',
      'Generate, inspect, and validate SDL before runtime integration.',
      'A project needs deterministic schema output and wants to avoid wiring blind.',
      ['schema-generation', 'server-integration'],
      ['graphql-gene'],
      ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/schema-design'],
      ['example:model-to-schema:user-orders-basic', 'example:schema-inspection:generate-schema-artifacts'],
      ['developer-tasks://task/generate-executable-schema', 'developer-tasks://task/inspect-generated-schema'],
      ['setup_graphql_gene_schema_generation'],
      ['classify_developer_goal', 'plan_developer_task', 'validate_developer_task_plan'],
    ),
    scenario(
      'directive-middleware',
      'Attach directive middleware without confusing runtime-only and SDL-visible behavior.',
      'A generated field needs auth or validation middleware.',
      ['directives', 'customization-model'],
      ['graphql-gene'],
      ['doc:/docs/guides/directives'],
      ['example:directive-middleware:user-auth-directive'],
      ['developer-tasks://task/attach-directive-middleware', 'recipes://recipe/directive-middleware-auth'],
      ['implement_graphql_gene_directive_middleware'],
      ['classify_developer_goal', 'adapt_example_to_project', 'validate_developer_task_plan'],
    ),
    scenario(
      'lookahead-debugging',
      'Reduce N+1 or include-graph mismatches in nested queries.',
      'A nested query triggers unexpected SQL or include behavior.',
      ['resolvers-and-filters'],
      ['graphql-gene', '@graphql-gene/plugin-sequelize', 'sequelize'],
      ['doc:/docs/guides/schema-design'],
      ['example:query-lookahead:me-with-orders'],
      ['developer-tasks://task/optimize-lookahead-loading', 'troubleshooting://issue/lookahead-behavior-does-not-match-expectation'],
      ['debug_graphql_gene_lookahead'],
      ['classify_developer_goal', 'diagnose_developer_issue', 'plan_developer_task'],
    ),
    scenario(
      'polymorphic-content-blocks',
      'Model polymorphic content blocks while staying honest about package parity.',
      'A project needs fragment-friendly heterogeneous content models.',
      ['customization-model', 'plugins'],
      ['graphql-gene', '@graphql-gene/plugin-sequelize', 'sequelize'],
      ['doc:/docs/guides/polymorphic-blocks'],
      ['example:polymorphic-blocks:page-blocks-basic'],
      ['developer-tasks://task/model-polymorphic-content-blocks', 'recipes://recipe/polymorphic-content-blocks'],
      ['start_graphql_gene_integration'],
      ['classify_developer_goal', 'plan_developer_task', 'adapt_example_to_project'],
    ),
    scenario(
      'custom-plugin-authoring',
      'Design a custom GraphQL Gene plugin for a non-Sequelize model layer.',
      'A project uses Prisma or another non-first-class ORM and still wants GraphQL Gene.',
      ['plugins', 'customization-model'],
      ['graphql-gene'],
      ['doc:/docs/reference/writing-a-plugin'],
      ['example:custom-plugin:sequelize-reference-study'],
      ['developer-tasks://task/write-custom-plugin', 'plugins://plugin/custom-plugin'],
      ['author_graphql_gene_plugin', 'select_graphql_gene_plugin_strategy'],
      ['classify_developer_goal', 'choose_plugin_strategy', 'plan_developer_task'],
    ),
    scenario(
      'handwritten-schema-migration',
      'Migrate incrementally from a hand-written schema or resolver layer.',
      'The project wants adoption without rewriting its entire GraphQL stack in one pass.',
      ['schema-generation', 'server-integration', 'plugins'],
      ['graphql-gene', '@graphql-gene/plugin-sequelize'],
      ['doc:/docs/concepts/getting-started', 'doc:/docs/guides/schema-design'],
      ['example:model-to-schema:user-orders-basic'],
      ['developer-tasks://task/migrate-from-handwritten-schema'],
      ['migrate_handwritten_schema_to_graphql_gene', 'plan_graphql_gene_upgrade'],
      ['classify_developer_goal', 'plan_developer_task', 'validate_developer_task_plan'],
    ),
  ]

  return scenarios.filter(scenarioEntry => scenarioEntry.recommendedMcpResources.some((resource) => {
    const taskId = resource.startsWith('developer-tasks://task/')
      ? resource.slice('developer-tasks://task/'.length)
      : null
    return taskId ? taskIds.has(taskId) : true
  }))
}

function buildConflictLog(catalog: KnowledgeCatalog): AuditConflict[] {
  const exampleConflicts = catalog.examples.flatMap((example) => {
    const conflicts: AuditConflict[] = []

    if (example.executionMode && example.executionMode !== 'canonical') {
      conflicts.push({
        id: `playground-runtime-${example.exampleId}`,
        kind: 'playground-vs-upstream',
        summary: `Playground example "${example.id}" currently runs in ${example.executionMode} mode rather than a proven canonical upstream runtime.`,
        conflictingSources: dedupeStrings([
          example.sourcePath,
          example.runtimeSourcePath ?? '',
          ...example.recommendedDocIds,
        ]).filter(Boolean),
        currentBestJudgment: 'Treat the example as a capability demonstration and let upstream docs and package behavior win on implementation details.',
        recommendedResolutionRule: 'Do not present adapted or simulated playground execution as exact upstream runtime behavior until parity is proven.',
        severity: 'warning',
      })
    }

    if (example.supportsDisplayedCodeParity === false) {
      conflicts.push({
        id: `displayed-code-${example.exampleId}`,
        kind: 'playground-vs-upstream',
        summary: `Displayed-code parity for "${example.id}" is not yet proven against an upstream source artifact.`,
        conflictingSources: dedupeStrings([
          example.sourcePath,
          example.codeSourcePath ?? '',
        ]).filter(Boolean),
        currentBestJudgment: 'The example remains useful conceptually, but displayed code must not be treated as a canonical upstream snippet.',
        recommendedResolutionRule: 'Keep parity warnings active until a concrete upstream source path is linked and validated.',
        severity: 'warning',
      })
    }

    return conflicts
  })

  const taskConflicts = listDeveloperTaskPatterns(catalog).patterns
    .filter(pattern => pattern.warnings.length > 0)
    .map((pattern) => ({
      id: `task-warning-${pattern.taskId}`,
      kind: 'docs-vs-package' as const,
      summary: `Developer task "${pattern.taskId}" still carries parity-sensitive warnings.`,
      conflictingSources: [
        ...pattern.sourceEvidence.map(evidence => evidence.sourcePath),
      ],
      currentBestJudgment: pattern.warnings[0],
      recommendedResolutionRule: 'Prefer installed package exports and upstream code over prose when capability claims diverge.',
      severity: 'warning' as const,
    }))

  const provenanceConflicts = catalog.entries
    .filter(entry => !entry.provenanceStatus)
    .map((entry) => ({
      id: `missing-provenance-${entry.id}`,
      kind: 'version-ambiguity' as const,
      summary: `Entry "${entry.id}" does not yet declare explicit provenance status.`,
      conflictingSources: [entry.sourcePath],
      currentBestJudgment: 'The entry still falls back to workspace-local provenance.',
      recommendedResolutionRule: 'Assign explicit local-only, upstream-projected, or package-derived provenance metadata before relying on the entry for parity-sensitive guidance.',
      severity: 'info' as const,
    }))

  return dedupeById([
    ...exampleConflicts,
    ...taskConflicts,
    ...provenanceConflicts,
  ])
}

function inferDocKind(slug: string, topics: string[]): AuditedDocKind {
  if (slug.includes('/reference/')) {
    return 'canonical'
  }
  if (slug.includes('/tutorials/')) {
    return 'tutorial'
  }
  if (slug.includes('/examples/')) {
    return 'example'
  }
  if (topics.some(topic => topic.includes('troubleshooting'))) {
    return 'troubleshooting'
  }
  return 'canonical'
}

function inferAudienceLevel(slug: string): AuditedAudienceLevel {
  if (slug.includes('/concepts/')) {
    return 'introductory'
  }
  if (slug.includes('/reference/')) {
    return 'advanced'
  }
  if (slug.includes('/guides/')) {
    return 'intermediate'
  }
  return 'mixed'
}

function inferExportsOfInterest(packageJson: PackageJsonLike) {
  const exports = Object.keys(packageJson.exports ?? {})
  const entrypoints = [
    ...exports,
    packageJson.main,
    packageJson.module,
    packageJson.types,
    packageJson.typings,
  ]
    .filter((value): value is string => Boolean(value))

  return dedupeStrings(entrypoints).slice(0, 8)
}

function inferPluginAuditSource(plugin: PluginKnowledgeEntry): AuditSourceReference {
  if (plugin.upstreamSourcePath && plugin.upstreamSourceRepo && plugin.upstreamSourceRef && plugin.upstreamSourceType) {
    return toAuditSource(
      plugin.upstreamSourcePath,
      plugin.upstreamSourceRepo,
      plugin.upstreamSourceRef,
      plugin.upstreamSourceType,
    )
  }

  return toAuditSource(plugin.sourcePath, plugin.sourceRepo, plugin.sourceRef, plugin.sourceType)
}

function inferUpstreamRepo(packageJson: PackageJsonLike | null) {
  const repository = packageJson?.repository
  if (typeof repository === 'string') {
    return repository
  }
  return repository?.url
}

function inventoryItem(
  workspaceRoot: string,
  relativePath: string,
  kind: UpstreamRepositoryInventoryItem['kind'],
  note: string,
): UpstreamRepositoryInventoryItem {
  return {
    path: relativePath.replace(/\\/g, '/'),
    kind,
    note,
    exists: existsSync(resolve(workspaceRoot, relativePath)),
  }
}

function scenario(
  scenarioId: string,
  goal: string,
  trigger: string,
  requiredConcepts: string[],
  requiredPackages: string[],
  requiredDocs: string[],
  requiredExamples: string[],
  recommendedMcpResources: string[],
  recommendedMcpPrompts: string[],
  recommendedMcpTools: string[],
): AuditedScenario {
  return {
    scenarioId,
    goal,
    trigger,
    requiredConcepts,
    requiredPackages,
    requiredDocs,
    requiredExamples,
    recommendedMcpResources,
    recommendedMcpPrompts,
    recommendedMcpTools,
  }
}

function toAuditSource(
  sourcePath: string,
  sourceRepo: string,
  sourceRef: string,
  sourceType: AuditSourceReference['sourceType'],
): AuditSourceReference {
  return {
    sourcePath,
    sourceRepo,
    sourceRef,
    sourceType,
  }
}

function resolveAuthoritativeSource(
  entry: Pick<
    ExampleKnowledgeEntry | PluginKnowledgeEntry | KnowledgeCatalog['docs'][number],
    'sourcePath' | 'sourceRepo' | 'sourceRef' | 'sourceType' | 'upstreamSourcePath' | 'upstreamSourceRepo' | 'upstreamSourceRef' | 'upstreamSourceType'
  >,
) {
  if (entry.upstreamSourcePath && entry.upstreamSourceRepo && entry.upstreamSourceRef && entry.upstreamSourceType) {
    return toAuditSource(
      entry.upstreamSourcePath,
      entry.upstreamSourceRepo,
      entry.upstreamSourceRef,
      entry.upstreamSourceType,
    )
  }

  return toAuditSource(entry.sourcePath, entry.sourceRepo, entry.sourceRef, entry.sourceType)
}

function relativeToWorkspace(workspaceRoot: string, absolutePath: string) {
  return absolutePath.slice(resolve(workspaceRoot).length + 1).replace(/\\/g, '/')
}

function readPackageJson(filePath: string): PackageJsonLike | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as PackageJsonLike
  }
  catch {
    return null
  }
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1
    return accumulator
  }, {})
}

function dedupeStrings(values: string[]) {
  return [...new Set(values)]
}

function dedupeById<T extends { id: string }>(values: T[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    if (seen.has(value.id)) {
      return false
    }
    seen.add(value.id)
    return true
  })
}
