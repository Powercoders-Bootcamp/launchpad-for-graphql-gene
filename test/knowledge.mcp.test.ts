import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildKnowledgeCatalog,
  createKnowledgeMcpManifest,
  invokeKnowledgeMcpTool,
  listKnowledgeMcpResources,
  readKnowledgeMcpResource,
  renderKnowledgeMcpPrompt,
} from '../packages/graphql-gene-knowledge/src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')
const docsRoot = path.join(workspaceRoot, 'content', 'graphql-gene', 'docs')

const docsConfig = {
  docsRoot: 'docs',
  sections: [
    { id: 'concepts', title: 'Concepts', order: 1 },
    { id: 'guides', title: 'Guides', order: 2 },
    { id: 'reference', title: 'Reference', order: 3 },
    { id: 'examples', title: 'Examples', order: 4 },
    { id: 'tutorials', title: 'Tutorials', order: 5 },
  ],
}

const examples = [
  {
    id: 'user-orders-basic',
    scenario: 'model-to-schema',
    title: 'User with Orders',
    description: 'Generate a schema from User and Order models with a hasMany association.',
    editableFields: ['includeOrders', 'includeAddress', 'showTypeSummary'],
  },
  {
    id: 'me-with-orders',
    scenario: 'query-lookahead',
    title: 'Me with Orders',
    description: 'Query the current user including their orders. Observe the JOIN in the SQL panel.',
    editableFields: ['query'],
  },
  {
    id: 'page-blocks-basic',
    scenario: 'polymorphic-blocks',
    title: 'Polymorphic Page Blocks',
    description: 'Query heterogeneous CMS blocks with inline fragments.',
    editableFields: ['query'],
  },
  {
    id: 'user-auth-directive',
    scenario: 'directive-middleware',
    title: 'Auth Directive',
    description: 'Attach @userAuth to a field and inspect schema and runtime behavior.',
    editableFields: ['directiveMode'],
  },
]

function createContext() {
  return {
    catalog: buildKnowledgeCatalog({
      workspaceRoot,
      docsRoot,
      docsConfig,
      examples,
      sourceRepo: 'graphql-gene-site',
      sourceRef: 'workspace',
      versionRange: '^1.3.7',
    }),
    serverVersion: '0.1.0-test',
  }
}

describe('knowledge MCP domain', () => {
  it('exposes a manifest with resources, prompts, and tools', () => {
    const manifest = createKnowledgeMcpManifest('0.1.0-test')

    expect(manifest.server.name).toBe('graphql-gene-mcp')
    expect(manifest.resources.length).toBeGreaterThanOrEqual(4)
    expect(manifest.prompts.length).toBeGreaterThanOrEqual(2)
    expect(manifest.tools.length).toBeGreaterThanOrEqual(3)
  })

  it('reads the overview resource', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'knowledge://overview')
    const payload = JSON.parse(resource.text)

    expect(resource.mimeType).toBe('application/json')
    expect(payload.counts.docs).toBe(5)
    expect(payload.counts.examples).toBe(4)
  })

  it('renders prompts with caller context', () => {
    const prompt = renderKnowledgeMcpPrompt('start_graphql_gene_integration', {
      goal: 'Generate a schema from Sequelize models',
      server_stack: 'Apollo Server',
      orm: 'Sequelize',
    })

    expect(prompt.text).toContain('Generate a schema from Sequelize models')
    expect(prompt.text).toContain('Apollo Server')
    expect(prompt.text).toContain('Sequelize')
  })

  it('runs the search tool against the canonical catalog', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'search_knowledge', {
      query: 'directive',
      limit: 3,
    })

    expect(result.resultCount).toBeGreaterThan(1)
    expect(result.results[0].id).toBe('doc:/docs/guides/directives')
  })

  it('runs the integration recommendation tool', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'recommend_integration_path', {
      goal: 'I need an auth directive for my user model',
    })

    expect(result.recommendedQuery).toBe('directive')
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/directives')).toBe(true)
  })

  it('keeps the capabilities resource aligned with the resource manifest', () => {
    const capabilities = readKnowledgeMcpResource(createContext(), 'capabilities://server')
    const payload = JSON.parse(capabilities.text)

    expect(payload.resources).toEqual(listKnowledgeMcpResources())
  })
})
