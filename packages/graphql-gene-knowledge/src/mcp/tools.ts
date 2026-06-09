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
  const docs = searchKnowledgeCatalog(context.catalog, {
    query: recommendedQuery,
    kind: 'doc',
    limit: 3,
  })
    .filter((match): match is typeof match & { entry: DocKnowledgeEntry } => match.entry.kind === 'doc')
    .map(match => ({
    id: match.entry.id,
    title: match.entry.title,
    slug: match.entry.slug,
  }))

  const examples = searchKnowledgeCatalog(context.catalog, {
    query: recommendedQuery,
    kind: 'example',
    limit: 2,
  })
    .filter((match): match is typeof match & { entry: ExampleKnowledgeEntry } => match.entry.kind === 'example')
    .map(match => ({
    id: match.entry.id,
    title: match.entry.title,
    scenario: match.entry.scenario,
  }))

  return {
    goal,
    recommendation: buildIntegrationRecommendation(goal, recommendedQuery),
    recommendedQuery,
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

function buildIntegrationRecommendation(goal: string, recommendedQuery: string) {
  return [
    `Goal: ${goal}`,
    `Focus area: ${recommendedQuery}`,
    'Start from the highest-ranked canonical docs, then validate with the closest example scenario.',
    'If playground behavior differs from upstream docs or source-backed examples, prefer the upstream-aligned docs.',
  ].join(' ')
}
