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
  {
    name: 'choose_integration_recipe',
    description: 'Pick the most relevant GraphQL Gene integration recipe for the current stack.',
    arguments: [
      { name: 'goal', description: 'What the developer is trying to build.', required: true },
      { name: 'server_stack', description: 'GraphQL server or application framework in use.', required: false },
      { name: 'orm', description: 'ORM or persistence layer in use.', required: false },
    ],
  },
  {
    name: 'author_graphql_gene_plugin',
    description: 'Frame a custom GraphQL Gene plugin implementation task.',
    arguments: [
      { name: 'orm', description: 'The ORM or backend system that needs a plugin.', required: true },
      { name: 'capability', description: 'What the plugin must support.', required: false },
    ],
  },
  {
    name: 'plan_graphql_gene_upgrade',
    description: 'Plan a GraphQL Gene migration or upgrade path with source-backed checks.',
    arguments: [
      { name: 'current_state', description: 'Short description of the current project setup.', required: true },
      { name: 'target_state', description: 'What the developer wants the upgraded setup to look like.', required: false },
      { name: 'risk_area', description: 'The most likely upgrade risk such as plugins, directives, or schema generation.', required: false },
    ],
  },
  {
    name: 'triage_graphql_gene_issue',
    description: 'Frame a GraphQL Gene troubleshooting triage flow before deeper debugging.',
    arguments: [
      { name: 'symptom', description: 'Short description of the observed issue.', required: true },
      { name: 'stage', description: 'Where the issue appears, such as install, schema, plugin, query, or directive.', required: false },
      { name: 'context', description: 'Optional plugin, ORM, or server context.', required: false },
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
    case 'choose_integration_recipe':
      return {
        name,
        description: 'GraphQL Gene integration recipe selection prompt.',
        text: [
          'Choose the best GraphQL Gene integration recipe for the developer context below.',
          `Goal: ${args.goal ?? 'Not provided'}`,
          `Server stack: ${args.server_stack ?? 'Unknown'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          'Recommend the most suitable plugin strategy, the first implementation steps,',
          'and the canonical docs/examples the developer should inspect first.',
        ].join('\n'),
      }
    case 'author_graphql_gene_plugin':
      return {
        name,
        description: 'GraphQL Gene custom plugin authoring prompt.',
        text: [
          'Help the developer design a custom GraphQL Gene plugin.',
          `Target ORM/backend: ${args.orm ?? 'Not provided'}`,
          `Required capability: ${args.capability ?? 'Not provided'}`,
          'Explain the plugin strategy, what to study in the reference implementation,',
          'and the minimum milestones for a safe first version.',
        ].join('\n'),
      }
    case 'plan_graphql_gene_upgrade':
      return {
        name,
        description: 'GraphQL Gene migration and upgrade planning prompt.',
        text: [
          'Plan a safe GraphQL Gene migration or upgrade path for the developer context below.',
          `Current state: ${args.current_state ?? 'Not provided'}`,
          `Target state: ${args.target_state ?? 'Not provided'}`,
          `Primary risk area: ${args.risk_area ?? 'Not provided'}`,
          'Prioritize canonical docs, plugin notes, recipes, and troubleshooting entries that reduce upgrade risk.',
          'Call out the first validations to run before changing runtime behavior.',
        ].join('\n'),
      }
    case 'triage_graphql_gene_issue':
      return {
        name,
        description: 'GraphQL Gene troubleshooting triage prompt.',
        text: [
          'Triage a GraphQL Gene issue before suggesting deeper fixes.',
          `Symptom: ${args.symptom ?? 'Not provided'}`,
          `Stage: ${args.stage ?? 'Not provided'}`,
          `Context: ${args.context ?? 'Not provided'}`,
          'Identify the most likely knowledge area to inspect first, then reference the best supporting docs, recipes, examples, or troubleshooting entries.',
          'Keep the triage source-backed and biased toward canonical guidance over adapted runtime demos.',
        ].join('\n'),
      }
    default:
      throw new Error(`Unknown MCP prompt "${name}".`)
  }
}
