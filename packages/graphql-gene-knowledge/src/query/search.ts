import type {
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  KnowledgeEntry,
  KnowledgeKind,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
} from '../contracts'

export interface SearchKnowledgeOptions {
  query: string
  kind?: KnowledgeKind
  section?: string
  scenario?: string
  limit?: number
}

export interface KnowledgeSearchHit {
  entry: KnowledgeEntry
  score: number
  matchedFields: string[]
}

export function searchKnowledgeCatalog(
  catalog: KnowledgeCatalog,
  options: SearchKnowledgeOptions,
): KnowledgeSearchHit[] {
  const trimmedQuery = options.query.trim()
  if (!trimmedQuery) {
    return []
  }

  const tokens = tokenize(trimmedQuery)
  if (!tokens.length) {
    return []
  }

  return catalog.entries
    .filter(entry => matchesFilters(entry, options))
    .map((entry) => {
      const match = scoreEntry(entry, trimmedQuery, tokens)
      return match ? { entry, ...match } : null
    })
    .filter((hit): hit is KnowledgeSearchHit => Boolean(hit))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score
      }

      if (left.entry.kind !== right.entry.kind) {
        return left.entry.kind.localeCompare(right.entry.kind)
      }

      return left.entry.title.localeCompare(right.entry.title)
    })
    .slice(0, normalizeLimit(options.limit))
}

function matchesFilters(entry: KnowledgeEntry, options: SearchKnowledgeOptions) {
  if (options.kind && entry.kind !== options.kind) {
    return false
  }

  if (options.section && entry.kind === 'doc' && entry.section !== options.section) {
    return false
  }

  if (options.section && entry.kind !== 'doc') {
    return false
  }

  if (options.scenario && !entryHasScenario(entry, options.scenario)) {
    return false
  }

  return true
}

function entryHasScenario(entry: KnowledgeEntry, scenario: string) {
  switch (entry.kind) {
    case 'doc':
      return entry.playgroundScenario === scenario
    case 'example':
      return entry.scenario === scenario
    case 'plugin':
    case 'recipe':
    case 'troubleshooting':
      return entry.scenarios.includes(scenario)
    default:
      return false
  }
}

function scoreEntry(entry: KnowledgeEntry, rawQuery: string, tokens: string[]) {
  let score = 0
  const matchedFields = new Set<string>()
  const normalizedQuery = normalize(rawQuery)
  const normalizedTitle = normalize(entry.title)
  const normalizedSummary = normalize(entry.summary)
  const normalizedTopics = entry.topics.map(topic => normalize(topic))
  const normalizedSourcePath = normalize(entry.sourcePath)

  if (normalizedTitle.includes(normalizedQuery)) {
    score += 20
    matchedFields.add('title')
  }

  if (normalizedSummary.includes(normalizedQuery)) {
    score += 12
    matchedFields.add('summary')
  }

  for (const token of tokens) {
    if (normalizedTitle.includes(token)) {
      score += 8
      matchedFields.add('title')
    }

    if (normalizedSummary.includes(token)) {
      score += 5
      matchedFields.add('summary')
    }

    if (normalizedTopics.some(topic => topic.includes(token))) {
      score += 6
      matchedFields.add('topics')
    }

    if (normalizedSourcePath.includes(token)) {
      score += 2
      matchedFields.add('sourcePath')
    }
  }

  switch (entry.kind) {
    case 'doc':
      score += scoreDocEntry(entry, normalizedQuery, tokens, matchedFields)
      break
    case 'example':
      score += scoreExampleEntry(entry, normalizedQuery, tokens, matchedFields)
      break
    case 'plugin':
      score += scorePluginEntry(entry, normalizedQuery, tokens, matchedFields)
      break
    case 'recipe':
      score += scoreRecipeEntry(entry, normalizedQuery, tokens, matchedFields)
      break
    case 'troubleshooting':
      score += scoreTroubleshootingEntry(entry, normalizedQuery, tokens, matchedFields)
      break
  }

  score += kindBias(entry.kind)

  if (score === 0) {
    return null
  }

  return {
    score,
    matchedFields: [...matchedFields].sort((left, right) => left.localeCompare(right)),
  }
}

function scoreDocEntry(
  entry: Extract<KnowledgeEntry, { kind: 'doc' }>,
  normalizedQuery: string,
  tokens: string[],
  matchedFields: Set<string>,
) {
  let score = 0
  const normalizedSlug = normalize(entry.slug)
  const normalizedBody = normalize(entry.body)
  const normalizedDescription = normalize(entry.description)

  if (normalizedSlug.includes(normalizedQuery)) {
    score += 10
    matchedFields.add('slug')
  }

  for (const token of tokens) {
    if (normalizedDescription.includes(token)) {
      score += 4
      matchedFields.add('description')
    }

    if (normalizedBody.includes(token)) {
      score += 2
      matchedFields.add('body')
    }
  }

  return score
}

