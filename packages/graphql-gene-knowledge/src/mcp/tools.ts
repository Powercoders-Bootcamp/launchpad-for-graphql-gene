import { searchKnowledgeCatalog } from '../query/search'
import type { DocKnowledgeEntry, ExampleKnowledgeEntry } from '../contracts'
import type { McpDomainContext, McpToolDescriptor } from './contracts'

const TOOLS: McpToolDescriptor[] = [
  {
    name: 'search_knowledge',
    description: 'Search the canonical GraphQL Gene knowledge catalog by keyword, kind, section, or scenario.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 2 },
        kind: { type: 'string', enum: ['doc', 'example'] },
        section: { type: 'string' },
        scenario: { type: 'string' },
        limit: { type: 'integer', minimum: 1, maximum: 25 },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'explain_graphql_gene_feature',
    description: 'Summarize a GraphQL Gene feature and point to the most relevant canonical docs and examples.',
    inputSchema: {
      type: 'object',
      properties: {
        feature: { type: 'string', minLength: 2 },
      },
      required: ['feature'],
      additionalProperties: false,
    },
  },
  {
    name: 'recommend_integration_path',
    description: 'Recommend a likely GraphQL Gene integration path based on the developer goal.',
    inputSchema: {
      type: 'object',
      properties: {
        goal: { type: 'string', minLength: 2 },
      },
      required: ['goal'],
      additionalProperties: false,
    },
  },
  {
    name: 'choose_plugin_strategy',
    description: 'Choose between the Sequelize plugin path and a custom plugin path for GraphQL Gene.',
    inputSchema: {
      type: 'object',
      properties: {
        orm: { type: 'string' },
        goal: { type: 'string' },
        wantsCustomPlugin: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'plan_graphql_gene_integration',
    description: 'Produce an actionable GraphQL Gene integration plan with docs, examples, and plugin guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        goal: { type: 'string', minLength: 2 },
        serverStack: { type: 'string' },
        orm: { type: 'string' },
        concerns: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['goal'],
      additionalProperties: false,
    },
  },
  {
    name: 'diagnose_graphql_gene_issue',
    description: 'Diagnose a GraphQL Gene problem and return likely causes plus concrete next checks.',
    inputSchema: {
      type: 'object',
      properties: {
        symptom: { type: 'string', minLength: 2 },
        context: { type: 'string' },
        stage: {
          type: 'string',
          enum: ['install', 'schema', 'runtime', 'plugin', 'query', 'directive'],
        },
      },
      required: ['symptom'],
      additionalProperties: false,
    },
  },
]

export function listKnowledgeMcpTools(): McpToolDescriptor[] {
  return TOOLS
}

export function invokeKnowledgeMcpTool(
  context: McpDomainContext,
  name: string,
  input: Record<string, unknown>,
) {
  switch (name) {
    case 'search_knowledge':
      return runSearchTool(context, input)
    case 'explain_graphql_gene_feature':
      return runExplainFeatureTool(context, input)
    case 'recommend_integration_path':
      return runRecommendIntegrationTool(context, input)
    case 'choose_plugin_strategy':
      return runChoosePluginStrategyTool(context, input)
    case 'plan_graphql_gene_integration':
      return runPlanIntegrationTool(context, input)
    case 'diagnose_graphql_gene_issue':
      return runDiagnoseIssueTool(context, input)
    default:
      throw new Error(`Unknown MCP tool "${name}".`)
  }
}

function runSearchTool(context: McpDomainContext, input: Record<string, unknown>) {
  const query = typeof input.query === 'string' ? input.query : ''
  const limit = typeof input.limit === 'number' ? input.limit : undefined
  const kind = input.kind === 'doc' || input.kind === 'example' ? input.kind : undefined
  const section = typeof input.section === 'string' ? input.section : undefined
  const scenario = typeof input.scenario === 'string' ? input.scenario : undefined

  const results = searchKnowledgeCatalog(context.catalog, {
    query,
    kind,
    section,
    scenario,
    limit,
  }).map(hit => ({
    id: hit.entry.id,
    kind: hit.entry.kind,
    title: hit.entry.title,
    summary: hit.entry.summary,
    score: hit.score,
    matchedFields: hit.matchedFields,
    slug: hit.entry.kind === 'doc' ? hit.entry.slug : undefined,
    scenario: hit.entry.kind === 'example' ? hit.entry.scenario : hit.entry.playgroundScenario,
  }))

  return {
    query,
    resultCount: results.length,
    results,
  }
}

function runExplainFeatureTool(context: McpDomainContext, input: Record<string, unknown>) {
  const feature = typeof input.feature === 'string' ? input.feature : ''
  const matches = searchKnowledgeCatalog(context.catalog, {
    query: feature,
    limit: 5,
  })

  const docs = matches
    .filter((match): match is typeof match & { entry: DocKnowledgeEntry } => match.entry.kind === 'doc')
    .slice(0, 3)
  const examples = matches
    .filter((match): match is typeof match & { entry: ExampleKnowledgeEntry } => match.entry.kind === 'example')
    .slice(0, 2)

  return {
    feature,
    summary: buildFeatureSummary(feature, docs.map(match => match.entry.title), examples.map(match => match.entry.title)),
    docs: docs.map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      slug: match.entry.slug,
      summary: match.entry.summary,
    })),
    examples: examples.map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      scenario: match.entry.scenario,
      summary: match.entry.summary,
    })),
  }
}

