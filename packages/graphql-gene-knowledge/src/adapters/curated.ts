import type {
  BuildKnowledgeCatalogOptions,
  KnowledgeSourceOverride,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
} from '../contracts'

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
    'plugins' | 'recipes' | 'troubleshooting' | 'sourceRepo' | 'sourceRef' | 'versionRange' | 'provenanceOverrides'
  >,
): {
  plugins: PluginKnowledgeEntry[]
  recipes: RecipeKnowledgeEntry[]
  troubleshooting: TroubleshootingKnowledgeEntry[]
} {
  return {
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

function ensureArray(values?: string[]) {
  return values ? [...values] : []
}

function compact(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value))
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

function applySourceOverride<
  T extends PluginKnowledgeEntry | RecipeKnowledgeEntry | TroubleshootingKnowledgeEntry,
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
