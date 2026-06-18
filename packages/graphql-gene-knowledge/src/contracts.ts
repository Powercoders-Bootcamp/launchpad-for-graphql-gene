export type KnowledgeKind = 'doc' | 'example' | 'plugin' | 'recipe' | 'troubleshooting'

export type KnowledgeSourceType =
  | 'canonical-doc'
  | 'canonical-code'
  | 'canonical-curation'
  | 'canonical-test'
  | 'demo-catalog'
  | 'demo-runtime'

export type AuditSourceType =
  | KnowledgeSourceType
  | 'package-metadata'
  | 'package-readme'
  | 'workspace-metadata'

export type KnowledgeConfidence = 'high' | 'medium' | 'low'
export type KnowledgeExecutionMode = 'canonical' | 'adapted' | 'simulated'
export type KnowledgeStability = 'stable' | 'experimental' | 'planned' | 'deprecated'
export type AdapterRisk = 'low' | 'medium' | 'high'
export type KnowledgeSurface = 'docs' | 'playground' | 'mcp'
export type TroubleshootingStage = 'install' | 'schema' | 'runtime' | 'plugin' | 'query' | 'directive'
export type KnowledgeProvenanceStatus = 'local-only' | 'upstream-projected' | 'package-derived'

export interface DocsSectionConfig {
  id: string
  title: string
  order: number
  description?: string
}

export interface DocsConfigContract {
  docsRoot: string
  sections: DocsSectionConfig[]
}

export interface DocsFrontmatterContract {
  title: string
  description: string
  section: string
  order: number
  slug: string
  category?: string
  status?: KnowledgeStability
  summary?: string
  related?: string[]
  sidebarLabel?: string
  playgroundScenario?: string
}

export interface PlaygroundExampleContract {
  id: string
  scenario: string
  title: string
  description: string
  editableFields: string[]
}

export interface CuratedExampleKnowledgeContract {
  id: string
  scenario: string
  title: string
  summary: string
  description: string
  editableFields?: string[]
  topics?: string[]
  sourcePath: string
  recommendedDocIds?: string[]
  codeSourcePath?: string
  runtimeSourcePath?: string
  notes?: string[]
  executionMode?: KnowledgeExecutionMode
  supportsDisplayedCodeParity?: boolean
  supportsRuntimeParity?: boolean
  requiresAdapter?: boolean
  adapterRisk?: AdapterRisk
  suitableSurfaces?: KnowledgeSurface[]
  stability?: KnowledgeStability
  confidence?: KnowledgeConfidence
}

export interface PluginKnowledgeContract {
  id: string
  title: string
  summary: string
  description: string
  topics?: string[]
  sourcePath: string
  packageName?: string
  supportedOrms?: string[]
  scenarios?: string[]
  whenToUse: string[]
  whenNotToUse?: string[]
  recommendedDocIds: string[]
  recommendedExampleIds?: string[]
  recommendedRecipeIds?: string[]
  stability?: KnowledgeStability
  confidence?: KnowledgeConfidence
}

export interface RecipeKnowledgeContract {
  id: string
  title: string
  summary: string
  description: string
  topics?: string[]
  sourcePath: string
  goal: string
  serverStacks?: string[]
  orms?: string[]
  scenarios?: string[]
  steps: string[]
  recommendedPluginIds?: string[]
  recommendedDocIds: string[]
  recommendedExampleIds?: string[]
  stability?: KnowledgeStability
  confidence?: KnowledgeConfidence
}

export interface TroubleshootingKnowledgeContract {
  id: string
  title: string
  summary: string
  description: string
  topics?: string[]
  sourcePath: string
  symptoms: string[]
  stages: TroubleshootingStage[]
  scenarios?: string[]
  likelyCauses: string[]
  recommendedChecks: string[]
  recommendedDocIds: string[]
  recommendedExampleIds?: string[]
  recommendedRecipeIds?: string[]
  stability?: KnowledgeStability
  confidence?: KnowledgeConfidence
}

export interface KnowledgeSourceOverride {
  provenanceStatus: KnowledgeProvenanceStatus
  upstreamSourcePath?: string
  upstreamSourceRepo?: string
  upstreamSourceRef?: string
  upstreamSourceType?: AuditSourceType
}

export interface KnowledgeProvenanceOverrides {
  audit?: {
    upstreamRepo: string
    auditedRef: string
    auditor?: string
  }
  docsBySlug?: Record<string, KnowledgeSourceOverride>
  examplesByKey?: Record<string, KnowledgeSourceOverride>
  pluginsById?: Record<string, KnowledgeSourceOverride>
  recipesById?: Record<string, KnowledgeSourceOverride>
  troubleshootingById?: Record<string, KnowledgeSourceOverride>
}

