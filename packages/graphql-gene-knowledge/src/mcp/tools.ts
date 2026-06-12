import type {
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeEntry,
  KnowledgeKind,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
  TroubleshootingKnowledgeEntry,
} from '../contracts'
import {
  adaptExampleToProject,
  listDeveloperTaskPatterns,
  planDeveloperTask,
  validateDeveloperTaskPlan,
  type AdaptExampleToProjectInput,
  type DeveloperTaskPlanInput,
  type ValidateDeveloperTaskPlanInput,
} from '../developer/task-patterns'
import {
  comparePlaygroundWithCanonical,
  inspectPlaygroundScenario,
  listPlaygroundParityGates,
  planPlaygroundScenario,
  validatePlaygroundScenario,
  type PlaygroundCanonicalComparisonInput,
  type PlaygroundScenarioImplementationSummary,
  type PlaygroundScenarioPlanInput,
} from '../playground/maintainer'
import {
  findDocsByIds,
  findExamplesByIds,
  findPluginsByIds,
  findRecipesByIds,
  inferFocusArea,
  selectPluginEntries,
  selectRecipeEntries,
  selectTroubleshootingEntries,
} from './decision'
import type { McpDomainContext, McpToolDescriptor } from './contracts'
import { searchKnowledgeCatalog } from '../query/search'

