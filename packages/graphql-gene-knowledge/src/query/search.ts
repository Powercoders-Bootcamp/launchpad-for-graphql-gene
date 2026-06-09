import type { ExampleKnowledgeEntry, KnowledgeCatalog, KnowledgeEntry, KnowledgeKind } from '../contracts'

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

  if (options.scenario && entry.kind === 'example' && entry.scenario !== options.scenario) {
    return false
  }

  if (options.scenario && entry.kind === 'doc' && entry.playgroundScenario !== options.scenario) {
    return false
  }

  return true
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

  if (entry.kind === 'doc') {
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
  }
  else {
    const example = entry as ExampleKnowledgeEntry
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
  }

  if (score === 0) {
    return null
  }

  return {
    score,
    matchedFields: [...matchedFields].sort((left, right) => left.localeCompare(right)),
  }
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
