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
    expect(manifest.prompts.length).toBeGreaterThanOrEqual(9)
    expect(manifest.tools.length).toBeGreaterThanOrEqual(17)
    expect(manifest.tools.some(tool => tool.name === 'classify_developer_goal')).toBe(true)
    expect(manifest.tools.some(tool => tool.name === 'plan_developer_task')).toBe(true)
    expect(manifest.tools.some(tool => tool.name === 'adapt_example_to_project')).toBe(true)
    expect(manifest.tools.some(tool => tool.name === 'diagnose_developer_issue')).toBe(true)
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
    expect(payload.developerTasks.count).toBeGreaterThanOrEqual(20)
    expect(payload.audit.status).toBe('full')
    expect(payload.audit.scenarioCount).toBeGreaterThanOrEqual(6)
    expect(payload.audit.packageParity.unresolved).toBeGreaterThan(0)
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
    expect(prompt.text).toContain('Inspect the local project files through the host coding agent')
    expect(prompt.text).toContain('classify_developer_goal')
  })

  it('renders the plugin authoring prompt', () => {
    const prompt = renderKnowledgeMcpPrompt('author_graphql_gene_plugin', {
      orm: 'Prisma',
      capability: 'derive GraphQL fields from models',
    })

    expect(prompt.text).toContain('Prisma')
    expect(prompt.text).toContain('derive GraphQL fields from models')
  })

  it('renders the plugin strategy selection prompt', () => {
    const prompt = renderKnowledgeMcpPrompt('select_graphql_gene_plugin_strategy', {
      goal: 'Choose the right GraphQL Gene path for our Prisma models',
      orm: 'Prisma',
      current_graphql_setup: 'hand-written schema',
    })

    expect(prompt.text).toContain('Prisma')
    expect(prompt.text).toContain('hand-written schema')
    expect(prompt.text).toContain('choose_plugin_strategy')
    expect(prompt.text).toContain('The MCP server cannot read the developer project directly')
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

  it('renders the lookahead debugging prompt', () => {
    const prompt = renderKnowledgeMcpPrompt('debug_graphql_gene_lookahead', {
      symptom: 'Nested order query triggers too many SQL statements',
      server_stack: 'Apollo Server',
      orm: 'Sequelize',
    })

    expect(prompt.text).toContain('Nested order query triggers too many SQL statements')
    expect(prompt.text).toContain('diagnose_developer_issue')
    expect(prompt.text).toContain('selected-field-driven loading')
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

  it('classifies a developer goal into ranked task candidates', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'classify_developer_goal', {
      goal: 'I need to migrate a hand-written schema toward GraphQL Gene',
      project: {
        currentGraphqlSetup: 'hand-written schema and resolvers',
      },
    })

    expect(result.rankedTasks[0].taskId).toBe('migrate-from-handwritten-schema')
    expect(result.recommendedNextTool).toBe('plan_developer_task')
  })

  it('plans developer task patterns from canonical scenario guidance', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'plan_developer_task', {
      patternId: 'polymorphic-blocks',
      project: {
        serverStack: 'Apollo Server',
        orm: 'Sequelize',
      },
    })

    expect(result.taskId).toBe('model-polymorphic-content-blocks')
    expect(result.patternId).toBe('polymorphic-blocks')
    expect(result.pluginStrategy.strategy).toBe('plugin-sequelize')
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/polymorphic-blocks')).toBe(true)
    expect(result.agentInstructions.join(' ')).toContain('not as the implementation source')
    expect(result.versionMetadata.parityFindings.some((finding: { capabilityId: string, status: string }) => (
      finding.capabilityId === 'polymorphic-blocks' && finding.status === 'conceptual-pattern'
    ))).toBe(true)
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

  it('diagnoses developer issues with task-aware guidance', () => {
    const result = invokeKnowledgeMcpTool(createContext(), 'diagnose_developer_issue', {
      symptom: 'my generated schema is missing expected model types',
      stage: 'schema',
    })

    expect(result.taskId).toBe('debug-schema-generation')
    expect(result.recommendedChecks.length).toBeGreaterThan(1)
    expect(result.sourceEvidence.length).toBeGreaterThan(0)
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

  it('exposes developer task resources for targeted retrieval', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'developer-tasks://task/optimize-lookahead-loading')
    const payload = JSON.parse(resource.text)

    expect(payload.taskId).toBe('optimize-lookahead-loading')
    expect(payload.patternId).toBe('query-lookahead')
  })

  it('exposes the upstream audit snapshot resource', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'audit://upstream-snapshot')
    const payload = JSON.parse(resource.text)

    expect(payload.metadata.status).toBe('full')
    expect(payload.coverage.docs).toBe(8)
    expect(payload.coverage.capabilities).toBeGreaterThanOrEqual(8)
    expect(payload.scenarios.some((scenario: { scenarioId: string }) => scenario.scenarioId === 'sequelize-setup')).toBe(true)
    expect(payload.docs.some((doc: { workspaceProjectionPath?: string, sourcePath: string }) => (
      doc.workspaceProjectionPath && doc.sourcePath !== doc.workspaceProjectionPath
    ))).toBe(true)
  })

  it('exposes the package parity audit resource', () => {
    const resource = readKnowledgeMcpResource(createContext(), 'audit://package-parity')
    const payload = JSON.parse(resource.text)

    expect(payload.summary.unresolved).toBeGreaterThan(0)
    expect(payload.capabilities.some((capability: { capabilityId: string, status: string }) => (
      capability.capabilityId === 'polymorphic-blocks' && capability.status === 'conceptual-pattern'
    ))).toBe(true)
  })
})