const TOOLS: McpToolDescriptor[] = [
  {
    name: 'search_knowledge',
    description: 'Search the canonical GraphQL Gene knowledge catalog by keyword, kind, section, or scenario.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 2 },
        kind: { type: 'string', enum: ['doc', 'example', 'plugin', 'recipe', 'troubleshooting'] },
        section: { type: 'string' },
        scenario: { type: 'string' },
        limit: { type: 'integer', minimum: 1, maximum: 25 },
        targetVersion: { type: 'string' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'explain_graphql_gene_feature',
    description: 'Summarize a GraphQL Gene feature and point to the most relevant canonical docs, examples, plugins, recipes, and troubleshooting entries.',
    inputSchema: {
      type: 'object',
      properties: {
        feature: { type: 'string', minLength: 2 },
        question: {
          type: 'object',
          properties: {
            feature: { type: 'string' },
            desiredDepth: { type: 'string', enum: ['brief', 'standard', 'deep'] },
            currentContext: { type: 'string' },
            targetVersion: { type: 'string' },
          },
          additionalProperties: false,
        },
        targetVersion: { type: 'string' },
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
        project: projectSummaryJsonSchema(),
        targetVersion: { type: 'string' },
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
        project: projectSummaryJsonSchema(),
        targetVersion: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'plan_graphql_gene_integration',
    description: 'Produce an actionable GraphQL Gene integration plan with docs, examples, recipes, and plugin guidance.',
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
        project: projectSummaryJsonSchema(),
        targetVersion: { type: 'string' },
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
        issue: issueReportJsonSchema(),
        project: projectSummaryJsonSchema(),
        targetVersion: { type: 'string' },
      },
      required: ['symptom'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_developer_task_patterns',
    description: 'List source-backed GraphQL Gene developer task patterns derived from the canonical docs, recipes, and examples.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        scenario: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'plan_developer_task',
    description: 'Plan how a developer should implement a GraphQL Gene task pattern in their own project.',
    inputSchema: {
      type: 'object',
      properties: {
        patternId: { type: 'string' },
        goal: { type: 'string' },
        project: projectSummaryJsonSchema(),
        constraints: { type: 'array', items: { type: 'string' } },
        targetVersion: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'adapt_example_to_project',
    description: 'Explain how to adapt a canonical GraphQL Gene example pattern to a developer project without copying website playground runtime code.',
    inputSchema: {
      type: 'object',
      properties: {
        patternId: { type: 'string' },
        exampleId: { type: 'string' },
        goal: { type: 'string' },
        project: projectSummaryJsonSchema(),
        targetModels: { type: 'array', items: { type: 'string' } },
        constraints: { type: 'array', items: { type: 'string' } },
        targetVersion: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'validate_developer_task_plan',
    description: 'Validate a developer-facing GraphQL Gene task plan against canonical pattern guidance and playground-source boundaries.',
    inputSchema: {
      type: 'object',
      properties: {
        patternId: { type: 'string' },
        goal: { type: 'string' },
        project: projectSummaryJsonSchema(),
        proposedSteps: { type: 'array', items: { type: 'string' } },
        selectedPlugin: { type: 'string' },
        usesPlaygroundCodeAsSource: { type: 'boolean' },
        usesPlaygroundRuntimeAsSource: { type: 'boolean' },
        includesSchemaInspection: { type: 'boolean' },
        includesTests: { type: 'boolean' },
        includesPluginDecision: { type: 'boolean' },
        handlesLookahead: { type: 'boolean' },
        handlesDirectiveRuntimeMode: { type: 'boolean' },
        handlesPolymorphicResolution: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'inspect_playground_scenario',
    description: 'Maintainer tool: inspect the canonical contract for a playground scenario before implementing UI, API, or runtime behavior.',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string', minLength: 2 },
      },
      required: ['scenario'],
      additionalProperties: false,
    },
  },
  {
    name: 'validate_playground_scenario',
    description: 'Maintainer tool: validate a playground scenario implementation summary against canonical metadata and parity gates.',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string', minLength: 2 },
        exampleId: { type: 'string' },
        editableFields: { type: 'array', items: { type: 'string' } },
        docsSlugs: { type: 'array', items: { type: 'string' } },
        outputPanels: { type: 'array', items: { type: 'string' } },
        executionMode: { type: 'string', enum: ['canonical', 'adapted', 'simulated'] },
        declaresAdaptedRuntime: { type: 'boolean' },
        hasFixture: { type: 'boolean' },
        hasApiValidation: { type: 'boolean' },
        hasTests: { type: 'boolean' },
        usesHardcodedOutput: { type: 'boolean' },
        sourcePath: { type: 'string' },
        runtimeSourcePath: { type: 'string' },
      },
      required: ['scenario'],
      additionalProperties: false,
    },
  },
  {
    name: 'plan_playground_scenario',
    description: 'Maintainer tool: plan the implementation artifacts and parity gates for a new or existing playground scenario.',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string', minLength: 2 },
        goal: { type: 'string' },
        exampleId: { type: 'string' },
        executionMode: { type: 'string', enum: ['canonical', 'adapted', 'simulated'] },
        editableFields: { type: 'array', items: { type: 'string' } },
        outputPanels: { type: 'array', items: { type: 'string' } },
        upstreamSourcePath: { type: 'string' },
      },
      required: ['scenario'],
      additionalProperties: false,
    },
  },
  {
    name: 'compare_playground_with_canonical',
    description: 'Maintainer tool: compare observed playground behavior with the canonical scenario contract and flag parity overclaims.',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string', minLength: 2 },
        exampleId: { type: 'string' },
        observedExecutionMode: { type: 'string', enum: ['canonical', 'adapted', 'simulated'] },
        observedSourceType: { type: 'string' },
        observedBehaviorSummary: { type: 'string' },
      },
      required: ['scenario'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_playground_parity_gates',
    description: 'Maintainer tool: list the parity gates that every playground scenario implementation should satisfy.',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string' },
      },
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
    case 'list_developer_task_patterns':
      return runListDeveloperTaskPatternsTool(context, input)
    case 'plan_developer_task':
      return runPlanDeveloperTaskTool(context, input)
    case 'adapt_example_to_project':
      return runAdaptExampleToProjectTool(context, input)
    case 'validate_developer_task_plan':
      return runValidateDeveloperTaskPlanTool(context, input)
    case 'inspect_playground_scenario':
      return runInspectPlaygroundScenarioTool(context, input)
    case 'validate_playground_scenario':
      return runValidatePlaygroundScenarioTool(context, input)
    case 'plan_playground_scenario':
      return runPlanPlaygroundScenarioTool(context, input)
    case 'compare_playground_with_canonical':
      return runComparePlaygroundWithCanonicalTool(context, input)
    case 'list_playground_parity_gates':
      return runListPlaygroundParityGatesTool(context, input)
    default:
      throw new Error(`Unknown MCP tool "${name}".`)
  }
}

function runSearchTool(context: McpDomainContext, input: Record<string, unknown>) {
  const query = typeof input.query === 'string' ? input.query : ''
  const limit = typeof input.limit === 'number' ? input.limit : undefined
  const kind = asKnowledgeKind(input.kind)
  const section = typeof input.section === 'string' ? input.section : undefined
  const scenario = typeof input.scenario === 'string' ? input.scenario : undefined
  const targetVersion = readString(input.targetVersion)

  const results = searchKnowledgeCatalog(context.catalog, {
    query,
    kind,
    section,
    scenario,
    limit,
  }).map(hit => serializeSearchHit(hit.entry, hit.score, hit.matchedFields))

  return {
    query,
    targetVersion: targetVersion ?? null,
    resultCount: results.length,
    results,
  }
}

function runExplainFeatureTool(context: McpDomainContext, input: Record<string, unknown>) {
  const question = isRecord(input.question) ? input.question : undefined
  const feature = readString(question?.feature) ?? readString(input.feature) ?? ''
  const targetVersion = readString(input.targetVersion) ?? readString(question?.targetVersion)
  const desiredDepth = readString(question?.desiredDepth)
  const currentContext = readString(question?.currentContext)
  const docs = searchDocs(context, feature, 3)
  const examples = searchExamples(context, feature, 2)
  const plugins = searchPlugins(context, feature, 2)
  const recipes = searchRecipes(context, feature, 2)
  const troubleshooting = searchTroubleshooting(context, feature, 2)

  return {
    feature,
    targetVersion: targetVersion ?? null,
    desiredDepth: desiredDepth ?? 'standard',
    currentContext: currentContext ?? null,
    summary: buildFeatureSummary({
      feature,
      docs: docs.map(match => match.title),
      examples: examples.map(match => match.title),
      plugins: plugins.map(match => match.title),
      recipes: recipes.map(match => match.title),
      troubleshooting: troubleshooting.map(match => match.title),
    }),
    docs,
    examples,
    plugins,
    recipes,
    troubleshooting,
  }
}

function runRecommendIntegrationTool(context: McpDomainContext, input: Record<string, unknown>) {
  const project = readProjectSummary(input.project)
  const targetVersion = readString(input.targetVersion) ?? project.graphqlGeneVersion
  const goal = readString(input.goal) ?? project.targetOutcome ?? ''
  const decisionText = joinContextText(goal, project.targetOutcome, project.currentGraphqlSetup, ...(project.constraints ?? []))
  const recipes = selectRecipeEntries(context.catalog, {
    goal: decisionText,
    serverStack: project.serverStack,
    orm: project.orm,
    concerns: project.constraints,
  }, 2)
  const primaryRecipe = recipes[0]
  const plugins = primaryRecipe?.recommendedPluginIds.length
    ? findPluginsByIds(context.catalog, primaryRecipe.recommendedPluginIds)
    : selectPluginEntries(context.catalog, { goal: decisionText, orm: project.orm }, 2)
  const primaryDocs = primaryRecipe
    ? findDocsByIds(context.catalog, primaryRecipe.recommendedDocIds)
    : searchDocs(context, decisionText, 3)
  const primaryExamples = primaryRecipe
    ? findExamplesByIds(context.catalog, primaryRecipe.recommendedExampleIds)
    : searchExamples(context, decisionText, 2)

  return {
    goal,
    targetVersion: targetVersion ?? null,
    projectContext: serializeProjectContext(project),
    selectedRecipeId: primaryRecipe?.id ?? null,
    recommendedQuery: inferFocusArea([goal, primaryRecipe?.title, primaryRecipe?.goal].filter(Boolean).join(' ')),
    recommendation: buildIntegrationRecommendation(goal, primaryRecipe),
    docs: mapDocs(primaryDocs).slice(0, 3),
    examples: mapExamples(primaryExamples).slice(0, 2),
    recipes: mapRecipes(recipes),
    plugins: mapPlugins(plugins).slice(0, 2),
  }
}

function runChoosePluginStrategyTool(context: McpDomainContext, input: Record<string, unknown>) {
  const project = readProjectSummary(input.project)
  const targetVersion = readString(input.targetVersion) ?? project.graphqlGeneVersion
  const orm = readString(input.orm) ?? project.orm
  const goal = readString(input.goal) ?? project.targetOutcome
  const wantsCustomPlugin = input.wantsCustomPlugin === true
  const decisionGoal = joinContextText(goal, project.currentGraphqlSetup, ...(project.constraints ?? [])) || undefined
  const plugins = selectPluginEntries(context.catalog, {
    orm,
    goal: decisionGoal,
    wantsCustomPlugin,
  }, 2)
  const primaryPlugin = plugins[0]
  const recipes = primaryPlugin?.recommendedRecipeIds.length
    ? findRecipesByIds(context.catalog, primaryPlugin.recommendedRecipeIds)
    : selectRecipeEntries(context.catalog, {
      goal: [goal, orm].filter(Boolean).join(' ') || 'plugin',
      orm,
    }, 2)
  const docs = primaryPlugin
    ? findDocsByIds(context.catalog, primaryPlugin.recommendedDocIds)
    : searchDocs(context, 'plugin', 3)
  const examples = primaryPlugin
    ? findExamplesByIds(context.catalog, primaryPlugin.recommendedExampleIds)
    : searchExamples(context, 'plugin', 2)

  return {
    orm: orm ?? null,
    goal: goal ?? null,
    targetVersion: targetVersion ?? null,
    projectContext: serializeProjectContext(project),
    wantsCustomPlugin,
    strategy: derivePluginStrategyId(primaryPlugin),
    recommendedPlugin: primaryPlugin?.packageName ?? null,
    rationale: buildPluginRationale(primaryPlugin, orm, wantsCustomPlugin),
    nextSteps: buildPluginNextSteps(primaryPlugin, recipes[0]),
    docs: mapDocs(docs).slice(0, 3),
    examples: mapExamples(examples).slice(0, 2),
    plugins: mapPlugins(plugins),
    recipes: mapRecipes(recipes).slice(0, 2),
  }
}

function runPlanIntegrationTool(context: McpDomainContext, input: Record<string, unknown>) {
  const project = readProjectSummary(input.project)
  const targetVersion = readString(input.targetVersion) ?? project.graphqlGeneVersion
  const goal = readString(input.goal) ?? project.targetOutcome ?? ''
  const serverStack = readString(input.serverStack) ?? project.serverStack
  const orm = readString(input.orm) ?? project.orm
  const concerns = Array.isArray(input.concerns)
    ? input.concerns.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : project.constraints ?? []
  const decisionGoal = joinContextText(goal, project.targetOutcome, project.currentGraphqlSetup)

  const recipes = selectRecipeEntries(context.catalog, {
    goal: decisionGoal || goal,
    serverStack,
    orm,
    concerns,
  }, 3)
  const primaryRecipe = recipes[0]
  const candidatePlugins = primaryRecipe?.recommendedPluginIds.length
    ? findPluginsByIds(context.catalog, primaryRecipe.recommendedPluginIds)
    : selectPluginEntries(context.catalog, { goal, orm }, 2)
  const primaryPlugin = candidatePlugins[0]
  const docs = primaryRecipe
    ? dedupeById([
        ...findDocsByIds(context.catalog, primaryRecipe.recommendedDocIds),
        ...findDocsByIds(context.catalog, primaryPlugin?.recommendedDocIds ?? []),
      ])
    : searchDocs(context, goal, 4)
  const examples = primaryRecipe
    ? dedupeById([
        ...findExamplesByIds(context.catalog, primaryRecipe.recommendedExampleIds),
        ...findExamplesByIds(context.catalog, primaryPlugin?.recommendedExampleIds ?? []),
      ])
    : searchExamples(context, goal, 3)

  return {
    goal,
    serverStack: serverStack ?? null,
    orm: orm ?? null,
    targetVersion: targetVersion ?? null,
    projectContext: serializeProjectContext(project),
    concerns,
    selectedRecipeId: primaryRecipe?.id ?? null,
    focusArea: inferFocusArea([
      goal,
      primaryRecipe?.title,
      primaryRecipe?.goal,
      ...concerns,
    ].filter(Boolean).join(' ')),
    pluginStrategy: {
      strategy: derivePluginStrategyId(primaryPlugin),
      recommendedPlugin: primaryPlugin?.packageName ?? null,
      rationale: buildPluginRationale(primaryPlugin, orm, false),
    },
    steps: buildStructuredPlanSteps(primaryRecipe, primaryPlugin, serverStack, concerns),
    docs: mapDocs(docs).slice(0, 4),
    examples: mapExamples(examples).slice(0, 3),
    recipes: mapRecipes(recipes),
    plugins: mapPlugins(candidatePlugins).slice(0, 2),
  }
}

function runDiagnoseIssueTool(context: McpDomainContext, input: Record<string, unknown>) {
  const project = readProjectSummary(input.project)
  const issue = readIssueReport(input.issue)
  const targetVersion = readString(input.targetVersion) ?? issue.graphqlGeneVersion ?? project.graphqlGeneVersion
  const symptom = readString(input.symptom) ?? issue.symptom ?? ''
  const issueContext = joinContextText(
    readString(input.context),
    issue.context,
    issue.userGoal,
    project.currentGraphqlSetup,
    issue.environment,
    ...(issue.tried ?? []),
  ) || undefined
  const stage = typeof input.stage === 'string' ? input.stage : undefined
  const troubleshooting = selectTroubleshootingEntries(context.catalog, {
    symptom,
    context: issueContext,
    stage,
  }, 3)
  const primaryIssue = troubleshooting[0]
  const docs = primaryIssue
    ? findDocsByIds(context.catalog, primaryIssue.recommendedDocIds)
    : searchDocs(context, [symptom, issueContext, stage].filter(Boolean).join(' '), 3)
  const examples = primaryIssue
    ? findExamplesByIds(context.catalog, primaryIssue.recommendedExampleIds)
    : searchExamples(context, [symptom, issueContext, stage].filter(Boolean).join(' '), 2)
  const recipes = primaryIssue
    ? findRecipesByIds(context.catalog, primaryIssue.recommendedRecipeIds)
    : selectRecipeEntries(context.catalog, {
      goal: [symptom, issueContext, stage].filter(Boolean).join(' '),
    }, 2)

  return {
    symptom,
    context: issueContext ?? null,
    stage: stage ?? null,
    targetVersion: targetVersion ?? null,
    projectContext: serializeProjectContext(project),
    issueContext: serializeIssueContext(issue),
    selectedIssueId: primaryIssue?.id ?? null,
    diagnosisArea: stage ?? inferFocusArea([symptom, issueContext].filter(Boolean).join(' ')),
    likelyCauses: primaryIssue?.likelyCauses ?? buildFallbackLikelyCauses(stage),
    recommendedChecks: primaryIssue?.recommendedChecks ?? buildFallbackRecommendedChecks(stage),
    docs: mapDocs(docs).slice(0, 3),
    examples: mapExamples(examples).slice(0, 2),
    troubleshooting: mapTroubleshooting(troubleshooting),
    recipes: mapRecipes(recipes).slice(0, 2),
  }
}

function runListDeveloperTaskPatternsTool(context: McpDomainContext, input: Record<string, unknown>) {
  return listDeveloperTaskPatterns(context.catalog, {
    query: readString(input.query),
    scenario: readString(input.scenario),
  })
}

function runPlanDeveloperTaskTool(context: McpDomainContext, input: Record<string, unknown>) {
  return planDeveloperTask(
    context.catalog,
    readDeveloperTaskPlanInput(input),
  )
}

function runAdaptExampleToProjectTool(context: McpDomainContext, input: Record<string, unknown>) {
  return adaptExampleToProject(
    context.catalog,
    readAdaptExampleToProjectInput(input),
  )
}

function runValidateDeveloperTaskPlanTool(context: McpDomainContext, input: Record<string, unknown>) {
  return validateDeveloperTaskPlan(
    context.catalog,
    readValidateDeveloperTaskPlanInput(input),
  )
}

function runInspectPlaygroundScenarioTool(context: McpDomainContext, input: Record<string, unknown>) {
  const scenario = readString(input.scenario) ?? ''
  return inspectPlaygroundScenario(context.catalog, scenario)
}

function runValidatePlaygroundScenarioTool(context: McpDomainContext, input: Record<string, unknown>) {
  return validatePlaygroundScenario(
    context.catalog,
    readPlaygroundImplementationSummary(input),
  )
}

function runPlanPlaygroundScenarioTool(context: McpDomainContext, input: Record<string, unknown>) {
  return planPlaygroundScenario(
    context.catalog,
    readPlaygroundScenarioPlanInput(input),
  )
}

function runComparePlaygroundWithCanonicalTool(context: McpDomainContext, input: Record<string, unknown>) {
  return comparePlaygroundWithCanonical(
    context.catalog,
    readPlaygroundCanonicalComparisonInput(input),
  )
}

function runListPlaygroundParityGatesTool(context: McpDomainContext, input: Record<string, unknown>) {
  return listPlaygroundParityGates(
    context.catalog,
    readString(input.scenario),
  )
}

function buildFeatureSummary(options: {
  feature: string
  docs: string[]
  examples: string[]
  plugins: string[]
  recipes: string[]
  troubleshooting: string[]
}) {
  const docText = options.docs.length ? options.docs.join(', ') : 'No strong doc matches yet'
  const exampleText = options.examples.length ? options.examples.join(', ') : 'No strong example matches yet'
  const pluginText = options.plugins.length ? options.plugins.join(', ') : 'No strong plugin matches yet'
  const recipeText = options.recipes.length ? options.recipes.join(', ') : 'No strong recipe matches yet'
  const issueText = options.troubleshooting.length ? options.troubleshooting.join(', ') : 'No strong troubleshooting matches yet'

  return [
    `Feature: ${options.feature}`,
    `Relevant docs: ${docText}`,
    `Relevant examples: ${exampleText}`,
    `Relevant plugins: ${pluginText}`,
    `Relevant recipes: ${recipeText}`,
    `Relevant troubleshooting: ${issueText}`,
    'Use the docs as the primary source of truth and treat adapted playground examples as supporting guidance.',
  ].join(' ')
}

function buildIntegrationRecommendation(goal: string, primaryRecipe?: RecipeKnowledgeEntry) {
  if (!primaryRecipe) {
    return [
      `Goal: ${goal}`,
      'No strong structured recipe match was found yet.',
      'Start from the highest-ranked canonical docs, then validate with the closest example scenario.',
    ].join(' ')
  }

  return [
    `Goal: ${goal}`,
    `Recommended recipe: ${primaryRecipe.title}`,
    `Why: ${primaryRecipe.summary}`,
    'Start from the canonical docs linked to that recipe, then validate with the recommended example.',
  ].join(' ')
}

function buildPluginRationale(
  plugin?: PluginKnowledgeEntry,
  orm?: string,
  wantsCustomPlugin = false,
) {
  if (!plugin) {
    return 'No structured plugin recommendation was strong enough yet, so review the plugin docs and recipes first.'
  }

  if (wantsCustomPlugin) {
    return `Custom plugin preference is enabled, so "${plugin.title}" is the strongest structured match.`
  }

  if (orm) {
    return `For ORM "${orm}", the strongest structured plugin match is "${plugin.title}". ${plugin.summary}`
  }

  return plugin.summary
}

function buildPluginNextSteps(plugin?: PluginKnowledgeEntry, recipe?: RecipeKnowledgeEntry) {
  if (recipe) {
    return recipe.steps
  }

  if (!plugin) {
    return [
      'Review the GraphQL Gene plugin docs.',
      'Decide whether the project fits the Sequelize path or needs a custom plugin.',
    ]
  }

  return [
    ...plugin.whenToUse.slice(0, 2),
    'Open the linked docs and examples before implementing the plugin path.',
  ]
}

function buildStructuredPlanSteps(
  recipe: RecipeKnowledgeEntry | undefined,
  plugin: PluginKnowledgeEntry | undefined,
  serverStack?: string,
  concerns: string[] = [],
) {
  const baseSteps = recipe?.steps.length
    ? [...recipe.steps]
    : [
        'Install GraphQL Gene and align the plugin choice with the target ORM.',
        'Export all GraphQL Gene types from a single module so schema generation has one canonical input.',
        'Generate the schema and inspect the SDL before expanding runtime behavior.',
      ]

  if (plugin?.packageName && !baseSteps.some(step => step.includes(plugin.packageName))) {
    baseSteps.unshift(`Adopt the recommended plugin path: ${plugin.packageName}.`)
  }

  if (serverStack) {
    baseSteps.push(`Attach the generated schema to ${serverStack} once the core GraphQL Gene setup is stable.`)
  }

  if (concerns.length) {
    baseSteps.push(`Validate the highest-risk concerns next: ${concerns.join(', ')}.`)
  }

  return dedupeStrings(baseSteps)
}

function buildFallbackLikelyCauses(stage?: string) {
  switch (stage) {
    case 'install':
      return [
        'The core package or plugin package is missing or version-misaligned.',
        'The initial setup drifted from the documented bootstrap flow.',
      ]
    case 'schema':
      return [
        'The GraphQL type exports are incomplete or inconsistent.',
        'The generated schema input does not match the intended model graph.',
      ]
    case 'plugin':
      return [
        'The chosen plugin strategy does not match the target ORM behavior.',
        'The project likely needs the custom plugin path instead of the Sequelize reference path.',
      ]
    case 'query':
      return [
        'The query shape does not align with the generated associations.',
        'Lookahead expectations differ from the current runtime adapter behavior.',
      ]
    case 'directive':
      return [
        'Directive middleware is attached at the wrong level.',
        'Runtime-only directive behavior was mistaken for SDL-visible behavior.',
      ]
    default:
      return [
        'The current GraphQL Gene setup is not aligned with the documented integration path.',
        'The issue may sit at the boundary between schema generation and runtime wiring.',
      ]
  }
}

function buildFallbackRecommendedChecks(stage?: string) {
  switch (stage) {
    case 'install':
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
        'Check whether the target ORM truly maps to the recommended plugin.',
        'Review the plugin docs before widening custom behavior.',
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

function searchPlugins(context: McpDomainContext, query: string, limit: number) {
  return searchKnowledgeCatalog(context.catalog, {
    query,
    kind: 'plugin',
    limit,
  })
    .filter((match): match is typeof match & { entry: PluginKnowledgeEntry } => match.entry.kind === 'plugin')
    .map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      packageName: match.entry.packageName ?? null,
      summary: match.entry.summary,
    }))
}

function searchRecipes(context: McpDomainContext, query: string, limit: number) {
  return searchKnowledgeCatalog(context.catalog, {
    query,
    kind: 'recipe',
    limit,
  })
    .filter((match): match is typeof match & { entry: RecipeKnowledgeEntry } => match.entry.kind === 'recipe')
    .map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      recipeId: match.entry.recipeId,
      summary: match.entry.summary,
    }))
}

