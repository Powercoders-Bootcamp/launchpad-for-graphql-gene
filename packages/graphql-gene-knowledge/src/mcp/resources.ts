import type { KnowledgeCatalog } from '../contracts'
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
    default:
      return readEntryResource(context, uri)
  }
}

function buildOverviewPayload(catalog: KnowledgeCatalog) {
  const scenarios = [...new Set([
    ...catalog.examples.map(example => example.scenario),
    ...catalog.plugins.flatMap(plugin => plugin.scenarios),
    ...catalog.recipes.flatMap(recipe => recipe.scenarios),
    ...catalog.troubleshooting.flatMap(issue => issue.scenarios),
  ])]
    .sort()
    .map((scenario) => {
      const scenarioExamples = catalog.examples.filter(example => example.scenario === scenario)
      const linkedDocs = catalog.docs.filter(doc => doc.playgroundScenario === scenario)
      const linkedPlugins = catalog.plugins.filter(plugin => plugin.scenarios.includes(scenario))
      const linkedRecipes = catalog.recipes.filter(recipe => recipe.scenarios.includes(scenario))
      const linkedIssues = catalog.troubleshooting.filter(issue => issue.scenarios.includes(scenario))

      return {
        id: scenario,
        exampleCount: scenarioExamples.length,
        linkedDocCount: linkedDocs.length,
        pluginCount: linkedPlugins.length,
        recipeCount: linkedRecipes.length,
        troubleshootingCount: linkedIssues.length,
        executionModes: [...new Set(scenarioExamples.map(example => example.executionMode ?? 'unknown'))].sort(),
      }
    })

  return {
    generatedAt: catalog.generatedAt,
    counts: catalog.counts,
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
