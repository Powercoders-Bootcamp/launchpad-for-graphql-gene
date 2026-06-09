export type KnowledgeKind = 'doc' | 'example' | 'plugin' | 'recipe' | 'troubleshooting'

export type KnowledgeSourceType =
  | 'canonical-doc'
  | 'canonical-code'
  | 'canonical-curation'
  | 'canonical-test'
  | 'demo-catalog'
  | 'demo-runtime'

export type KnowledgeConfidence = 'high' | 'medium' | 'low'
export type KnowledgeExecutionMode = 'canonical' | 'adapted' | 'simulated'
export type KnowledgeStability = 'stable' | 'experimental' | 'planned' | 'deprecated'
export type AdapterRisk = 'low' | 'medium' | 'high'
export type TroubleshootingStage = 'install' | 'schema' | 'runtime' | 'plugin' | 'query' | 'directive'

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
}

export interface BuildKnowledgeCatalogOptions {
  workspaceRoot: string
  docsRoot: string
  docsConfig: DocsConfigContract
  examples: PlaygroundExampleContract[]
  plugins: PluginKnowledgeContract[]
  recipes: RecipeKnowledgeContract[]
  troubleshooting: TroubleshootingKnowledgeContract[]
  sourceRepo?: string
  sourceRef?: string
  exampleCatalogSourcePath?: string
  exampleRuntimeSourcePath?: string
  versionRange?: string
}