function searchTroubleshooting(context: McpDomainContext, query: string, limit: number) {
  return searchKnowledgeCatalog(context.catalog, {
    query,
    kind: 'troubleshooting',
    limit,
  })
    .filter((match): match is typeof match & { entry: TroubleshootingKnowledgeEntry } => match.entry.kind === 'troubleshooting')
    .map(match => ({
      id: match.entry.id,
      title: match.entry.title,
      issueId: match.entry.issueId,
      summary: match.entry.summary,
    }))
}

function mapDocs(docs: DocKnowledgeEntry[] | ReturnType<typeof searchDocs>) {
  return docs.map((doc) => {
    if ('slug' in doc) {
      return {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        summary: doc.summary,
      }
    }

    return doc
  })
}

function mapExamples(examples: ExampleKnowledgeEntry[] | ReturnType<typeof searchExamples>) {
  return examples.map((example) => {
    if ('scenario' in example && 'exampleId' in example) {
      return {
        id: example.id,
        title: example.title,
        scenario: example.scenario,
        summary: example.summary,
      }
    }

    return example
  })
}

function mapPlugins(plugins: PluginKnowledgeEntry[]) {
  return plugins.map(plugin => ({
    id: plugin.id,
    title: plugin.title,
    packageName: plugin.packageName ?? null,
    summary: plugin.summary,
  }))
}

