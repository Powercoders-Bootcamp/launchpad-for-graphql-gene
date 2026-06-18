import type {
  BuildKnowledgeCatalogOptions,
  ExampleKnowledgeEntry,
  KnowledgeSurface,
  KnowledgeSourceOverride,
  CuratedExampleKnowledgeContract,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
} from '../contracts'

export function createExampleId(scenario: string, exampleId: string) {
  return `example:${scenario}:${exampleId}`
}

export function createPluginId(pluginId: string) {
  return `plugin:${pluginId}`
}

export function createRecipeId(recipeId: string) {
  return `recipe:${recipeId}`
}

export function createTroubleshootingId(issueId: string) {
  return `troubleshooting:${issueId}`
}

export function loadCuratedKnowledgeEntries(
  options: Pick<
    BuildKnowledgeCatalogOptions,
    'curatedExamples' | 'plugins' | 'recipes' | 'troubleshooting' | 'sourceRepo' | 'sourceRef' | 'versionRange' | 'provenanceOverrides'
  >,
): {
  examples: ExampleKnowledgeEntry[]
  plugins: PluginKnowledgeEntry[]
  recipes: RecipeKnowledgeEntry[]
  troubleshooting: TroubleshootingKnowledgeEntry[]
} {
  return {
    examples: options.curatedExamples.map((example) => {
      const key = `${example.scenario}:${example.id}`
      return applySourceOverride(createCuratedExampleEntry(example, options), options.provenanceOverrides?.examplesByKey?.[key])
    }),
    plugins: options.plugins.map((plugin) => applySourceOverride({
      id: createPluginId(plugin.id),
      kind: 'plugin',
      pluginId: plugin.id,
      title: plugin.title,
      summary: plugin.summary,
      description: plugin.description,
      topics: compact([
        'plugin',
        ...(plugin.topics ?? []),
        plugin.packageName,
        ...ensureArray(plugin.supportedOrms),
        ...ensureArray(plugin.scenarios),
      ]),
      relatedIds: uniqueStrings([
        ...plugin.recommendedDocIds,
        ...ensureArray(plugin.recommendedExampleIds),
        ...ensureArray(plugin.recommendedRecipeIds),
      ]),
      sourcePath: plugin.sourcePath,
      sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
      sourceRef: options.sourceRef ?? 'workspace',
      sourceType: 'canonical-curation',
      confidence: plugin.confidence ?? 'high',
      versionRange: options.versionRange,
      stability: plugin.stability ?? 'stable',
      packageName: plugin.packageName,
      supportedOrms: ensureArray(plugin.supportedOrms),
      scenarios: ensureArray(plugin.scenarios),
      whenToUse: plugin.whenToUse,
      whenNotToUse: ensureArray(plugin.whenNotToUse),
      recommendedDocIds: plugin.recommendedDocIds,
      recommendedExampleIds: ensureArray(plugin.recommendedExampleIds),
      recommendedRecipeIds: ensureArray(plugin.recommendedRecipeIds),
    }, options.provenanceOverrides?.pluginsById?.[plugin.id])),
    recipes: options.recipes.map((recipe) => applySourceOverride({
      id: createRecipeId(recipe.id),
      kind: 'recipe',
      recipeId: recipe.id,
      title: recipe.title,
      summary: recipe.summary,
      description: recipe.description,
      topics: compact([
        'recipe',
        ...(recipe.topics ?? []),
        ...ensureArray(recipe.serverStacks),
        ...ensureArray(recipe.orms),
        ...ensureArray(recipe.scenarios),
      ]),
      relatedIds: uniqueStrings([
        ...ensureArray(recipe.recommendedPluginIds),
        ...recipe.recommendedDocIds,
        ...ensureArray(recipe.recommendedExampleIds),
      ]),
      sourcePath: recipe.sourcePath,
      sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
      sourceRef: options.sourceRef ?? 'workspace',
      sourceType: 'canonical-curation',
      confidence: recipe.confidence ?? 'high',
      versionRange: options.versionRange,
      stability: recipe.stability ?? 'stable',
      goal: recipe.goal,
      serverStacks: ensureArray(recipe.serverStacks),
      orms: ensureArray(recipe.orms),
      scenarios: ensureArray(recipe.scenarios),
      steps: recipe.steps,
      recommendedPluginIds: ensureArray(recipe.recommendedPluginIds),
      recommendedDocIds: recipe.recommendedDocIds,
      recommendedExampleIds: ensureArray(recipe.recommendedExampleIds),
    }, options.provenanceOverrides?.recipesById?.[recipe.id])),
    troubleshooting: options.troubleshooting.map((issue) => applySourceOverride({
      id: createTroubleshootingId(issue.id),
      kind: 'troubleshooting',
      issueId: issue.id,
      title: issue.title,
      summary: issue.summary,
      description: issue.description,
      topics: compact([
        'troubleshooting',
        ...(issue.topics ?? []),
        ...issue.stages,
        ...ensureArray(issue.scenarios),
      ]),
      relatedIds: uniqueStrings([
        ...issue.recommendedDocIds,
        ...ensureArray(issue.recommendedExampleIds),
        ...ensureArray(issue.recommendedRecipeIds),
      ]),
      sourcePath: issue.sourcePath,
      sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
      sourceRef: options.sourceRef ?? 'workspace',
      sourceType: 'canonical-curation',
      confidence: issue.confidence ?? 'high',
      versionRange: options.versionRange,
      stability: issue.stability ?? 'stable',
      symptoms: issue.symptoms,
      stages: issue.stages,
      scenarios: ensureArray(issue.scenarios),
      likelyCauses: issue.likelyCauses,
      recommendedChecks: issue.recommendedChecks,
      recommendedDocIds: issue.recommendedDocIds,
      recommendedExampleIds: ensureArray(issue.recommendedExampleIds),
      recommendedRecipeIds: ensureArray(issue.recommendedRecipeIds),
    }, options.provenanceOverrides?.troubleshootingById?.[issue.id])),
  }
}

