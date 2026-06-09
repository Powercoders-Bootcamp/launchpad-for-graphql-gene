import type {
  BuildKnowledgeCatalogOptions,
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  KnowledgeDiagnostic,
  KnowledgeEntry,
} from '../contracts'
import { createExampleId, loadPlaygroundKnowledgeEntries } from '../adapters/playground'
import { loadDocKnowledgeEntries } from '../adapters/docs'

export function buildKnowledgeCatalog(options: BuildKnowledgeCatalogOptions): KnowledgeCatalog {
  const docDrafts = loadDocKnowledgeEntries(options)
  const docIdsBySlug = new Map(docDrafts.map(doc => [doc.slug, doc.id]))
  const examples = loadPlaygroundKnowledgeEntries(options)
  const exampleIdsByScenario = groupExampleIdsByScenario(examples)

  const docs = docDrafts
    .map((doc) => {
      const docRelatedIds = doc.relatedSlugs
        .map(slug => docIdsBySlug.get(slug))
        .filter((id): id is string => Boolean(id))
      const exampleRelatedIds = doc.playgroundScenario
        ? exampleIdsByScenario.get(doc.playgroundScenario) ?? []
        : []

      return sortRelatedIds({
        ...doc,
        relatedIds: uniqueStrings([...docRelatedIds, ...exampleRelatedIds]),
      })
    })
    .map(({ relatedSlugs: _relatedSlugs, ...doc }) => doc)
    .sort((left, right) => sortDocs(left, right, options))

  const recommendedDocIdsByScenario = groupDocIdsByScenario(docs)

  const normalizedExamples = examples
    .map((example) => {
      const recommendedDocIds = recommendedDocIdsByScenario.get(example.scenario) ?? []

      return sortRelatedIds({
        ...example,
        relatedIds: uniqueStrings([...example.relatedIds, ...recommendedDocIds]),
        recommendedDocIds,
      })
    })
    .sort(sortExamples)

  const entries = [...docs, ...normalizedExamples].sort(sortEntries)
  const byId = Object.fromEntries(entries.map(entry => [entry.id, entry]))
  const diagnostics = buildDiagnostics(normalizedExamples)

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      docs: docs.length,
      examples: normalizedExamples.length,
      entries: entries.length,
    },
    docs,
    examples: normalizedExamples,
    entries,
    byId,
    diagnostics,
  }
}

function groupExampleIdsByScenario(examples: ExampleKnowledgeEntry[]) {
  const grouped = new Map<string, string[]>()

  for (const example of examples) {
    const ids = grouped.get(example.scenario) ?? []
    ids.push(createExampleId(example.scenario, example.exampleId))
    grouped.set(example.scenario, ids)
  }

  return grouped
}

function groupDocIdsByScenario(docs: DocKnowledgeEntry[]) {
  const grouped = new Map<string, string[]>()

  for (const doc of docs) {
    if (!doc.playgroundScenario) {
      continue
    }

    const ids = grouped.get(doc.playgroundScenario) ?? []
    ids.push(doc.id)
    grouped.set(doc.playgroundScenario, ids)
  }

  return grouped
}

function buildDiagnostics(examples: ExampleKnowledgeEntry[]): KnowledgeDiagnostic[] {
  const diagnostics: KnowledgeDiagnostic[] = []

  diagnostics.push({
    level: 'info',
    code: 'PLAYGROUND_CATALOG_NORMALIZED',
    message: `Normalized ${examples.length} playground examples into canonical entries.`,
  })

  for (const example of examples) {
    if (example.executionMode !== 'canonical') {
      diagnostics.push({
        level: 'warning',
        code: 'PLAYGROUND_RUNTIME_NOT_CANONICAL',
        message: `Example "${example.id}" is currently exposed through an ${example.executionMode} runtime.`,
        entryId: example.id,
      })
    }
  }

  return diagnostics
}

function sortDocs(left: DocKnowledgeEntry, right: DocKnowledgeEntry, options: BuildKnowledgeCatalogOptions) {
  const sectionOrder = new Map(options.docsConfig.sections.map(section => [section.id, section.order]))
  const leftOrder = sectionOrder.get(left.section) ?? Number.MAX_SAFE_INTEGER
  const rightOrder = sectionOrder.get(right.section) ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  if (left.order !== right.order) {
    return left.order - right.order
  }

  return left.slug.localeCompare(right.slug)
}

function sortExamples(left: ExampleKnowledgeEntry, right: ExampleKnowledgeEntry) {
  if (left.scenario !== right.scenario) {
    return left.scenario.localeCompare(right.scenario)
  }

  return left.title.localeCompare(right.title)
}

function sortEntries(left: KnowledgeEntry, right: KnowledgeEntry) {
  if (left.kind !== right.kind) {
    return left.kind.localeCompare(right.kind)
  }

  return left.id.localeCompare(right.id)
}

function sortRelatedIds<T extends { relatedIds: string[] }>(entry: T): T {
  return {
    ...entry,
    relatedIds: [...entry.relatedIds].sort((left, right) => left.localeCompare(right)),
  }
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}