function mapRecipes(recipes: RecipeKnowledgeEntry[]) {
  return recipes.map(recipe => ({
    id: recipe.id,
    title: recipe.title,
    recipeId: recipe.recipeId,
    summary: recipe.summary,
  }))
}

function mapTroubleshooting(issues: TroubleshootingKnowledgeEntry[]) {
  return issues.map(issue => ({
    id: issue.id,
    title: issue.title,
    issueId: issue.issueId,
    summary: issue.summary,
  }))
}

function serializeSearchHit(entry: KnowledgeEntry, score: number, matchedFields: string[]) {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    summary: entry.summary,
    score,
    matchedFields,
    slug: entry.kind === 'doc' ? entry.slug : undefined,
    scenario: extractScenario(entry),
    packageName: entry.kind === 'plugin' ? entry.packageName ?? null : undefined,
    recipeId: entry.kind === 'recipe' ? entry.recipeId : undefined,
    issueId: entry.kind === 'troubleshooting' ? entry.issueId : undefined,
  }
}

function derivePluginStrategyId(plugin?: PluginKnowledgeEntry) {
  if (!plugin) {
    return 'evaluate-plugin-surface'
  }

  if (plugin.pluginId === 'custom-plugin') {
    return 'custom-plugin'
  }

  if (plugin.packageName === '@graphql-gene/plugin-sequelize') {
    return 'plugin-sequelize'
  }

  return 'evaluate-plugin-surface'
}

