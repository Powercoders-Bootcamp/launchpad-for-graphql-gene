import type { KnowledgeCatalog } from '../contracts'
import type { McpDomainContext, McpResourceDescriptor, McpResourceDocument } from './contracts'

const RESOURCE_DEFINITIONS: McpResourceDescriptor[] = [
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
]

export function listKnowledgeMcpResources(): McpResourceDescriptor[] {
  return RESOURCE_DEFINITIONS
}

export function readKnowledgeMcpResource(context: McpDomainContext, uri: string): McpResourceDocument {
  switch (uri) {
    case 'capabilities://server':
      return jsonResource(uri, {
        server: {
          name: 'graphql-gene-mcp',
          version: context.serverVersion ?? '0.1.0',
        },
        resources: listKnowledgeMcpResources(),
      })
    case 'knowledge://overview':
      return jsonResource(uri, buildOverviewPayload(context.catalog))
    case 'docs://catalog':
      return jsonResource(uri, context.catalog.docs)
    case 'examples://catalog':
      return jsonResource(uri, context.catalog.examples)
    default:
      throw new Error(`Unknown MCP resource URI "${uri}".`)
  }
}

function buildOverviewPayload(catalog: KnowledgeCatalog) {
  const scenarios = [...new Set(catalog.examples.map(example => example.scenario))]
    .sort()
    .map((scenario) => {
      const scenarioExamples = catalog.examples.filter(example => example.scenario === scenario)
      const linkedDocs = catalog.docs.filter(doc => doc.playgroundScenario === scenario)

      return {
        id: scenario,
        exampleCount: scenarioExamples.length,
        linkedDocCount: linkedDocs.length,
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
