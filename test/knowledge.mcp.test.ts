import { describe, expect, it } from 'vitest'
import {
  createKnowledgeMcpManifest,
  invokeKnowledgeMcpTool,
  listKnowledgeMcpResources,
  readKnowledgeMcpResource,
  renderKnowledgeMcpPrompt,
} from '../packages/graphql-gene-knowledge/src'
import { createTestKnowledgeContext } from './support/site-knowledge'

function createContext() {
  return createTestKnowledgeContext()
}

describe('knowledge MCP domain', () => {
  it('exposes a manifest with resources, prompts, and tools', () => {
    const manifest = createKnowledgeMcpManifest('0.1.0-test')

    expect(manifest.server.name).toBe('graphql-gene-mcp')
    expect(manifest.resources.length).toBeGreaterThanOrEqual(4)
    expect(manifest.prompts.length).toBeGreaterThanOrEqual(4)
    expect(manifest.tools.length).toBeGreaterThanOrEqual(15)
    expect(manifest.tools.some(tool => tool.name === 'plan_developer_task')).toBe(true)
    expect(manifest.tools.some(tool => tool.name === 'adapt_example_to_project')).toBe(true)
    expect(manifest.tools.some(tool => tool.name === 'validate_playground_scenario')).toBe(true)
  })

  it('reads the overview resource', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'knowledge://overview')
    const payload = JSON.parse(resource.text)

    expect(resource.mimeType).toBe('application/json')
    expect(payload.counts.docs).toBe(8)
    expect(payload.counts.examples).toBe(4)
    expect(payload.counts.plugins).toBe(2)
    expect(payload.counts.recipes).toBe(5)
    expect(payload.counts.troubleshooting).toBe(5)
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

  it('renders the upgrade planning prompt', () => {
    const prompt = renderKnowledgeMcpPrompt('plan_graphql_gene_upgrade', {
      current_state: 'Sequelize plugin with custom directives',
      target_state: 'Aligned canonical plugin and recipe usage',
      risk_area: 'plugin strategy',
    })

    expect(prompt.text).toContain('Sequelize plugin with custom directives')
    expect(prompt.text).toContain('Aligned canonical plugin and recipe usage')
    expect(prompt.text).toContain('plugin strategy')
  })

  it('renders the troubleshooting triage prompt', () => {
    const prompt = renderKnowledgeMcpPrompt('triage_graphql_gene_issue', {
      symptom: 'Generated schema is missing expected fields',
      stage: 'schema',
      context: 'custom plugin experiment',
    })

    expect(prompt.text).toContain('Generated schema is missing expected fields')
    expect(prompt.text).toContain('schema')
    expect(prompt.text).toContain('custom plugin experiment')
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
    expect(result.recipes.some((recipe: { id: string }) => recipe.id === 'recipe:directive-middleware-auth')).toBe(true)
  })

  it('chooses the Sequelize plugin strategy when the ORM is Sequelize', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'choose_plugin_strategy', {
      orm: 'Sequelize',
      goal: 'Generate schema from my SQL models',
    })

    expect(result.strategy).toBe('plugin-sequelize')
    expect(result.recommendedPlugin).toBe('@graphql-gene/plugin-sequelize')
    expect(result.plugins.some((plugin: { id: string }) => plugin.id === 'plugin:sequelize')).toBe(true)
  })

  it('chooses the custom plugin strategy for non-Sequelize projects', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'choose_plugin_strategy', {
      orm: 'Prisma',
      goal: 'I need a GraphQL Gene plugin for my existing models',
      wantsCustomPlugin: true,
    })

    expect(result.strategy).toBe('custom-plugin')
    expect(result.plugins.some((plugin: { id: string }) => plugin.id === 'plugin:custom-plugin')).toBe(true)
    expect(result.recipes.some((recipe: { id: string }) => recipe.id === 'recipe:custom-plugin-evaluation')).toBe(true)
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
    expect(result.recipes.some((recipe: { id: string }) => recipe.id === 'recipe:directive-middleware-auth')).toBe(true)
  })

  it('builds a polymorphic blocks plan from structured recipes', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'plan_graphql_gene_integration', {
      goal: 'Model polymorphic CMS blocks with GraphQL Gene',
      serverStack: 'Apollo Server',
      concerns: ['inline fragments', 'content blocks'],
    })

    expect(result.focusArea).toBe('polymorphic')
    expect(result.selectedRecipeId).toBe('recipe:polymorphic-content-blocks')
    expect(result.recipes.some((recipe: { id: string }) => recipe.id === 'recipe:polymorphic-content-blocks')).toBe(true)
    expect(result.examples.some((example: { id: string }) => example.id === 'example:polymorphic-blocks:page-blocks-basic')).toBe(true)
  })

  it('diagnoses directive-oriented issues with focused checks', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'diagnose_graphql_gene_issue', {
      symptom: 'my auth directive is not appearing in SDL',
      stage: 'directive',
    })

    expect(result.diagnosisArea).toBe('directive')
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/directives')).toBe(true)
    expect(result.recommendedChecks.length).toBeGreaterThan(1)
    expect(result.troubleshooting.some((issue: { id: string }) => issue.id === 'troubleshooting:directive-not-printed-in-sdl')).toBe(true)
  })

  it('diagnoses query lookahead issues with structured troubleshooting guidance', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'diagnose_graphql_gene_issue', {
      symptom: 'my JOIN shape does not match the query lookahead fields',
      context: 'Sequelize include graph looks wrong',
      stage: 'query',
    })

    expect(result.diagnosisArea).toBe('query')
    expect(result.troubleshooting.some((issue: { id: string }) => issue.id === 'troubleshooting:lookahead-behavior-does-not-match-expectation')).toBe(true)
    expect(result.recipes.some((recipe: { id: string }) => recipe.id === 'recipe:query-lookahead-shape')).toBe(true)
    expect(result.docs.length).toBeGreaterThan(0)
  })

  it('plans developer task patterns from canonical scenario guidance', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'plan_developer_task', {
      patternId: 'polymorphic-blocks',
      project: {
        serverStack: 'Apollo Server',
        orm: 'Sequelize',
      },
    })

    expect(result.patternId).toBe('polymorphic-blocks')
    expect(result.pluginStrategy.strategy).toBe('plugin-sequelize')
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/polymorphic-blocks')).toBe(true)
    expect(result.agentInstructions.join(' ')).toContain('not as the implementation source')
  })

  it('validates developer task plans without treating playground code as source', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'validate_developer_task_plan', {
      patternId: 'query-lookahead',
      usesPlaygroundRuntimeAsSource: true,
      includesPluginDecision: false,
      handlesLookahead: false,
    })

    expect(result.status).toBe('fail')
    expect(result.issues.some((issue: { code: string }) => issue.code === 'PLAYGROUND_RUNTIME_USED_AS_SOURCE')).toBe(true)
    expect(result.issues.some((issue: { code: string }) => issue.code === 'LOOKAHEAD_NOT_HANDLED')).toBe(true)
  })

  it('inspects playground scenario contracts for maintainer agents', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'inspect_playground_scenario', {
      scenario: 'polymorphic-blocks',
    })

    expect(result.knownScenario).toBe(true)
    expect(result.expectedApiEndpoints).toContain('POST /api/playground/query')
    expect(result.relatedDocs.some((doc: { slug: string }) => doc.slug === '/docs/guides/polymorphic-blocks')).toBe(true)
  })

  it('validates playground scenario implementation summaries', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'validate_playground_scenario', {
      scenario: 'query-lookahead',
      exampleId: 'me-with-orders',
      editableFields: ['query'],
      docsSlugs: ['/docs/guides/schema-design'],
      outputPanels: ['response-payload', 'captured-sql', 'include-graph', 'diagnostics'],
      executionMode: 'adapted',
      declaresAdaptedRuntime: true,
      hasFixture: true,
      hasApiValidation: true,
      hasTests: true,
      usesHardcodedOutput: false,
      sourcePath: 'server/utils/playground/registry.ts',
      runtimeSourcePath: 'server/utils/playground/engine.ts',
    })

    expect(result.status).toBe('pass')
    expect(result.contract.knownScenario).toBe(true)
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

  it('exposes curated plugin resources for targeted retrieval', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'plugins://plugin/sequelize')
    const payload = JSON.parse(resource.text)

    expect(payload.id).toBe('plugin:sequelize')
    expect(payload.packageName).toBe('@graphql-gene/plugin-sequelize')
  })

  it('exposes curated recipe resources for targeted retrieval', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'recipes://recipe/polymorphic-content-blocks')
    const payload = JSON.parse(resource.text)

    expect(payload.id).toBe('recipe:polymorphic-content-blocks')
    expect(payload.recipeId).toBe('polymorphic-content-blocks')
  })

  it('exposes curated troubleshooting resources for targeted retrieval', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'troubleshooting://issue/directive-not-printed-in-sdl')
    const payload = JSON.parse(resource.text)

    expect(payload.id).toBe('troubleshooting:directive-not-printed-in-sdl')
    expect(payload.issueId).toBe('directive-not-printed-in-sdl')
  })
})