function projectSummaryJsonSchema() {
  return {
    type: 'object',
    properties: {
      packageManager: { type: 'string' },
      runtime: { type: 'string' },
      language: { type: 'string' },
      serverStack: { type: 'string' },
      orm: { type: 'string' },
      currentGraphqlSetup: { type: 'string' },
      constraints: { type: 'array', items: { type: 'string' } },
      targetOutcome: { type: 'string' },
      graphqlGeneVersion: { type: 'string' },
    },
    additionalProperties: false,
  }
}

function issueReportJsonSchema() {
  return {
    type: 'object',
    properties: {
      userGoal: { type: 'string' },
      symptom: { type: 'string' },
      context: { type: 'string' },
      tried: { type: 'array', items: { type: 'string' } },
      environment: { type: 'string' },
      graphqlGeneVersion: { type: 'string' },
    },
    additionalProperties: false,
  }
}

function readProjectSummary(value: unknown) {
  const input = isRecord(value) ? value : {}

  return {
    packageManager: readString(input.packageManager),
    runtime: readString(input.runtime),
    language: readString(input.language),
    serverStack: readString(input.serverStack),
    orm: readString(input.orm),
    currentGraphqlSetup: readString(input.currentGraphqlSetup),
    constraints: readStringArray(input.constraints),
    targetOutcome: readString(input.targetOutcome),
    graphqlGeneVersion: readString(input.graphqlGeneVersion),
  }
}