export interface KnowledgeEntryBase {
  id: string
  kind: KnowledgeKind
  title: string
  summary: string
  topics: string[]
  relatedIds: string[]
  sourcePath: string
  sourceRepo: string
  sourceRef: string
  sourceType: KnowledgeSourceType
  confidence: KnowledgeConfidence
  provenanceStatus?: KnowledgeProvenanceStatus
  upstreamSourcePath?: string
  upstreamSourceRepo?: string
  upstreamSourceRef?: string
  upstreamSourceType?: AuditSourceType
  versionRange?: string
  stability?: KnowledgeStability
}

export interface DocKnowledgeEntry extends KnowledgeEntryBase {
  kind: 'doc'
  slug: string
  description: string
  section: string
  order: number
  category?: string
  status?: KnowledgeStability
  sidebarLabel?: string
  playgroundScenario?: string
  body: string
}

export interface ExampleKnowledgeEntry extends KnowledgeEntryBase {
  kind: 'example'
  exampleId: string
  scenario: string
  description: string
  editableFields: string[]
  recommendedDocIds: string[]
  codeSourcePath?: string
  runtimeSourcePath?: string
  executionMode?: KnowledgeExecutionMode
  supportsDisplayedCodeParity?: boolean
  supportsRuntimeParity?: boolean
  requiresAdapter?: boolean
  adapterRisk?: AdapterRisk
  notes?: string[]
  suitableSurfaces?: KnowledgeSurface[]
}

export interface PluginKnowledgeEntry extends KnowledgeEntryBase {
  kind: 'plugin'
  pluginId: string
  description: string
  packageName?: string
  supportedOrms: string[]
  scenarios: string[]
  whenToUse: string[]
  whenNotToUse: string[]
  recommendedDocIds: string[]
  recommendedExampleIds: string[]
  recommendedRecipeIds: string[]
}

export interface RecipeKnowledgeEntry extends KnowledgeEntryBase {
  kind: 'recipe'
  recipeId: string
  description: string
  goal: string
  serverStacks: string[]
  orms: string[]
  scenarios: string[]
  steps: string[]
  recommendedPluginIds: string[]
  recommendedDocIds: string[]
  recommendedExampleIds: string[]
}

export interface TroubleshootingKnowledgeEntry extends KnowledgeEntryBase {
  kind: 'troubleshooting'
  issueId: string
  description: string
  symptoms: string[]
  stages: TroubleshootingStage[]
  scenarios: string[]
  likelyCauses: string[]
  recommendedChecks: string[]
  recommendedDocIds: string[]
  recommendedExampleIds: string[]
  recommendedRecipeIds: string[]
}

export type KnowledgeEntry =
  | DocKnowledgeEntry
  | ExampleKnowledgeEntry
  | PluginKnowledgeEntry
  | RecipeKnowledgeEntry
  | TroubleshootingKnowledgeEntry

export interface KnowledgeDiagnostic {
  level: 'info' | 'warning'
  code: string
  message: string
  entryId?: string
}

export type UpstreamAuditStatus = 'bootstrap' | 'full'
export type AuditedDocKind = 'canonical' | 'tutorial' | 'example' | 'troubleshooting'
export type AuditedAudienceLevel = 'introductory' | 'intermediate' | 'advanced' | 'mixed'
export type AuditedPackageRole = 'core' | 'plugin' | 'support' | 'internal'
export type PackageCapabilityParityStatus =
  | 'confirmed-public-api'
  | 'conceptual-pattern'
  | 'unresolved'
export type AuditConflictKind =
  | 'docs-vs-code'
  | 'docs-vs-package'
  | 'playground-vs-upstream'
  | 'version-ambiguity'

export interface AuditSourceReference {
  sourcePath: string
  sourceRepo: string
  sourceRef: string
  sourceType: AuditSourceType
}

export interface PackageCapabilityEvidence {
  sourcePath: string
  sourceType: AuditSourceType
  detail: string
}

export interface UpstreamAuditMetadata {
  status: UpstreamAuditStatus
  upstreamRepo: string
  auditedRef: string
  auditDate: string
  auditor: string
  workspaceVersionRange?: string
  installedGraphqlGeneVersion?: string | null
  installedPluginSequelizeVersion?: string | null
  limitations: string[]
}

export interface UpstreamRepositoryInventoryItem {
  path: string
  kind:
    | 'root-file'
    | 'docs-directory'
    | 'package-directory'
    | 'plugin-directory'
    | 'example-directory'
    | 'test-directory'
    | 'workspace-file'
  note: string
  exists: boolean
}

export interface AuditedDoc {
  sourcePath: string
  title: string
  summary: string
  topics: string[]
  kind: AuditedDocKind
  audienceLevel: AuditedAudienceLevel
  relatedPackages: string[]
  observedCapabilities: string[]
  confidence: KnowledgeConfidence
  source: AuditSourceReference
  workspaceProjectionPath?: string
}

