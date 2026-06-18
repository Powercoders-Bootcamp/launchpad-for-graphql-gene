import type { KnowledgeCatalog } from '../contracts'
import {
  buildDeveloperTaskOverviewResource,
  listDeveloperTaskPatterns,
  readDeveloperTaskResource,
} from '../developer/task-patterns'
import type { McpDomainContext, McpResourceDescriptor, McpResourceDocument } from './contracts'

const BASE_RESOURCE_DEFINITIONS: McpResourceDescriptor[] = [
  {
    uri: 'capabilities://server',
    name: 'Server Capabilities',
    description: 'Lists the currently implemented GraphQL Gene MCP resources, prompts, and tools.',
    mimeType: 'application/json',
  },
  {
    uri: 'knowledge://overview',
    name: 'Knowledge Overview',
    description: 'Returns high-level counts, diagnostics, and scenario coverage for the canonical catalog.',
    mimeType: 'application/json',
  },
  {
    uri: 'docs://catalog',
    name: 'Docs Catalog',
    description: 'Returns the canonical GraphQL Gene documentation catalog.',
    mimeType: 'application/json',
  },
  {
    uri: 'examples://catalog',
    name: 'Examples Catalog',
    description: 'Returns the canonical GraphQL Gene example catalog with parity metadata.',
    mimeType: 'application/json',
  },
  {
    uri: 'plugins://catalog',
    name: 'Plugin Catalog',
    description: 'Returns curated plugin guidance entries backed by the canonical GraphQL Gene knowledge graph.',
    mimeType: 'application/json',
  },
  {
    uri: 'recipes://catalog',
    name: 'Recipe Catalog',
    description: 'Returns curated integration recipes backed by the canonical GraphQL Gene knowledge graph.',
    mimeType: 'application/json',
  },
  {
    uri: 'troubleshooting://catalog',
    name: 'Troubleshooting Catalog',
    description: 'Returns common GraphQL Gene troubleshooting entries backed by canonical guidance.',
    mimeType: 'application/json',
  },
  {
    uri: 'developer-tasks://overview',
    name: 'Developer Task Overview',
    description: 'Returns the canonical GraphQL Gene developer task catalog with stages, capabilities, evidence, and warnings.',
    mimeType: 'application/json',
  },
  {
    uri: 'audit://upstream-snapshot',
    name: 'Upstream Audit Snapshot',
    description: 'Returns the current upstream-audit snapshot covering inventories, scenario matrix, provenance, and conflict log.',
    mimeType: 'application/json',
  },
  {
    uri: 'audit://package-parity',
    name: 'Package Parity Audit',
    description: 'Returns the package export parity and capability audit used by developer-task planning.',
    mimeType: 'application/json',
  },
]

export function listKnowledgeMcpResources(context?: McpDomainContext): McpResourceDescriptor[] {
  if (!context) {
    return BASE_RESOURCE_DEFINITIONS
  }

  return [
    ...BASE_RESOURCE_DEFINITIONS,
    ...context.catalog.docs.map(doc => ({
      uri: toDocResourceUri(doc.slug),
      name: `Doc: ${doc.title}`,
      description: `Canonical doc page for ${doc.slug}.`,
      mimeType: 'application/json' as const,
    })),
    ...context.catalog.examples.map(example => ({
      uri: toExampleResourceUri(example.scenario, example.exampleId),
      name: `Example: ${example.title}`,
      description: `Canonical example entry for ${example.scenario}/${example.exampleId}.`,
      mimeType: 'application/json' as const,
    })),
    ...context.catalog.plugins.map(plugin => ({
      uri: toPluginResourceUri(plugin.pluginId),
      name: `Plugin: ${plugin.title}`,
      description: `Curated plugin guidance entry for ${plugin.pluginId}.`,
      mimeType: 'application/json' as const,
    })),
    ...context.catalog.recipes.map(recipe => ({
      uri: toRecipeResourceUri(recipe.recipeId),
      name: `Recipe: ${recipe.title}`,
      description: `Curated integration recipe for ${recipe.recipeId}.`,
      mimeType: 'application/json' as const,
    })),
    ...context.catalog.troubleshooting.map(issue => ({
      uri: toTroubleshootingResourceUri(issue.issueId),
      name: `Troubleshooting: ${issue.title}`,
      description: `Curated troubleshooting entry for ${issue.issueId}.`,
      mimeType: 'application/json' as const,
    })),
    ...listDeveloperTaskPatterns(context.catalog).patterns.map(task => ({
      uri: toDeveloperTaskResourceUri(task.taskId),
      name: `Developer Task: ${task.title}`,
      description: `Canonical developer task entry for ${task.taskId}.`,
      mimeType: 'application/json' as const,
    })),
  ]
}

export function readKnowledgeMcpResource(context: McpDomainContext, uri: string): McpResourceDocument {
  switch (uri) {
    case 'capabilities://server':
      return jsonResource(uri, {
        server: {
          name: 'graphql-gene-mcp',
          version: context.serverVersion ?? '0.1.0',
        },
        resources: listKnowledgeMcpResources(context),
      })
    case 'knowledge://overview':
      return jsonResource(uri, buildOverviewPayload(context.catalog))
    case 'docs://catalog':
      return jsonResource(uri, context.catalog.docs)
    case 'examples://catalog':
      return jsonResource(uri, context.catalog.examples)
    case 'plugins://catalog':
      return jsonResource(uri, context.catalog.plugins)
    case 'recipes://catalog':
      return jsonResource(uri, context.catalog.recipes)
    case 'troubleshooting://catalog':
      return jsonResource(uri, context.catalog.troubleshooting)
    case 'developer-tasks://overview':
      return jsonResource(uri, buildDeveloperTaskOverviewResource(context.catalog))
    case 'audit://upstream-snapshot':
      return jsonResource(uri, context.catalog.audit ?? null)
    case 'audit://package-parity':
      return jsonResource(uri, context.catalog.audit?.packageParity ?? null)
    default:
      return readEntryResource(context, uri)
  }
}