function readIssueReport(value: unknown) {
  const input = isRecord(value) ? value : {}

  return {
    userGoal: readString(input.userGoal),
    symptom: readString(input.symptom),
    context: readString(input.context),
    tried: readStringArray(input.tried),
    environment: readString(input.environment),
    graphqlGeneVersion: readString(input.graphqlGeneVersion),
  }
}

function readDeveloperTaskPlanInput(input: Record<string, unknown>): DeveloperTaskPlanInput {
  return {
    patternId: readString(input.patternId),
    goal: readString(input.goal),
    project: readProjectSummary(input.project),
    constraints: readStringArray(input.constraints),
    targetVersion: readString(input.targetVersion),
  }
}

function readAdaptExampleToProjectInput(input: Record<string, unknown>): AdaptExampleToProjectInput {
  return {
    patternId: readString(input.patternId),
    exampleId: readString(input.exampleId),
    goal: readString(input.goal),
    project: readProjectSummary(input.project),
    targetModels: readStringArray(input.targetModels),
    constraints: readStringArray(input.constraints),
    targetVersion: readString(input.targetVersion),
  }
}

function readValidateDeveloperTaskPlanInput(input: Record<string, unknown>): ValidateDeveloperTaskPlanInput {
  return {
    patternId: readString(input.patternId),
    goal: readString(input.goal),
    project: readProjectSummary(input.project),
    proposedSteps: readStringArray(input.proposedSteps),
    selectedPlugin: readString(input.selectedPlugin),
    usesPlaygroundCodeAsSource: readBoolean(input.usesPlaygroundCodeAsSource),
    usesPlaygroundRuntimeAsSource: readBoolean(input.usesPlaygroundRuntimeAsSource),
    includesSchemaInspection: readBoolean(input.includesSchemaInspection),
    includesTests: readBoolean(input.includesTests),
    includesPluginDecision: readBoolean(input.includesPluginDecision),
    handlesLookahead: readBoolean(input.handlesLookahead),
    handlesDirectiveRuntimeMode: readBoolean(input.handlesDirectiveRuntimeMode),
    handlesPolymorphicResolution: readBoolean(input.handlesPolymorphicResolution),
  }
}

