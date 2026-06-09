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
    expect(manifest.prompts.length).toBeGreaterThanOrEqual(4)
    expect(manifest.tools.length).toBeGreaterThanOrEqual(6)
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

  it('renders the plugin authoring prompt', () => {
    const prompt = renderKnowledgeMcpPrompt('author_graphql_gene_plugin', {
      orm: 'Prisma',
      capability: 'derive GraphQL fields from models',
    })

    expect(prompt.text).toContain('Prisma')
    expect(prompt.text).toContain('derive GraphQL fields from models')
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

  it('chooses the Sequelize plugin strategy when the ORM is Sequelize', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'choose_plugin_strategy', {
      orm: 'Sequelize',
      goal: 'Generate schema from my SQL models',
    })

    expect(result.strategy).toBe('plugin-sequelize')
    expect(result.recommendedPlugin).toBe('@graphql-gene/plugin-sequelize')
  })

  it('builds an actionable integration plan', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'plan_graphql_gene_integration', {
      goal: 'Add GraphQL Gene to my API',
      serverStack: 'Apollo Server',
      orm: 'Sequelize',
      concerns: ['directives', 'query lookahead'],
    })

    expect(result.focusArea).toBe('directive')
    expect(Array.isArray(result.steps)).toBe(true)
    expect(result.steps.length).toBeGreaterThan(3)
    expect(result.pluginStrategy.strategy).toBe('plugin-sequelize')
  })

  it('diagnoses directive-oriented issues with focused checks', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'diagnose_graphql_gene_issue', {
      symptom: 'my auth directive is not appearing in SDL',
      stage: 'directive',
    })

    expect(result.diagnosisArea).toBe('directive')
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/directives')).toBe(true)
    expect(result.recommendedChecks.length).toBeGreaterThan(1)
  })

  it('keeps the capabilities resource aligned with the resource manifest', () => {
    const capabilities = readKnowledgeMcpResource(createContext(), 'capabilities://server')
    const payload = JSON.parse(capabilities.text)

    expect(payload.resources).toEqual(listKnowledgeMcpResources(createContext()))
  })

  it('exposes individual doc resources for targeted retrieval', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'docs://docs/guides/directives')
    const payload = JSON.parse(resource.text)

    expect(payload.id).toBe('doc:/docs/guides/directives')
    expect(payload.playgroundScenario).toBe('directive-middleware')
  })
})
