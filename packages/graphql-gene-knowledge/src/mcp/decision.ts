import type {
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
} from '../contracts'

export interface PluginDecisionOptions {
  orm?: string
  goal?: string
  wantsCustomPlugin?: boolean
}

export interface RecipeDecisionOptions {
  goal: string
  serverStack?: string
  orm?: string
  concerns?: string[]
}

export interface TroubleshootingDecisionOptions {
  symptom: string
  context?: string
  stage?: string
}

export function selectPluginEntries(
  catalog: KnowledgeCatalog,
  options: PluginDecisionOptions,
  limit = 2,
) {
  const rawText = [options.goal, options.orm, options.wantsCustomPlugin ? 'custom plugin' : undefined]
    .filter(Boolean)
    .join(' ')
  const tokens = tokenize(rawText)

  return [...catalog.plugins]
    .map(entry => ({
      entry,
      score: scorePluginEntry(entry, tokens, options),
    }))
    .filter(result => result.score > 0)
    .sort(sortByScoreThenTitle)
    .slice(0, limit)
    .map(result => result.entry)
}

export function selectRecipeEntries(
  catalog: KnowledgeCatalog,
  options: RecipeDecisionOptions,
  limit = 3,
) {
  const rawText = [options.goal, options.serverStack, options.orm, ...(options.concerns ?? [])]
    .filter(Boolean)
    .join(' ')
  const tokens = tokenize(rawText)
  const inferredScenarios = inferScenarios(rawText)

  return [...catalog.recipes]
    .map(entry => ({
      entry,
      score: scoreRecipeEntry(entry, tokens, inferredScenarios, options),
    }))
    .filter(result => result.score > 0)
    .sort(sortByScoreThenTitle)
    .slice(0, limit)
    .map(result => result.entry)
}

export function selectTroubleshootingEntries(
  catalog: KnowledgeCatalog,
  options: TroubleshootingDecisionOptions,
  limit = 3,
) {
  const rawText = [options.symptom, options.context, options.stage]
    .filter(Boolean)
    .join(' ')
  const tokens = tokenize(rawText)
  const inferredScenarios = inferScenarios(rawText)

  return [...catalog.troubleshooting]
    .map(entry => ({
      entry,
      score: scoreTroubleshootingEntry(entry, tokens, inferredScenarios, options),
    }))
    .filter(result => result.score > 0)
    .sort(sortByScoreThenTitle)
    .slice(0, limit)
    .map(result => result.entry)
}

export function findDocsByIds(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.docs, ids)
}

export function findExamplesByIds(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.examples, ids)
}

export function findPluginsByIds(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.plugins, ids)
}

export function findRecipesByIds(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.recipes, ids)
}

export function findTroubleshootingByIds(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.troubleshooting, ids)
}

export function inferFocusArea(text: string) {
  const normalized = text.toLowerCase()

  if (normalized.includes('plugin')) return 'plugin'
  if (normalized.includes('directive') || normalized.includes('auth')) return 'directive'
  if (normalized.includes('block') || normalized.includes('cms') || normalized.includes('polymorphic')) return 'polymorphic'
  if (normalized.includes('query') || normalized.includes('lookahead')) return 'query'
  return 'schema'
}

export function inferScenarios(text: string) {
  const normalized = text.toLowerCase()
  const scenarios: string[] = []

  if (normalized.includes('directive') || normalized.includes('auth')) {
    scenarios.push('directive-middleware')
  }

  if (normalized.includes('query') || normalized.includes('lookahead') || normalized.includes('join')) {
    scenarios.push('query-lookahead')
  }

  if (normalized.includes('block') || normalized.includes('cms') || normalized.includes('polymorphic') || normalized.includes('fragment')) {
    scenarios.push('polymorphic-blocks')
  }

  if (
    normalized.includes('schema')
    || normalized.includes('model')
    || normalized.includes('plugin')
    || normalized.includes('install')
    || normalized.includes('generate')
  ) {
    scenarios.push('model-to-schema')
  }

  return [...new Set(scenarios)]
}