function createCuratedExampleEntry(
  example: CuratedExampleKnowledgeContract,
  options: Pick<
    BuildKnowledgeCatalogOptions,
    'sourceRepo' | 'sourceRef' | 'versionRange'
  >,
): ExampleKnowledgeEntry {
  return {
    id: createExampleId(example.scenario, example.id),
    kind: 'example',
    title: example.title,
    summary: example.summary,
    topics: compact([
      'example',
      example.scenario,
      ...(example.topics ?? []),
    ]),
    relatedIds: uniqueStrings(ensureArray(example.recommendedDocIds)),
    sourcePath: example.sourcePath,
    sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
    sourceRef: options.sourceRef ?? 'workspace',
    sourceType: 'canonical-curation',
    confidence: example.confidence ?? 'high',
    versionRange: options.versionRange,
    stability: example.stability ?? 'stable',
    exampleId: example.id,
    scenario: example.scenario,
    description: example.description,
    editableFields: ensureArray(example.editableFields),
    recommendedDocIds: ensureArray(example.recommendedDocIds),
    codeSourcePath: example.codeSourcePath,
    runtimeSourcePath: example.runtimeSourcePath,
    executionMode: example.executionMode ?? 'canonical',
    supportsDisplayedCodeParity: example.supportsDisplayedCodeParity ?? true,
    supportsRuntimeParity: example.supportsRuntimeParity ?? true,
    requiresAdapter: example.requiresAdapter ?? false,
    adapterRisk: example.adapterRisk,
    notes: ensureArray(example.notes),
    suitableSurfaces: ensureSurfaces(example.suitableSurfaces),
  }
}

function ensureArray(values?: string[]) {
  return values ? [...values] : []
}

function ensureSurfaces(values?: KnowledgeSurface[]) {
  return values?.length ? [...values] : ['docs', 'mcp']
}

function compact(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value))
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

function applySourceOverride<
  T extends ExampleKnowledgeEntry | PluginKnowledgeEntry | RecipeKnowledgeEntry | TroubleshootingKnowledgeEntry,
>(entry: T, override?: KnowledgeSourceOverride): T {
  if (!override) {
    return entry
  }

  return {
    ...entry,
    provenanceStatus: override.provenanceStatus,
    upstreamSourcePath: override.upstreamSourcePath,
    upstreamSourceRepo: override.upstreamSourceRepo,
    upstreamSourceRef: override.upstreamSourceRef,
    upstreamSourceType: override.upstreamSourceType,
  }
}
