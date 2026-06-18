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
    name: 'select_graphql_gene_plugin_strategy',
    description: 'Choose the right GraphQL Gene plugin path for the developer project.',
    arguments: [
      { name: 'goal', description: 'What the developer wants to achieve.', required: true },
      { name: 'orm', description: 'The ORM or model layer in use.', required: false },
      { name: 'current_graphql_setup', description: 'How the current schema/runtime is organized.', required: false },
    ],
  },
  {
    name: 'setup_graphql_gene_schema_generation',
    description: 'Frame a safe schema-generation setup workflow for GraphQL Gene.',
    arguments: [
      { name: 'goal', description: 'What schema-generation outcome the developer wants.', required: true },
      { name: 'server_stack', description: 'The GraphQL server stack or framework in use.', required: false },
      { name: 'orm', description: 'The ORM or data layer involved.', required: false },
      { name: 'model_surface', description: 'The model set or domain slice targeted first.', required: false },
    ],
  },
  {
    name: 'implement_graphql_gene_directive_middleware',
    description: 'Guide a directive-middleware implementation path with GraphQL Gene.',
    arguments: [
      { name: 'goal', description: 'What the directive should enforce or transform.', required: true },
      { name: 'directive_goal', description: 'The directive behavior or policy being targeted.', required: false },
      { name: 'server_stack', description: 'The GraphQL server stack or framework in use.', required: false },
      { name: 'orm', description: 'The ORM or data layer involved.', required: false },
    ],
  },
  {
    name: 'debug_graphql_gene_lookahead',
    description: 'Guide lookahead or N+1 debugging with GraphQL Gene.',
    arguments: [
      { name: 'symptom', description: 'The observed query performance or loading problem.', required: true },
      { name: 'server_stack', description: 'The GraphQL server stack or framework in use.', required: false },
      { name: 'orm', description: 'The ORM or data layer involved.', required: false },
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
    name: 'migrate_handwritten_schema_to_graphql_gene',
    description: 'Plan an incremental migration from a hand-written schema to GraphQL Gene.',
    arguments: [
      { name: 'current_schema_shape', description: 'How the current hand-written schema is organized.', required: true },
      { name: 'target_migration_slice', description: 'The first domain slice to migrate.', required: false },
      { name: 'orm', description: 'The ORM or data layer involved.', required: false },
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

function renderHostAgentGuardrails(nextTools: string[]) {
  return [
    'Inspect the local project files through the host coding agent before acting on this prompt.',
    'The MCP server cannot read the developer project directly; pass summarized models, server wiring, plugin choices, and constraints into the next tool call.',
    `Recommended MCP tool sequence: ${nextTools.join(' -> ')}.`,
  ]
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
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'plan_developer_task',
            'adapt_example_to_project',
            'validate_developer_task_plan',
          ]),
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
          ...renderHostAgentGuardrails([
            'diagnose_developer_issue',
            'plan_developer_task',
          ]),
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
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'plan_graphql_gene_integration',
            'plan_developer_task',
          ]),
        ].join('\n'),
      }
    case 'select_graphql_gene_plugin_strategy':
      return {
        name,
        description: 'GraphQL Gene plugin strategy selection prompt.',
        text: [
          'Choose the right GraphQL Gene plugin strategy for the developer project.',
          `Goal: ${args.goal ?? 'Not provided'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          `Current GraphQL setup: ${args.current_graphql_setup ?? 'Unknown'}`,
          'Explain whether the project fits the Sequelize path or needs a custom plugin path,',
          'and identify the first docs, recipes, and package surfaces to inspect.',
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'choose_plugin_strategy',
            'plan_developer_task',
          ]),
        ].join('\n'),
      }
    case 'setup_graphql_gene_schema_generation':
      return {
        name,
        description: 'GraphQL Gene schema generation setup prompt.',
        text: [
          'Set up GraphQL Gene schema generation in a controlled, source-backed way.',
          `Goal: ${args.goal ?? 'Not provided'}`,
          `Server stack: ${args.server_stack ?? 'Unknown'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          `Target model surface: ${args.model_surface ?? 'Unknown'}`,
          'Prioritize plugin selection, canonical types exports, generated SDL inspection, and staged server wiring.',
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'plan_developer_task',
            'validate_developer_task_plan',
          ]),
        ].join('\n'),
      }
    case 'implement_graphql_gene_directive_middleware':
      return {
        name,
        description: 'GraphQL Gene directive middleware implementation prompt.',
        text: [
          'Implement directive middleware with GraphQL Gene without over-trusting demo runtime behavior.',
          `Goal: ${args.goal ?? 'Not provided'}`,
          `Directive target: ${args.directive_goal ?? 'Not provided'}`,
          `Server stack: ${args.server_stack ?? 'Unknown'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          'Decide whether the directive is runtime-only or SDL-visible, then map the behavior onto the project server boundary.',
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'plan_developer_task',
            'adapt_example_to_project',
            'validate_developer_task_plan',
          ]),
        ].join('\n'),
      }
    case 'debug_graphql_gene_lookahead':
      return {
        name,
        description: 'GraphQL Gene lookahead debugging prompt.',
        text: [
          'Debug GraphQL Gene lookahead or N+1 behavior with canonical guidance first.',
          `Symptom: ${args.symptom ?? 'Not provided'}`,
          `Server stack: ${args.server_stack ?? 'Unknown'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          'Focus on generated association shape, selected-field-driven loading, and query-path validation before rewriting resolvers.',
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'diagnose_developer_issue',
            'plan_developer_task',
          ]),
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
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'choose_plugin_strategy',
            'plan_developer_task',
          ]),
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
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'plan_developer_task',
            'validate_developer_task_plan',
          ]),
        ].join('\n'),
      }
    case 'migrate_handwritten_schema_to_graphql_gene':
      return {
        name,
        description: 'GraphQL Gene hand-written schema migration prompt.',
        text: [
          'Plan an incremental migration from a hand-written schema to GraphQL Gene.',
          `Current schema shape: ${args.current_schema_shape ?? 'Not provided'}`,
          `Target migration slice: ${args.target_migration_slice ?? 'Not provided'}`,
          `ORM/data layer: ${args.orm ?? 'Unknown'}`,
          'Start with a low-risk model surface, preserve explicit boundaries for any remaining hand-written runtime layers, and insist on schema inspection before server cutover.',
          ...renderHostAgentGuardrails([
            'classify_developer_goal',
            'plan_developer_task',
            'validate_developer_task_plan',
          ]),
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
          ...renderHostAgentGuardrails([
            'diagnose_developer_issue',
            'plan_developer_task',
          ]),
        ].join('\n'),
      }
    default:
      throw new Error(`Unknown MCP prompt "${name}".`)
  }
}