function scoreExampleEntry(
  example: ExampleKnowledgeEntry,
  normalizedQuery: string,
  tokens: string[],
  matchedFields: Set<string>,
) {
  let score = 0
  const normalizedScenario = normalize(example.scenario)
  const normalizedDescription = normalize(example.description)
  const normalizedEditableFields = example.editableFields.map(field => normalize(field))

  if (normalizedScenario.includes(normalizedQuery)) {
    score += 12
    matchedFields.add('scenario')
  }

  for (const token of tokens) {
    if (normalizedScenario.includes(token)) {
      score += 6
      matchedFields.add('scenario')
    }

    if (normalizedDescription.includes(token)) {
      score += 4
      matchedFields.add('description')
    }

    if (normalizedEditableFields.some(field => field.includes(token))) {
      score += 3
      matchedFields.add('editableFields')
    }
  }

  return score
}

function scorePluginEntry(
  entry: PluginKnowledgeEntry,
  normalizedQuery: string,
  tokens: string[],
  matchedFields: Set<string>,
) {
  let score = 0
  const normalizedDescription = normalize(entry.description)
  const normalizedPackageName = normalize(entry.packageName ?? '')
  const normalizedOrms = entry.supportedOrms.map(value => normalize(value))
  const normalizedWhenToUse = entry.whenToUse.map(value => normalize(value))
  const normalizedWhenNotToUse = entry.whenNotToUse.map(value => normalize(value))

  if (normalizedPackageName && normalizedPackageName.includes(normalizedQuery)) {
    score += 14
    matchedFields.add('packageName')
  }

  for (const token of tokens) {
    if (normalizedDescription.includes(token)) {
      score += 4
      matchedFields.add('description')
    }

    if (normalizedPackageName.includes(token)) {
      score += 7
      matchedFields.add('packageName')
    }

    if (normalizedOrms.some(value => value.includes(token))) {
      score += 5
      matchedFields.add('supportedOrms')
    }

    if (normalizedWhenToUse.some(value => value.includes(token))) {
      score += 3
      matchedFields.add('whenToUse')
    }

    if (normalizedWhenNotToUse.some(value => value.includes(token))) {
      score += 2
      matchedFields.add('whenNotToUse')
    }
  }

  return score
}

function scoreRecipeEntry(
  entry: RecipeKnowledgeEntry,
  normalizedQuery: string,
  tokens: string[],
  matchedFields: Set<string>,
) {
  let score = 0
  const normalizedDescription = normalize(entry.description)
  const normalizedGoal = normalize(entry.goal)
  const normalizedServerStacks = entry.serverStacks.map(value => normalize(value))
  const normalizedOrms = entry.orms.map(value => normalize(value))
  const normalizedSteps = entry.steps.map(value => normalize(value))

  if (normalizedGoal.includes(normalizedQuery)) {
    score += 14
    matchedFields.add('goal')
  }

  for (const token of tokens) {
    if (normalizedDescription.includes(token)) {
      score += 4
      matchedFields.add('description')
    }

    if (normalizedGoal.includes(token)) {
      score += 6
      matchedFields.add('goal')
    }

    if (normalizedServerStacks.some(value => value.includes(token))) {
      score += 4
      matchedFields.add('serverStacks')
    }

    if (normalizedOrms.some(value => value.includes(token))) {
      score += 4
      matchedFields.add('orms')
    }

    if (normalizedSteps.some(value => value.includes(token))) {
      score += 2
      matchedFields.add('steps')
    }
  }

  return score
}

function scoreTroubleshootingEntry(
  entry: TroubleshootingKnowledgeEntry,
  normalizedQuery: string,
  tokens: string[],
  matchedFields: Set<string>,
) {
  let score = 0
  const normalizedDescription = normalize(entry.description)
  const normalizedSymptoms = entry.symptoms.map(value => normalize(value))
  const normalizedLikelyCauses = entry.likelyCauses.map(value => normalize(value))
  const normalizedRecommendedChecks = entry.recommendedChecks.map(value => normalize(value))
  const normalizedStages = entry.stages.map(value => normalize(value))

  if (normalizedSymptoms.some(value => value.includes(normalizedQuery))) {
    score += 14
    matchedFields.add('symptoms')
  }

  for (const token of tokens) {
    if (normalizedDescription.includes(token)) {
      score += 4
      matchedFields.add('description')
    }

    if (normalizedSymptoms.some(value => value.includes(token))) {
      score += 6
      matchedFields.add('symptoms')
    }

    if (normalizedLikelyCauses.some(value => value.includes(token))) {
      score += 4
      matchedFields.add('likelyCauses')
    }

    if (normalizedRecommendedChecks.some(value => value.includes(token))) {
      score += 3
      matchedFields.add('recommendedChecks')
    }

    if (normalizedStages.some(value => value.includes(token))) {
      score += 5
      matchedFields.add('stages')
    }
  }

  return score
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

function normalizeLimit(limit?: number) {
  const value = Number.isFinite(limit) ? Number(limit) : 10
  return Math.min(Math.max(Math.trunc(value), 1), 25)
}

function kindBias(kind: KnowledgeKind) {
  switch (kind) {
    case 'doc':
      return 40
    case 'example':
      return 15
    case 'plugin':
      return 8
    case 'recipe':
      return 5
    case 'troubleshooting':
      return 0
    default:
      return 0
  }
}