function readPlaygroundImplementationSummary(input: Record<string, unknown>): PlaygroundScenarioImplementationSummary {
  return {
    scenario: readString(input.scenario) ?? '',
    exampleId: readString(input.exampleId),
    editableFields: readStringArray(input.editableFields),
    docsSlugs: readStringArray(input.docsSlugs),
    outputPanels: readStringArray(input.outputPanels),
    executionMode: asExecutionMode(input.executionMode),
    declaresAdaptedRuntime: readBoolean(input.declaresAdaptedRuntime),
    hasFixture: readBoolean(input.hasFixture),
    hasApiValidation: readBoolean(input.hasApiValidation),
    hasTests: readBoolean(input.hasTests),
    usesHardcodedOutput: readBoolean(input.usesHardcodedOutput),
    sourcePath: readString(input.sourcePath),
    runtimeSourcePath: readString(input.runtimeSourcePath),
  }
}

function readPlaygroundScenarioPlanInput(input: Record<string, unknown>): PlaygroundScenarioPlanInput {
  return {
    scenario: readString(input.scenario) ?? '',
    goal: readString(input.goal),
    exampleId: readString(input.exampleId),
    executionMode: asExecutionMode(input.executionMode),
    editableFields: readStringArray(input.editableFields),
    outputPanels: readStringArray(input.outputPanels),
    upstreamSourcePath: readString(input.upstreamSourcePath),
  }
}

