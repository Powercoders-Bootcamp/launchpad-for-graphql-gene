import { loadCuratedKnowledgeEntries } from '../adapters/curated'
import { loadDocKnowledgeEntries } from '../adapters/docs'
import { loadPlaygroundKnowledgeEntries } from '../adapters/playground'
import type {
  BuildKnowledgeCatalogOptions,
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  KnowledgeDiagnostic,
  KnowledgeEntry,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
} from '../contracts'

export function buildKnowledgeCatalog(options: BuildKnowledgeCatalogOptions): KnowledgeCatalog {
  const docDrafts = loadDocKnowledgeEntries(options)
  const docIdsBySlug = new Map(docDrafts.map(doc => [doc.slug, doc.id]))
  const playgroundExamples = loadPlaygroundKnowledgeEntries(options)
  const curated = loadCuratedKnowledgeEntries(options)
  const examples = [...playgroundExamples, ...curated.examples]
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

  const recommendedDocIdsByScenario = groupDocIdsByScenario(docs)

  const normalizedExamples = examples
    .map((example) => {
      const recommendedDocIds = uniqueStrings([
        ...example.recommendedDocIds,
        ...(recommendedDocIdsByScenario.get(example.scenario) ?? []),
      ])

      return sortRelatedIds({
        ...example,
        relatedIds: uniqueStrings([...example.relatedIds, ...recommendedDocIds]),
        recommendedDocIds,
      })
    })

  const linkedEntries = createBidirectionalKnowledgeGraph([
    ...docs,
    ...normalizedExamples,
    ...curated.plugins,
    ...curated.recipes,
    ...curated.troubleshooting,
  ])

  const normalizedDocs = linkedEntries
    .filter((entry): entry is DocKnowledgeEntry => entry.kind === 'doc')
    .sort((left, right) => sortDocs(left, right, options))

  const normalizedPluginEntries = linkedEntries
    .filter((entry): entry is PluginKnowledgeEntry => entry.kind === 'plugin')
    .sort(sortNamedEntries)

  const normalizedRecipeEntries = linkedEntries
    .filter((entry): entry is RecipeKnowledgeEntry => entry.kind === 'recipe')
    .sort(sortNamedEntries)

  const normalizedTroubleshootingEntries = linkedEntries
    .filter((entry): entry is TroubleshootingKnowledgeEntry => entry.kind === 'troubleshooting')
    .sort(sortNamedEntries)

  const normalizedExampleEntries = linkedEntries
    .filter((entry): entry is ExampleKnowledgeEntry => entry.kind === 'example')
    .sort(sortExamples)

  const entries = [
    ...normalizedDocs,
    ...normalizedExampleEntries,
    ...normalizedPluginEntries,
    ...normalizedRecipeEntries,
    ...normalizedTroubleshootingEntries,
  ].sort(sortEntries)

  const byId = Object.fromEntries(entries.map(entry => [entry.id, entry]))
  const diagnostics = buildDiagnostics({
    playgroundExamples: normalizedExampleEntries.filter(example => example.sourceType === 'demo-catalog'),
    curatedExamples: normalizedExampleEntries.filter(example => example.sourceType !== 'demo-catalog'),
    examples: normalizedExampleEntries,
    plugins: normalizedPluginEntries,
    recipes: normalizedRecipeEntries,
    troubleshooting: normalizedTroubleshootingEntries,
  })

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      docs: normalizedDocs.length,
      examples: normalizedExampleEntries.length,
      plugins: normalizedPluginEntries.length,
      recipes: normalizedRecipeEntries.length,
      troubleshooting: normalizedTroubleshootingEntries.length,
      entries: entries.length,
    },
    docs: normalizedDocs,
    examples: normalizedExampleEntries,
    plugins: normalizedPluginEntries,
    recipes: normalizedRecipeEntries,
    troubleshooting: normalizedTroubleshootingEntries,
    entries,
    byId,
    diagnostics,
  }
}

function groupExampleIdsByScenario(examples: ExampleKnowledgeEntry[]) {
  const grouped = new Map<string, string[]>()

  for (const example of examples) {
    const ids = grouped.get(example.scenario) ?? []
    ids.push(example.id)
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

function createBidirectionalKnowledgeGraph(entries: KnowledgeEntry[]) {
  const idSet = new Set(entries.map(entry => entry.id))
  const relations = new Map(entries.map(entry => [entry.id, new Set<string>()]))

  for (const entry of entries) {
    const entryRelations = relations.get(entry.id)
    if (!entryRelations) {
      continue
    }

    for (const relatedId of entry.relatedIds) {
      if (!idSet.has(relatedId) || relatedId === entry.id) {
        continue
      }

      entryRelations.add(relatedId)
      relations.get(relatedId)?.add(entry.id)
    }
  }

  return entries.map((entry) => ({
    ...entry,
    relatedIds: [...(relations.get(entry.id) ?? new Set<string>())].sort((left, right) => left.localeCompare(right)),
  }))
}

function buildDiagnostics(options: {
  playgroundExamples: ExampleKnowledgeEntry[]
  curatedExamples: ExampleKnowledgeEntry[]
  examples: ExampleKnowledgeEntry[]
  plugins: PluginKnowledgeEntry[]
  recipes: RecipeKnowledgeEntry[]
  troubleshooting: TroubleshootingKnowledgeEntry[]
}): KnowledgeDiagnostic[] {
  const diagnostics: KnowledgeDiagnostic[] = []

  diagnostics.push({
    level: 'info',
    code: 'PLAYGROUND_CATALOG_NORMALIZED',
    message: `Normalized ${options.playgroundExamples.length} playground examples into knowledge entries.`,
  })

  diagnostics.push({
    level: 'info',
    code: 'CURATED_EXAMPLE_CATALOG_NORMALIZED',
    message: `Normalized ${options.curatedExamples.length} curated source-backed examples into canonical entries.`,
  })

  diagnostics.push({
    level: 'info',
    code: 'CURATED_KNOWLEDGE_NORMALIZED',
    message: `Normalized ${options.plugins.length + options.recipes.length + options.troubleshooting.length} curated knowledge entries for plugins, recipes, and troubleshooting.`,
  })

  diagnostics.push({
    level: 'info',
    code: 'PLAYGROUND_PARITY_GATES_REQUIRED',
    message: 'Playground scenarios require maintainer parity gates before new scenario implementations are treated as source-aligned.',
  })

  for (const example of options.examples) {
    if (example.executionMode !== 'canonical') {
      diagnostics.push({
        level: 'warning',
        code: 'PLAYGROUND_RUNTIME_NOT_CANONICAL',
        message: `Example "${example.id}" is currently exposed through an ${example.executionMode} runtime.`,
        entryId: example.id,
      })
    }

    if (example.supportsDisplayedCodeParity === false) {
      diagnostics.push({
        level: 'warning',
        code: 'PLAYGROUND_DISPLAYED_CODE_PARITY_UNVERIFIED',
        message: `Example "${example.id}" does not yet prove displayed-code parity with upstream sources.`,
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

function sortNamedEntries(
  left: PluginKnowledgeEntry | RecipeKnowledgeEntry | TroubleshootingKnowledgeEntry,
  right: PluginKnowledgeEntry | RecipeKnowledgeEntry | TroubleshootingKnowledgeEntry,
) {
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