function scorePluginEntry(
  entry: PluginKnowledgeEntry,
  tokens: string[],
  options: PluginDecisionOptions,
) {
  let score = 0
  score += scoreTokenMatches(tokens, [
    entry.title,
    entry.summary,
    entry.description,
    entry.packageName,
    ...entry.topics,
    ...entry.supportedOrms,
    ...entry.whenToUse,
    ...entry.whenNotToUse,
  ])

  if (options.orm) {
    score += scoreOrmMatch(options.orm, entry.supportedOrms)
  }

  if (options.wantsCustomPlugin) {
    score += entry.pluginId === 'custom-plugin' ? 30 : -8
  }

  if (options.orm && !normalize(options.orm).includes('sequelize')) {
    score += entry.pluginId === 'custom-plugin' ? 18 : 0
  }

  if (options.orm && normalize(options.orm).includes('sequelize')) {
    score += entry.packageName === '@graphql-gene/plugin-sequelize' ? 18 : 0
  }

  return score
}

function scoreRecipeEntry(
  entry: RecipeKnowledgeEntry,
  tokens: string[],
  inferredScenarios: string[],
  options: RecipeDecisionOptions,
) {
  let score = 0
  score += scoreTokenMatches(tokens, [
    entry.title,
    entry.summary,
    entry.description,
    entry.goal,
    ...entry.topics,
    ...entry.serverStacks,
    ...entry.orms,
    ...entry.steps,
  ])

  if (options.serverStack) {
    score += scoreMembershipMatch(options.serverStack, entry.serverStacks, 16)
  }

  if (options.orm) {
    score += scoreOrmMatch(options.orm, entry.orms)
  }

  for (const scenario of inferredScenarios) {
    if (entry.scenarios.includes(scenario)) {
      score += 18
    }
  }

  return score
}

function scoreTroubleshootingEntry(
  entry: TroubleshootingKnowledgeEntry,
  tokens: string[],
  inferredScenarios: string[],
  options: TroubleshootingDecisionOptions,
) {
  let score = 0
  score += scoreTokenMatches(tokens, [
    entry.title,
    entry.summary,
    entry.description,
    ...entry.topics,
    ...entry.symptoms,
    ...entry.likelyCauses,
    ...entry.recommendedChecks,
    ...entry.stages,
  ])

  if (options.stage && entry.stages.includes(options.stage as TroubleshootingKnowledgeEntry['stages'][number])) {
    score += 22
  }

  for (const scenario of inferredScenarios) {
    if (entry.scenarios.includes(scenario)) {
      score += 14
    }
  }

  return score
}

function scoreTokenMatches(tokens: string[], values: Array<string | undefined>) {
  const normalizedValues = values
    .filter((value): value is string => Boolean(value))
    .map(value => normalize(value))
  let score = 0

  for (const token of tokens) {
    for (const value of normalizedValues) {
      if (value.includes(token)) {
        score += token.length >= 6 ? 6 : 4
      }
    }
  }

  return score
}

function scoreOrmMatch(rawOrm: string, supportedOrms: string[]) {
  const orm = normalize(rawOrm)
  let score = 0

  for (const supportedOrm of supportedOrms) {
    const normalizedSupportedOrm = normalize(supportedOrm)

    if (normalizedSupportedOrm.includes(orm) || orm.includes(normalizedSupportedOrm)) {
      score += 18
      continue
    }

    if (!orm.includes('sequelize') && (normalizedSupportedOrm.includes('custom') || normalizedSupportedOrm.includes('non-sequelize'))) {
      score += 12
    }
  }

  return score
}

function scoreMembershipMatch(rawValue: string, candidates: string[], points: number) {
  const normalizedValue = normalize(rawValue)
  return candidates.some(candidate => {
    const normalizedCandidate = normalize(candidate)
    return normalizedCandidate.includes(normalizedValue) || normalizedValue.includes(normalizedCandidate)
  })
    ? points
    : 0
}

function mapByIds<T extends { id: string }>(entries: T[], ids: string[]) {
  const idsSet = new Set(ids)
  return entries.filter(entry => idsSet.has(entry.id))
}

function sortByScoreThenTitle<T extends { title: string }>(
  left: { entry: T, score: number },
  right: { entry: T, score: number },
) {
  if (left.score !== right.score) {
    return right.score - left.score
  }

  return left.entry.title.localeCompare(right.entry.title)
}

function tokenize(value: string) {
  return normalize(value)
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 2)
}

function normalize(value: string) {
  return value.toLowerCase()
}