function buildOverviewPayload(catalog: KnowledgeCatalog) {
  const docsById = new Map(catalog.docs.map(doc => [doc.id, doc]))
  const scenarios = [...new Set([
    ...catalog.examples.map(example => example.scenario),
    ...catalog.plugins.flatMap(plugin => plugin.scenarios),
    ...catalog.recipes.flatMap(recipe => recipe.scenarios),
    ...catalog.troubleshooting.flatMap(issue => issue.scenarios),
  ])]
    .sort()
    .map((scenario) => {
      const scenarioExamples = catalog.examples.filter(example => example.scenario === scenario)
      const linkedDocIds = new Set([
        ...catalog.docs
          .filter(doc => doc.playgroundScenario === scenario)
          .map(doc => doc.id),
        ...scenarioExamples
          .flatMap(example => example.recommendedDocIds)
          .filter(docId => docsById.has(docId)),
      ])
      const linkedPlugins = catalog.plugins.filter(plugin => plugin.scenarios.includes(scenario))
      const linkedRecipes = catalog.recipes.filter(recipe => recipe.scenarios.includes(scenario))
      const linkedIssues = catalog.troubleshooting.filter(issue => issue.scenarios.includes(scenario))

      return {
        id: scenario,
        exampleCount: scenarioExamples.length,
        linkedDocCount: linkedDocIds.size,
        pluginCount: linkedPlugins.length,
        recipeCount: linkedRecipes.length,
        troubleshootingCount: linkedIssues.length,
        executionModes: [...new Set(scenarioExamples.map(example => example.executionMode ?? 'unknown'))].sort(),
      }
    })

  return {
    generatedAt: catalog.generatedAt,
    counts: catalog.counts,
    developerTasks: {
      count: listDeveloperTaskPatterns(catalog).count,
    },
    audit: catalog.audit
      ? {
          status: catalog.audit.metadata.status,
          upstreamRepo: catalog.audit.metadata.upstreamRepo,
          auditedRef: catalog.audit.metadata.auditedRef,
          docsCount: catalog.audit.coverage.docs,
          packageCount: catalog.audit.coverage.packages,
          capabilityCount: catalog.audit.coverage.capabilities,
          pluginCount: catalog.audit.coverage.plugins,
          exampleCount: catalog.audit.coverage.examples,
          scenarioCount: catalog.audit.coverage.scenarios,
          conflictCount: catalog.audit.coverage.conflicts,
          packageParity: {
            total: catalog.audit.packageParity.summary.total,
            unresolved: catalog.audit.packageParity.summary.unresolved,
            warningCount: catalog.audit.packageParity.summary.warningCount,
            byStatus: catalog.audit.packageParity.summary.byStatus,
          },
        }
      : null,
    scenarios,
    diagnostics: catalog.diagnostics,
  }
}

function jsonResource(uri: string, payload: unknown): McpResourceDocument {
  return {
    uri,
    mimeType: 'application/json',
    text: JSON.stringify(payload, null, 2),
  }
}

function readEntryResource(context: McpDomainContext, uri: string): McpResourceDocument {
  const doc = context.catalog.docs.find(entry => toDocResourceUri(entry.slug) === uri)
  if (doc) {
    return jsonResource(uri, doc)
  }

  const example = context.catalog.examples.find(
    entry => toExampleResourceUri(entry.scenario, entry.exampleId) === uri,
  )
  if (example) {
    return jsonResource(uri, example)
  }

  const plugin = context.catalog.plugins.find(entry => toPluginResourceUri(entry.pluginId) === uri)
  if (plugin) {
    return jsonResource(uri, plugin)
  }

  const recipe = context.catalog.recipes.find(entry => toRecipeResourceUri(entry.recipeId) === uri)
  if (recipe) {
    return jsonResource(uri, recipe)
  }

  const troubleshooting = context.catalog.troubleshooting.find(
    entry => toTroubleshootingResourceUri(entry.issueId) === uri,
  )
  if (troubleshooting) {
    return jsonResource(uri, troubleshooting)
  }

  if (uri.startsWith('developer-tasks://task/')) {
    const taskId = uri.slice('developer-tasks://task/'.length)
    return jsonResource(uri, readDeveloperTaskResource(context.catalog, taskId))
  }

  throw new Error(`Unknown MCP resource URI "${uri}".`)
}

function toDocResourceUri(slug: string) {
  return `docs://${slug.replace(/^\/+/, '')}`
}

function toExampleResourceUri(scenario: string, exampleId: string) {
  return `examples://${scenario}/${exampleId}`
}

function toPluginResourceUri(pluginId: string) {
  return `plugins://plugin/${pluginId}`
}

function toRecipeResourceUri(recipeId: string) {
  return `recipes://recipe/${recipeId}`
}

function toTroubleshootingResourceUri(issueId: string) {
  return `troubleshooting://issue/${issueId}`
}

function toDeveloperTaskResourceUri(taskId: string) {
  return `developer-tasks://task/${taskId}`
}
