import type { McpPromptDescriptor, McpRenderedPrompt } from './contracts'

const PROMPTS: McpPromptDescriptor[] = [
  {
    name: 'start_graphql_gene_integration',
    description: 'Frame an initial GraphQL Gene integration plan for a developer project.',
    arguments: [
      { name: 'goal', description: 'What the developer wants to build with GraphQL Gene.', required: true },
      { name: 'server_stack', description: 'The GraphQL server stack or framework in use.', required: false },
      { name: 'orm', description: 'The ORM or data layer involved.', required: false },
    ],
  },
  {
    name: 'debug_graphql_gene_problem',
    description: 'Guide debugging for a GraphQL Gene issue using canonical docs and examples.',
    arguments: [
      { name: 'symptom', description: 'A short description of the observed problem.', required: true },
      { name: 'context', description: 'Optional surrounding context such as plugin, server, or model setup.', required: false },
    ],
  },
]

export function listKnowledgeMcpPrompts(): McpPromptDescriptor[] {
  return PROMPTS
}

export function renderKnowledgeMcpPrompt(
  name: string,
  args: Record<string, string | undefined>,
): McpRenderedPrompt {
  switch (name) {
    case 'start_graphql_gene_integration':
      return {
        name,
        description: 'Initial GraphQL Gene integration framing prompt.',
        text: [
          'You are helping a developer integrate GraphQL Gene into their own project.',
          `Goal: ${args.goal ?? 'Not provided'}`,
          `Server stack: ${args.server_stack ?? 'Unknown'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          'Explain the recommended implementation path, call out the likely plugin strategy,',
          'and reference the most relevant GraphQL Gene docs and examples.',
        ].join('\n'),
      }
    case 'debug_graphql_gene_problem':
      return {
        name,
        description: 'GraphQL Gene debugging prompt.',
        text: [
          'You are diagnosing a GraphQL Gene issue for a developer.',
          `Symptom: ${args.symptom ?? 'Not provided'}`,
          `Context: ${args.context ?? 'Not provided'}`,
          'Prioritize source-backed explanations, likely causes, and the next concrete checks.',
          'Reference canonical GraphQL Gene docs and examples where possible.',
        ].join('\n'),
      }
    default:
      throw new Error(`Unknown MCP prompt "${name}".`)
  }
}