function readPlaygroundCanonicalComparisonInput(input: Record<string, unknown>): PlaygroundCanonicalComparisonInput {
  return {
    scenario: readString(input.scenario) ?? '',
    exampleId: readString(input.exampleId),
    observedExecutionMode: asExecutionMode(input.observedExecutionMode),
    observedSourceType: readString(input.observedSourceType),
    observedBehaviorSummary: readString(input.observedBehaviorSummary),
  }
}

function serializeProjectContext(project: ReturnType<typeof readProjectSummary>) {
  return pruneEmptyObject(project)
}

function serializeIssueContext(issue: ReturnType<typeof readIssueReport>) {
  return pruneEmptyObject(issue)
}

function pruneEmptyObject<T extends Record<string, unknown>>(value: T) {
  const entries = Object.entries(value).filter(([, entryValue]) => {
    if (Array.isArray(entryValue)) {
      return entryValue.length > 0
    }

    return entryValue !== undefined && entryValue !== null && entryValue !== ''
  })

  return entries.length ? Object.fromEntries(entries) : null
}

function joinContextText(...values: Array<string | string[] | undefined>) {
  return values
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ')
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim().length ? value.trim() : undefined
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : undefined
}

function readBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function asExecutionMode(value: unknown) {
  return value === 'canonical' || value === 'adapted' || value === 'simulated'
    ? value
    : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asKnowledgeKind(value: unknown): KnowledgeKind | undefined {
  return value === 'doc'
    || value === 'example'
    || value === 'plugin'
    || value === 'recipe'
    || value === 'troubleshooting'
    ? value
    : undefined
}

function extractScenario(entry: KnowledgeEntry) {
  switch (entry.kind) {
    case 'doc':
      return entry.playgroundScenario
    case 'example':
      return entry.scenario
    case 'plugin':
    case 'recipe':
    case 'troubleshooting':
      return entry.scenarios[0]
    default:
      return undefined
  }
}

function dedupeById<T extends { id: string }>(entries: T[]) {
  const seen = new Set<string>()
  const deduped: T[] = []

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      continue
    }

    seen.add(entry.id)
    deduped.push(entry)
  }

  return deduped
}

function dedupeStrings(values: string[]) {
  return [...new Set(values)]
}
