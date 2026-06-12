import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildCachedSiteKnowledgeCatalog,
  searchKnowledgeCatalog,
  type DocKnowledgeEntry,
  type ExampleKnowledgeEntry,
  type KnowledgeEntry,
  type KnowledgeKind,
  type PluginKnowledgeEntry,
  type RecipeKnowledgeEntry,
  type TroubleshootingKnowledgeEntry,
  siteDocsConfig,
} from '~/packages/graphql-gene-knowledge/src'

export function getKnowledgeCatalog() {
  const workspaceRoot = process.cwd()

  return buildCachedSiteKnowledgeCatalog({
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
    scenarios: summarizeScenarios(catalog.examples, catalog.docs, catalog.plugins, catalog.recipes, catalog.troubleshooting),
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

export function listKnowledgePlugins(filters?: {
  scenario?: string
  orm?: string
}) {
  const catalog = getKnowledgeCatalog()

  return catalog.plugins.filter((plugin) => {
    if (filters?.scenario && !plugin.scenarios.includes(filters.scenario)) {
      return false
    }

    if (filters?.orm && !plugin.supportedOrms.some(orm => normalize(orm).includes(normalize(filters.orm ?? '')))) {
      return false
    }

    return true
  })
}

export function listKnowledgeRecipes(filters?: {
  scenario?: string
  orm?: string
}) {
  const catalog = getKnowledgeCatalog()

  return catalog.recipes.filter((recipe) => {
    if (filters?.scenario && !recipe.scenarios.includes(filters.scenario)) {
      return false
    }

    if (filters?.orm && !recipe.orms.some(orm => normalize(orm).includes(normalize(filters.orm ?? '')))) {
      return false
    }

    return true
  })
}

export function listKnowledgeTroubleshooting(filters?: {
  scenario?: string
  stage?: string
}) {
  const catalog = getKnowledgeCatalog()

  return catalog.troubleshooting.filter((issue) => {
    if (filters?.scenario && !issue.scenarios.includes(filters.scenario)) {
      return false
    }

    if (filters?.stage && !issue.stages.includes(filters.stage as TroubleshootingKnowledgeEntry['stages'][number])) {
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
    scenario: extractScenario(hit.entry),
    packageName: hit.entry.kind === 'plugin' ? hit.entry.packageName ?? null : undefined,
    recipeId: hit.entry.kind === 'recipe' ? hit.entry.recipeId : undefined,
    issueId: hit.entry.kind === 'troubleshooting' ? hit.entry.issueId : undefined,
    sourcePath: hit.entry.sourcePath,
  }))
}

function summarizeScenarios(
  examples: ExampleKnowledgeEntry[],
  docs: DocKnowledgeEntry[],
  plugins: PluginKnowledgeEntry[],
  recipes: RecipeKnowledgeEntry[],
  troubleshooting: TroubleshootingKnowledgeEntry[],
) {
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

  return [...new Set([
    ...examples.map(example => example.scenario),
    ...plugins.flatMap(plugin => plugin.scenarios),
    ...recipes.flatMap(recipe => recipe.scenarios),
    ...troubleshooting.flatMap(issue => issue.scenarios),
  ])]
    .map((scenario) => {
      const scenarioExamples = examples.filter(example => example.scenario === scenario)
      return {
        id: scenario,
        exampleCount: scenarioExamples.length,
        linkedDocCount: docCountByScenario.get(scenario) ?? 0,
        pluginCount: plugins.filter(plugin => plugin.scenarios.includes(scenario)).length,
        recipeCount: recipes.filter(recipe => recipe.scenarios.includes(scenario)).length,
        troubleshootingCount: troubleshooting.filter(issue => issue.scenarios.includes(scenario)).length,
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

function extractScenario(entry: KnowledgeEntry) {
  switch (entry.kind) {
    case 'doc':
      return entry.playgroundScenario
    case 'example':
      return entry.scenario
    case 'plugin':
    case 'recipe':
    case 'troubleshooting':
      return entry.scenarios[0]
    default:
      return undefined
  }
}

function normalize(value: string) {
  return value.toLowerCase()
}
