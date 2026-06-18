export interface McpEvalCase {
  id: string
  description: string
  toolName: string
  input: Record<string, unknown>
  expected: {
    resultCountAtLeast?: number
    topResultId?: string
    topResultKind?: 'doc' | 'example' | 'plugin' | 'recipe' | 'troubleshooting'
    resultIdsInclude?: string[]
    strategy?: string
    recommendedPlugin?: string | null
    selectedRecipeId?: string | null
    selectedIssueId?: string | null
    recommendedQuery?: string
    focusArea?: string
    diagnosisArea?: string
    docsFirstId?: string
    docsInclude?: string[]
    examplesInclude?: string[]
    pluginsInclude?: string[]
    recipesInclude?: string[]
    troubleshootingInclude?: string[]
    stepsAtLeast?: number
    summaryIncludes?: string[]
    recommendationIncludes?: string[]
    rationaleIncludes?: string[]
    recommendedChecksInclude?: string[]
    topTaskId?: string
    taskId?: string
    rankedTaskIdsInclude?: string[]
    recommendedNextTool?: string
    nextTool?: string
    warningIncludes?: string[]
    pluginStrategy?: string
  }
}

export const mcpEvalCases: McpEvalCase[] = [
  {
    id: 'docs-search-prefers-canonical-directives-doc',
    description: 'Search should rank the canonical directives doc above the adapted playground example.',
    toolName: 'search_knowledge',
    input: {
      query: 'directive',
      limit: 5,
    },
    expected: {
      resultCountAtLeast: 2,
      topResultId: 'doc:/docs/guides/directives',
      topResultKind: 'doc',
      resultIdsInclude: ['example:directive-middleware:user-auth-directive'],
    },
  },
  {
    id: 'feature-explanation-keeps-docs-authoritative',
    description: 'Feature explanations should carry the docs-first provenance policy alongside the closest recipe and example.',
    toolName: 'explain_graphql_gene_feature',
    input: {
      feature: 'polymorphic blocks',
    },
    expected: {
      docsFirstId: 'doc:/docs/guides/polymorphic-blocks',
      docsInclude: ['doc:/docs/guides/polymorphic-blocks'],
      examplesInclude: ['example:polymorphic-blocks:page-blocks-basic'],
      recipesInclude: ['recipe:polymorphic-content-blocks'],
      summaryIncludes: [
        'Use the docs as the primary source of truth',
        'adapted playground examples as supporting guidance',
      ],
    },
  },
  {
    id: 'integration-recommendation-finds-directive-recipe',
    description: 'High-level integration guidance should route directive use cases into the directive recipe and docs.',
    toolName: 'recommend_integration_path',
    input: {
      goal: 'I need an auth directive for my user model',
    },
    expected: {
      selectedRecipeId: 'recipe:directive-middleware-auth',
      recommendedQuery: 'directive',
      docsInclude: ['doc:/docs/guides/directives'],
      examplesInclude: ['example:directive-middleware:user-auth-directive'],
      recipesInclude: ['recipe:directive-middleware-auth'],
      recommendationIncludes: [
        'Recommended recipe: Attach Runtime Middleware With Directives',
        'Start from the canonical docs linked to that recipe',
      ],
    },
  },
  {
    id: 'plugin-strategy-prefers-sequelize-path',
    description: 'Sequelize projects should be routed to the first-class plugin rather than custom plugin work.',
    toolName: 'choose_plugin_strategy',
    input: {
      orm: 'Sequelize',
      goal: 'Generate schema from my SQL models',
    },
    expected: {
      strategy: 'plugin-sequelize',
      recommendedPlugin: '@graphql-gene/plugin-sequelize',
      docsInclude: ['doc:/docs/concepts/getting-started'],
      pluginsInclude: ['plugin:sequelize'],
      recipesInclude: ['recipe:sequelize-bootstrap'],
      rationaleIncludes: ['For ORM "Sequelize"'],
    },
  },
  {
    id: 'plugin-strategy-switches-to-custom-plugin',
    description: 'Non-Sequelize projects that explicitly want a plugin path should pivot to custom plugin guidance.',
    toolName: 'choose_plugin_strategy',
    input: {
      orm: 'Prisma',
      goal: 'I need a GraphQL Gene plugin for my existing models',
      wantsCustomPlugin: true,
    },
    expected: {
      strategy: 'custom-plugin',
      docsInclude: ['doc:/docs/reference/writing-a-plugin'],
      pluginsInclude: ['plugin:custom-plugin'],
      recipesInclude: ['recipe:custom-plugin-evaluation'],
      rationaleIncludes: ['Custom plugin preference is enabled'],
    },
  },
  {
    id: 'integration-plan-produces-polymorphic-recipe',
    description: 'Planning should build a concrete polymorphic-blocks path with docs-first ordering and actionable steps.',
    toolName: 'plan_graphql_gene_integration',
    input: {
      goal: 'Model polymorphic CMS blocks with GraphQL Gene',
      serverStack: 'Apollo Server',
      concerns: ['inline fragments', 'content blocks'],
    },
    expected: {
      selectedRecipeId: 'recipe:polymorphic-content-blocks',
      focusArea: 'polymorphic',
      docsInclude: ['doc:/docs/guides/polymorphic-blocks'],
      examplesInclude: ['example:polymorphic-blocks:page-blocks-basic'],
      recipesInclude: ['recipe:polymorphic-content-blocks'],
      pluginsInclude: ['plugin:sequelize'],
      stepsAtLeast: 4,
    },
  },
  {
    id: 'issue-diagnosis-favors-upstream-over-playground',
    description: 'Troubleshooting should explicitly tell agents to trust upstream docs over adapted playground behavior when they differ.',
    toolName: 'diagnose_graphql_gene_issue',
    input: {
      symptom: 'the playground behavior differs from the upstream docs',
      context: 'website demo looks different than repo guidance',
      stage: 'runtime',
    },
    expected: {
      selectedIssueId: 'troubleshooting:playground-runtime-differs-from-upstream-guidance',
      diagnosisArea: 'runtime',
      docsInclude: ['doc:/mcp/setup'],
      troubleshootingInclude: ['troubleshooting:playground-runtime-differs-from-upstream-guidance'],
      recommendedChecksInclude: [
        'Prefer the upstream-aligned docs and canonical knowledge entries when they conflict with the playground.',
        'Treat the playground as a capability showcase rather than the primary truth source.',
      ],
    },
  },
  {
    id: 'developer-task-sequelize-bootstrap-plan',
    description: 'Developer task planning should produce a Sequelize-first bootstrap path for model-to-schema adoption.',
    toolName: 'plan_developer_task',
    input: {
      taskId: 'bootstrap-sequelize-project',
      goal: 'Generate a schema from my Sequelize models',
      project: {
        orm: 'Sequelize',
        serverStack: 'Apollo Server',
      },
    },
    expected: {
      taskId: 'bootstrap-sequelize-project',
      pluginStrategy: 'plugin-sequelize',
      docsInclude: ['doc:/docs/concepts/getting-started'],
      pluginsInclude: ['plugin:sequelize'],
      recipesInclude: ['recipe:sequelize-bootstrap'],
      stepsAtLeast: 4,
    },
  },
  {
    id: 'developer-task-custom-plugin-decision',
    description: 'Developer task planning should pivot Prisma-like projects into the custom plugin path.',
    toolName: 'plan_developer_task',
    input: {
      taskId: 'choose-plugin-strategy',
      goal: 'We use Prisma models and need GraphQL Gene integration',
      project: {
        orm: 'Prisma',
        serverStack: 'Apollo Server',
      },
    },
    expected: {
      taskId: 'choose-plugin-strategy',
      pluginStrategy: 'custom-plugin-evaluation',
      docsInclude: ['doc:/docs/reference/writing-a-plugin'],
      pluginsInclude: ['plugin:custom-plugin'],
      recipesInclude: ['recipe:custom-plugin-evaluation'],
    },
  },
  {
    id: 'developer-task-auth-directive-plan',
    description: 'Directive middleware planning should stay on the canonical directive recipe and plugin path.',
    toolName: 'plan_developer_task',
    input: {
      taskId: 'attach-directive-middleware',
      goal: 'Add an auth directive to generated fields',
      project: {
        orm: 'Sequelize',
        serverStack: 'Apollo Server',
      },
    },
    expected: {
      taskId: 'attach-directive-middleware',
      pluginStrategy: 'plugin-sequelize',
      docsInclude: ['doc:/docs/guides/directives'],
      recipesInclude: ['recipe:directive-middleware-auth'],
      stepsAtLeast: 4,
    },
  },
  {
    id: 'developer-task-lookahead-diagnosis',
    description: 'Lookahead or N+1 symptoms should map to the canonical query optimization task.',
    toolName: 'diagnose_developer_issue',
    input: {
      symptom: 'Nested order query triggers too many SQL statements',
      stage: 'query',
      project: {
        orm: 'Sequelize',
      },
    },
    expected: {
      taskId: 'optimize-lookahead-loading',
      diagnosisArea: 'query',
      recommendedChecksInclude: [
        'Compare the requested fields with the documented query/lookahead example.',
      ],
      nextTool: 'plan_developer_task',
    },
  },
  {
    id: 'developer-task-polymorphic-parity-warning',
    description: 'Polymorphic planning should surface package parity warnings when upstream exports are not confirmed.',
    toolName: 'plan_developer_task',
    input: {
      taskId: 'model-polymorphic-content-blocks',
      goal: 'Model polymorphic content blocks',
      project: {
        orm: 'Sequelize',
        serverStack: 'Apollo Server',
      },
    },
    expected: {
      taskId: 'model-polymorphic-content-blocks',
      warningIncludes: ['did not confirm a public "Polymorphic" export'],
      docsInclude: ['doc:/docs/guides/polymorphic-blocks'],
      recipesInclude: ['recipe:polymorphic-content-blocks'],
    },
  },
  {
    id: 'developer-task-missing-schema-type-diagnosis',
    description: 'Missing generated schema types should map to schema-generation diagnostics.',
    toolName: 'diagnose_developer_issue',
    input: {
      symptom: 'Generated schema is missing expected model fields',
      stage: 'schema',
      project: {
        orm: 'Sequelize',
      },
    },
    expected: {
      taskId: 'debug-schema-generation',
      diagnosisArea: 'schema',
      recommendedChecksInclude: [
        'Inspect the exported types module and confirm every intended type is re-exported.',
      ],
      nextTool: 'plan_developer_task',
    },
  },
  {
    id: 'developer-task-handwritten-schema-migration-classification',
    description: 'Migration goals should classify into the handwritten-schema migration task before code changes.',
    toolName: 'classify_developer_goal',
    input: {
      goal: 'Migrate part of our hand-written schema to GraphQL Gene without rewriting everything',
      project: {
        orm: 'Sequelize',
        currentGraphqlSetup: 'hand-written schema',
      },
    },
    expected: {
      topTaskId: 'migrate-from-handwritten-schema',
      recommendedNextTool: 'plan_developer_task',
      rankedTaskIdsInclude: ['migrate-from-handwritten-schema'],
    },
  },
]