export interface AuditedPackage {
  packageName: string
  sourcePath: string
  role: AuditedPackageRole
  summary: string
  exportsOfInterest: string[]
  relatedDocs: string[]
  confidence: KnowledgeConfidence
  source: AuditSourceReference
}

export interface AuditedPackageCapability {
  capabilityId: string
  title: string
  summary: string
  packageNames: string[]
  docsPaths: string[]
  relatedTaskIds: string[]
  paritySensitive: boolean
  status: PackageCapabilityParityStatus
  confirmedPublicApis: string[]
  missingPublicApis: string[]
  warnings: string[]
  evidence: PackageCapabilityEvidence[]
}

export interface PackageParityAudit {
  metadata: {
    auditDate: string
    workspaceGraphqlGeneRange: string | null
    workspacePluginSequelizeRange: string | null
    installedGraphqlGeneVersion: string | null
    installedPluginSequelizeVersion: string | null
  }
  capabilities: AuditedPackageCapability[]
  summary: {
    total: number
    paritySensitive: number
    unresolved: number
    warningCount: number
    byStatus: Record<PackageCapabilityParityStatus, number>
  }
}

export interface AuditedPlugin {
  pluginId: string
  packageName?: string
  targetOrms: string[]
  integrationStyle: string
  setupExpectations: string[]
  docsPaths: string[]
  evidencePaths: string[]
  confidence: KnowledgeConfidence
  source: AuditSourceReference
  workspaceProjectionPath?: string
}

export interface AuditedExample {
  sourcePath: string
  title: string
  capability: string
  relatedDocs: string[]
  relatedPackages: string[]
  suitableSurfaces: Array<'docs' | 'playground' | 'mcp'>
  paritySuitability: 'canonical' | 'adapted' | 'simulated' | 'unknown'
  confidence: KnowledgeConfidence
  source: AuditSourceReference
  workspaceProjectionPath?: string
}

export interface AuditConceptNode {
  conceptId: string
  summary: string
  requiredDocs: string[]
  requiredPackages: string[]
  relatedExamples: string[]
  relatedTasks: string[]
}

export interface AuditedScenario {
  scenarioId: string
  goal: string
  trigger: string
  requiredConcepts: string[]
  requiredPackages: string[]
  requiredDocs: string[]
  requiredExamples: string[]
  recommendedMcpResources: string[]
  recommendedMcpPrompts: string[]
  recommendedMcpTools: string[]
}

export interface AuditConflict {
  id: string
  kind: AuditConflictKind
  summary: string
  conflictingSources: string[]
  currentBestJudgment: string
  recommendedResolutionRule: string
  severity: 'info' | 'warning'
}

export interface UpstreamAuditSnapshot {
  metadata: UpstreamAuditMetadata
  repositoryInventory: UpstreamRepositoryInventoryItem[]
  docs: AuditedDoc[]
  packages: AuditedPackage[]
  packageParity: PackageParityAudit
  plugins: AuditedPlugin[]
  examples: AuditedExample[]
  conceptMap: AuditConceptNode[]
  scenarios: AuditedScenario[]
  conflicts: AuditConflict[]
  provenanceSummary: {
    sourceTypeCounts: Record<string, number>
    sourceRepoCounts: Record<string, number>
    confidenceCounts: Record<KnowledgeConfidence, number>
  }
  coverage: {
    docs: number
    packages: number
    capabilities: number
    plugins: number
    examples: number
    scenarios: number
    conflicts: number
  }
}

export interface KnowledgeCatalog {
  generatedAt: string
  counts: {
    docs: number
    examples: number
    plugins: number
    recipes: number
    troubleshooting: number
    entries: number
  }
  docs: DocKnowledgeEntry[]
  examples: ExampleKnowledgeEntry[]
  plugins: PluginKnowledgeEntry[]
  recipes: RecipeKnowledgeEntry[]
  troubleshooting: TroubleshootingKnowledgeEntry[]
  entries: KnowledgeEntry[]
  byId: Record<string, KnowledgeEntry>
  diagnostics: KnowledgeDiagnostic[]
  audit?: UpstreamAuditSnapshot
}

export interface BuildKnowledgeCatalogOptions {
  workspaceRoot: string
  docsRoot: string
  docsConfig: DocsConfigContract
  examples: PlaygroundExampleContract[]
  curatedExamples: CuratedExampleKnowledgeContract[]
  plugins: PluginKnowledgeContract[]
  recipes: RecipeKnowledgeContract[]
  troubleshooting: TroubleshootingKnowledgeContract[]
  sourceRepo?: string
  sourceRef?: string
  exampleCatalogSourcePath?: string
  exampleRuntimeSourcePath?: string
  versionRange?: string
  provenanceOverrides?: KnowledgeProvenanceOverrides
}