function runRecommendIntegrationTool(context: McpDomainContext, input: Record<string, unknown>) {
  const goal = typeof input.goal === 'string' ? input.goal : ''
  const recommendedQuery = inferRecommendationQuery(goal)
  const docs = searchDocs(context, recommendedQuery, 3)
  const examples = searchExamples(context, recommendedQuery, 2)

  return {
    goal,
    recommendation: buildIntegrationRecommendation(goal, recommendedQuery),
    recommendedQuery,
    docs,
    examples,
  }
}

function runChoosePluginStrategyTool(context: McpDomainContext, input: Record<string, unknown>) {
  const orm = typeof input.orm === 'string' ? input.orm : undefined
  const goal = typeof input.goal === 'string' ? input.goal : undefined
  const wantsCustomPlugin = input.wantsCustomPlugin === true
  const strategy = choosePluginStrategy(orm, goal, wantsCustomPlugin)
  const docs = searchDocs(context, strategy.query, 3)
  const examples = searchExamples(context, strategy.query, 2)

  return {
    orm: orm ?? null,
    goal: goal ?? null,
    wantsCustomPlugin,
    strategy: strategy.id,
    recommendedPlugin: strategy.recommendedPlugin,
    rationale: strategy.rationale,
    nextSteps: strategy.nextSteps,
    docs,
    examples,
  }
}

function runPlanIntegrationTool(context: McpDomainContext, input: Record<string, unknown>) {
  const goal = typeof input.goal === 'string' ? input.goal : ''
  const serverStack = typeof input.serverStack === 'string' ? input.serverStack : undefined
  const orm = typeof input.orm === 'string' ? input.orm : undefined
  const concerns = Array.isArray(input.concerns)
    ? input.concerns.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : []
  const focusArea = inferRecommendationQuery([goal, serverStack, orm, ...concerns].filter(Boolean).join(' '))
  const pluginStrategy = choosePluginStrategy(orm, goal, false)
  const docs = searchDocs(context, focusArea, 4)
  const examples = searchExamples(context, focusArea, 3)

  return {
    goal,
    serverStack: serverStack ?? null,
    orm: orm ?? null,
    concerns,
    focusArea,
    pluginStrategy: {
      strategy: pluginStrategy.id,
      recommendedPlugin: pluginStrategy.recommendedPlugin,
      rationale: pluginStrategy.rationale,
    },
    steps: buildIntegrationPlanSteps({
      goal,
      serverStack,
      orm,
      focusArea,
      pluginStrategy: pluginStrategy.id,
      concerns,
    }),
    docs,
    examples,
  }
}

