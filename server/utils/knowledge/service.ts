import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildSiteKnowledgeCatalog,
  searchKnowledgeCatalog,
  type DocKnowledgeEntry,
  type ExampleKnowledgeEntry,
  type KnowledgeKind,
  siteDocsConfig,
} from '~/packages/graphql-gene-knowledge/src'

export function getKnowledgeCatalog() {
  const workspaceRoot = process.cwd()

  return buildSiteKnowledgeCatalog({
    workspaceRoot,
    sourceRepo: 'graphql-gene-site',
    sourceRef: 'workspace',
    versionRange: readGraphqlGeneVersionRange(workspaceRoot),
  })
}

export function getKnowledgeOverview() {
  const catalog = getKnowledgeCatalog()

  return {
    generatedAt: catalog.generatedAt,
    counts: catalog.counts,
    sections: siteDocsConfig.sections
      .map(section => ({
        ...section,
        docCount: catalog.docs.filter(doc => doc.section === section.id).length,
      }))
      .sort((left, right) => left.order - right.order),
    scenarios: summarizeScenarios(catalog.examples, catalog.docs),
    diagnostics: catalog.diagnostics,
  }
}

export function listKnowledgeDocs(filters?: {
  section?: string
  scenario?: string
  status?: string
}) {
  const catalog = getKnowledgeCatalog()

  return catalog.docs.filter((doc) => {
    if (filters?.section && doc.section !== filters.section) {
      return false
    }

    if (filters?.scenario && doc.playgroundScenario !== filters.scenario) {
      return false
    }

    if (filters?.status && doc.status !== filters.status) {
      return false
    }

    return true
  })
}

export function listKnowledgeExamples(filters?: {
  scenario?: string
  executionMode?: string
}) {
  const catalog = getKnowledgeCatalog()

  return catalog.examples.filter((example) => {
    if (filters?.scenario && example.scenario !== filters.scenario) {
      return false
    }

    if (filters?.executionMode && example.executionMode !== filters.executionMode) {
      return false
    }

    return true
  })
}

export function searchKnowledge(filters: {
  query: string
  kind?: KnowledgeKind
  section?: string
  scenario?: string
  limit?: number
}) {
  const catalog = getKnowledgeCatalog()

  return searchKnowledgeCatalog(catalog, filters).map(hit => ({
    id: hit.entry.id,
    kind: hit.entry.kind,
    title: hit.entry.title,
    summary: hit.entry.summary,
    score: hit.score,
    matchedFields: hit.matchedFields,
    slug: hit.entry.kind === 'doc' ? hit.entry.slug : undefined,
    section: hit.entry.kind === 'doc' ? hit.entry.section : undefined,
    scenario: hit.entry.kind === 'example' ? hit.entry.scenario : hit.entry.playgroundScenario,
    sourcePath: hit.entry.sourcePath,
  }))
}

function summarizeScenarios(examples: ExampleKnowledgeEntry[], docs: DocKnowledgeEntry[]) {
  const docCountByScenario = new Map<string, number>()

  for (const doc of docs) {
    if (!doc.playgroundScenario) {
      continue
    }

    docCountByScenario.set(
      doc.playgroundScenario,
      (docCountByScenario.get(doc.playgroundScenario) ?? 0) + 1,
    )
  }

  return [...new Set(examples.map(example => example.scenario))]
    .map((scenario) => {
      const scenarioExamples = examples.filter(example => example.scenario === scenario)
      return {
        id: scenario,
        exampleCount: scenarioExamples.length,
        linkedDocCount: docCountByScenario.get(scenario) ?? 0,
        executionModes: [...new Set(scenarioExamples.map(example => example.executionMode ?? 'unknown'))].sort(),
      }
    })
    .sort((left, right) => left.id.localeCompare(right.id))
}

function readGraphqlGeneVersionRange(workspaceRoot: string) {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(workspaceRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
    }
    return packageJson.dependencies?.['graphql-gene']
  }
  catch {
    return undefined
  }
}