function runDiagnoseIssueTool(context: McpDomainContext, input: Record<string, unknown>) {
  const symptom = typeof input.symptom === 'string' ? input.symptom : ''
  const issueContext = typeof input.context === 'string' ? input.context : undefined
  const stage = typeof input.stage === 'string' ? input.stage : undefined
  const recommendedQuery = inferDiagnosisQuery(symptom, issueContext, stage)
  const docs = searchDocs(context, recommendedQuery, 3)
  const examples = searchExamples(context, recommendedQuery, 2)

  return {
    symptom,
    context: issueContext ?? null,
    stage: stage ?? null,
    diagnosisArea: recommendedQuery,
    likelyCauses: buildLikelyCauses(recommendedQuery),
    recommendedChecks: buildRecommendedChecks(recommendedQuery),
    docs,
    examples,
  }
}

function buildFeatureSummary(feature: string, docs: string[], examples: string[]) {
  const docText = docs.length ? docs.join(', ') : 'No strong doc matches yet'
  const exampleText = examples.length ? examples.join(', ') : 'No strong example matches yet'

  return [
    `Feature: ${feature}`,
    `Relevant docs: ${docText}`,
    `Relevant examples: ${exampleText}`,
    'Use the docs as the primary source of truth and treat adapted playground examples as supporting guidance.',
  ].join(' ')
}

function inferRecommendationQuery(goal: string) {
  const normalized = goal.toLowerCase()

  if (normalized.includes('plugin')) return 'plugin'
  if (normalized.includes('directive') || normalized.includes('auth')) return 'directive'
  if (normalized.includes('block') || normalized.includes('cms') || normalized.includes('polymorphic')) return 'polymorphic'
  if (normalized.includes('query') || normalized.includes('lookahead')) return 'query'
  return 'schema'
}

function inferDiagnosisQuery(symptom: string, issueContext?: string, stage?: string) {
  switch (stage) {
    case 'install':
      return 'getting started'
    case 'schema':
      return 'schema'
    case 'plugin':
      return 'plugin'
    case 'query':
      return 'query'
    case 'directive':
      return 'directive'
    case 'runtime':
      return 'directive'
    default:
      return inferRecommendationQuery([symptom, issueContext].filter(Boolean).join(' '))
  }
}

function buildIntegrationRecommendation(goal: string, recommendedQuery: string) {
  return [
    `Goal: ${goal}`,
    `Focus area: ${recommendedQuery}`,
    'Start from the highest-ranked canonical docs, then validate with the closest example scenario.',
    'If playground behavior differs from upstream docs or source-backed examples, prefer the upstream-aligned docs.',
  ].join(' ')
}

function choosePluginStrategy(orm?: string, goal?: string, wantsCustomPlugin = false) {
  const normalizedOrm = (orm ?? '').toLowerCase()
  const normalizedGoal = (goal ?? '').toLowerCase()

  if (!wantsCustomPlugin && normalizedOrm.includes('sequelize')) {
    return {
      id: 'plugin-sequelize',
      query: 'schema',
      recommendedPlugin: '@graphql-gene/plugin-sequelize',
      rationale: 'The current documented first-class path in this repo is the Sequelize plugin.',
      nextSteps: [
        'Install graphql-gene and @graphql-gene/plugin-sequelize.',
        'Export your GraphQL model types from a single module.',
        'Call generateSchema with pluginSequelize() and your types object.',
      ],
    }
  }

  if (wantsCustomPlugin || normalizedGoal.includes('plugin') || (orm && !normalizedOrm.includes('sequelize'))) {
    return {
      id: 'custom-plugin',
      query: 'plugin',
      recommendedPlugin: null,
      rationale: 'A custom plugin path is the safest recommendation when the target ORM is not clearly covered by the documented Sequelize integration.',
      nextSteps: [
        'Study the Writing a Plugin reference page.',
        'Inspect the Sequelize plugin as the reference implementation.',
        'Define the minimum model, field, and query behaviors your plugin must support first.',
      ],
    }
  }

  return {
    id: 'evaluate-plugin-surface',
    query: 'plugin',
    recommendedPlugin: '@graphql-gene/plugin-sequelize',
    rationale: 'The documented plugin surface should be reviewed first before committing to a custom plugin path.',
    nextSteps: [
      'Confirm whether Sequelize already matches the target data model.',
      'If not, scope the delta between the target ORM and the reference plugin.',
      'Choose between adaptation and a custom plugin once the missing capabilities are clear.',
    ],
  }
}

function buildIntegrationPlanSteps(options: {
  goal: string
  serverStack?: string
  orm?: string
  focusArea: string
  pluginStrategy: string
  concerns: string[]
}) {
  const serverStep = options.serverStack
    ? `Attach the generated schema to ${options.serverStack} once the core GraphQL Gene setup is stable.`
    : 'Attach the generated schema to your GraphQL server after the core setup is stable.'

  const pluginStep = options.pluginStrategy === 'custom-plugin'
    ? 'Design the custom plugin boundary early and keep the first version narrow.'
    : 'Start with the documented Sequelize plugin path before widening the integration.'

  const concernStep = options.concerns.length
    ? `Validate the high-risk concerns next: ${options.concerns.join(', ')}.`
    : `Validate the primary focus area next: ${options.focusArea}.`

  return [
    'Install GraphQL Gene and align the plugin choice with the target ORM.',
    'Export all GraphQL Gene types from a single module so schema generation has one canonical input.',
    'Generate the schema with generateSchema and verify the produced SDL before expanding runtime behavior.',
    pluginStep,
    serverStep,
    concernStep,
  ]
}

function buildLikelyCauses(area: string) {
  switch (area) {
    case 'getting started':
      return [
        'The core package or plugin package is missing or version-misaligned.',
        'The generated schema path was wired before the model exports were consolidated.',
      ]
    case 'schema':
      return [
        'The GraphQL type exports are incomplete or inconsistent.',
        'The generated schema input does not match the intended model graph.',
      ]
    case 'plugin':
      return [
        'The chosen plugin strategy does not match the target ORM behavior.',
        'A custom plugin requirement is being forced through the Sequelize reference path.',
      ]
    case 'query':
      return [
        'The selected GraphQL shape does not align with the generated associations.',
        'Lookahead expectations differ from the current runtime adapter behavior.',
      ]
    case 'directive':
      return [
        'Directive middleware is attached at the wrong level or uses the wrong naming behavior.',
        'The expected SDL output differs from the runtime-only directive behavior.',
      ]
    default:
      return [
        'The current GraphQL Gene setup is not aligned with the documented integration path.',
        'The issue may sit at the boundary between schema generation and runtime wiring.',
      ]
  }
}

function buildRecommendedChecks(area: string) {
  switch (area) {
    case 'getting started':
      return [
        'Verify graphql-gene and plugin package installation.',
        'Compare the setup against the Getting Started doc.',
      ]
    case 'schema':
      return [
        'Inspect the exported types module and confirm every intended type is re-exported.',
        'Print or inspect the generated schema before debugging downstream server behavior.',
      ]
    case 'plugin':
      return [
        'Check whether the target ORM truly maps to the Sequelize plugin assumptions.',
        'Review the Writing a Plugin reference before widening custom behavior.',
      ]
    case 'query':
      return [
        'Compare the requested fields with the documented query/lookahead example.',
        'Inspect whether the runtime path is canonical or adapted.',
      ]
    case 'directive':
      return [
        'Check whether the directive should print into SDL or remain runtime-only.',
        'Verify handler placement on the relevant type or field.',
      ]
    default:
      return [
        'Start from the closest canonical doc and example, then narrow the mismatch.',
        'Prefer upstream-aligned docs over adapted playground behavior when they differ.',
      ]
  }
}

function searchDocs(context: McpDomainContext, query: string, limit: number) {
  return searchKnowledgeCatalog(context.catalog, {
    query,
    kind: 'doc',
    limit,
  })
    .filter((match): match is typeof match & { entry: DocKnowledgeEntry } => match.entry.kind === 'doc')
    .map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      slug: match.entry.slug,
      summary: match.entry.summary,
    }))
}

function searchExamples(context: McpDomainContext, query: string, limit: number) {
  return searchKnowledgeCatalog(context.catalog, {
    query,
    kind: 'example',
    limit,
  })
    .filter((match): match is typeof match & { entry: ExampleKnowledgeEntry } => match.entry.kind === 'example')
    .map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      scenario: match.entry.scenario,
      summary: match.entry.summary,
    }))
}
