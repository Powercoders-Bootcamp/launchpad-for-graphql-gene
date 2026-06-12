import type {
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  PluginKnowledgeEntry,
  RecipeKnowledgeEntry,
} from '../contracts'

export type DeveloperTaskPatternId =
  | 'model-to-schema'
  | 'query-lookahead'
  | 'polymorphic-blocks'
  | 'directive-middleware'

export type DeveloperTaskPlanStatus = 'pass' | 'warn' | 'fail'
export type DeveloperTaskPlanIssueSeverity = 'error' | 'warning' | 'info'

export interface DeveloperProjectContext {
  packageManager?: string
  runtime?: string
  language?: string
  serverStack?: string
  orm?: string
  currentGraphqlSetup?: string
  constraints?: string[]
  targetOutcome?: string
  graphqlGeneVersion?: string
}

export interface DeveloperTaskPlanInput {
  patternId?: string
  goal?: string
  project?: DeveloperProjectContext
  constraints?: string[]
  targetVersion?: string
}

export interface AdaptExampleToProjectInput {
  patternId?: string
  exampleId?: string
  goal?: string
  project?: DeveloperProjectContext
  targetModels?: string[]
  constraints?: string[]
  targetVersion?: string
}

export interface ValidateDeveloperTaskPlanInput {
  patternId?: string
  goal?: string
  project?: DeveloperProjectContext
  proposedSteps?: string[]
  selectedPlugin?: string
  usesPlaygroundCodeAsSource?: boolean
  usesPlaygroundRuntimeAsSource?: boolean
  includesSchemaInspection?: boolean
  includesTests?: boolean
  includesPluginDecision?: boolean
  handlesLookahead?: boolean
  handlesDirectiveRuntimeMode?: boolean
  handlesPolymorphicResolution?: boolean
}

export interface DeveloperTaskPlanIssue {
  severity: DeveloperTaskPlanIssueSeverity
  code: string
  message: string
  remediation?: string
}

interface DeveloperTaskPatternSeed {
  id: DeveloperTaskPatternId
  scenario: string
  title: string
  summary: string
  developerGoal: string
  whenToUse: string[]
  requiredProjectSignals: string[]
  implementationSteps: string[]
  validationChecklist: string[]
  commonPitfalls: string[]
  docIds: string[]
  exampleIds: string[]
  recipeIds: string[]
  pluginIds: string[]
}

const DOC_IDS = {
  gettingStarted: 'doc:/docs/concepts/getting-started',
  schemaDesign: 'doc:/docs/guides/schema-design',
  directives: 'doc:/docs/guides/directives',
  polymorphicBlocks: 'doc:/docs/guides/polymorphic-blocks',
  writingAPlugin: 'doc:/docs/reference/writing-a-plugin',
} as const

const EXAMPLE_IDS = {
  modelToSchema: 'example:model-to-schema:user-orders-basic',
  queryLookahead: 'example:query-lookahead:me-with-orders',
  polymorphicBlocks: 'example:polymorphic-blocks:page-blocks-basic',
  directiveMiddleware: 'example:directive-middleware:user-auth-directive',
} as const

const RECIPE_IDS = {
  sequelizeBootstrap: 'recipe:sequelize-bootstrap',
  queryLookaheadShape: 'recipe:query-lookahead-shape',
  directiveMiddlewareAuth: 'recipe:directive-middleware-auth',
  polymorphicContentBlocks: 'recipe:polymorphic-content-blocks',
  customPluginEvaluation: 'recipe:custom-plugin-evaluation',
} as const

const PLUGIN_IDS = {
  sequelize: 'plugin:sequelize',
  customPlugin: 'plugin:custom-plugin',
} as const

const DEVELOPER_TASK_PATTERNS: DeveloperTaskPatternSeed[] = [
  {
    id: 'model-to-schema',
    scenario: 'model-to-schema',
    title: 'Generate a schema from ORM models',
    summary: 'Use GraphQL Gene to generate a GraphQL schema from the project model layer instead of hand-writing a schema builder.',
    developerGoal: 'Turn existing Sequelize models into a generated GraphQL schema with a stable server integration path.',
    whenToUse: [
      'The project already has Sequelize models or a comparable model graph.',
      'The developer wants model-first schema generation rather than hand-assembled GraphQL types.',
      'The first milestone is generated SDL and server attachment, not deep custom resolver behavior.',
    ],
    requiredProjectSignals: [
      'ORM and model ownership boundary',
      'GraphQL server framework',
      'GraphQL Gene version or intended version',
      'Models that should be exported into the generated schema',
    ],
    implementationSteps: [
      'Choose the plugin strategy before changing schema code.',
      'Install graphql-gene and the ORM plugin that matches the project model layer.',
      'Create one canonical module that exports every GraphQL Gene type intended for generation.',
      'Generate the schema and inspect the SDL before attaching it to the server.',
      'Attach the generated schema to the GraphQL server once the generated output matches the intended model graph.',
    ],
    validationChecklist: [
      'Every intended model/type is exported from the canonical types module.',
      'The generated SDL includes the expected object types, fields, query roots, and associations.',
      'The server boots from generated schema output rather than a parallel hand-written schema.',
      'A smoke test or startup check exercises schema generation.',
    ],
    commonPitfalls: [
      'Skipping the plugin decision and assuming every ORM fits the Sequelize plugin.',
      'Exporting only part of the model graph and then debugging missing SDL downstream.',
      'Attaching the schema to the server before inspecting generated SDL.',
    ],
    docIds: [DOC_IDS.gettingStarted, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.modelToSchema],
    recipeIds: [RECIPE_IDS.sequelizeBootstrap, RECIPE_IDS.customPluginEvaluation],
    pluginIds: [PLUGIN_IDS.sequelize, PLUGIN_IDS.customPlugin],
  },
  {
    id: 'query-lookahead',
    scenario: 'query-lookahead',
    title: 'Design lookahead-friendly queries',
    summary: 'Shape generated associations and resolver behavior so selected GraphQL fields can drive efficient ORM loading.',
    developerGoal: 'Avoid N+1 behavior by keeping nested queries close to GraphQL Gene and plugin lookahead expectations.',
    whenToUse: [
      'The GraphQL API exposes nested associations from ORM models.',
      'The developer cares about SQL/include shape or selected-field loading.',
      'The project has custom resolvers that may bypass default generated behavior.',
    ],
    requiredProjectSignals: [
      'Hot nested query shape',
      'Associations involved in the query',
      'Current resolver customization level',
      'SQL/include logging or performance symptoms',
    ],
    implementationSteps: [
      'Identify the nested query that should drive association loading.',
      'Confirm the generated model associations match the fields selected by the client.',
      'Prefer default generated resolution until lookahead behavior is understood.',
      'Add SQL/include logging around the target query and compare it with selected GraphQL fields.',
      'Only add custom resolver behavior after preserving or replacing the lookahead path deliberately.',
    ],
    validationChecklist: [
      'The selected query fields correspond to the associations loaded by the ORM.',
      'SQL/include logs change when nested fields are added or removed.',
      'Custom resolvers do not accidentally bypass the plugin lookahead path.',
      'Performance tests or query smoke tests cover the hot nested query.',
    ],
    commonPitfalls: [
      'Treating the website playground SQL as copy-paste implementation code.',
      'Adding custom resolvers before validating default lookahead behavior.',
      'Debugging SQL without comparing it to the actual GraphQL selection set.',
    ],
    docIds: [DOC_IDS.schemaDesign, DOC_IDS.gettingStarted],
    exampleIds: [EXAMPLE_IDS.queryLookahead],
    recipeIds: [RECIPE_IDS.queryLookaheadShape],
    pluginIds: [PLUGIN_IDS.sequelize],
  },
  {
    id: 'polymorphic-blocks',
    scenario: 'polymorphic-blocks',
    title: 'Model polymorphic content blocks',
    summary: 'Expose heterogeneous CMS-like blocks through a fragment-friendly GraphQL list while keeping the model layer as the source of truth.',
    developerGoal: 'Represent ordered heterogeneous content blocks with GraphQL unions/interfaces and model-backed resolution.',
    whenToUse: [
      'The domain has one ordered list containing multiple concrete content types.',
      'Clients should query block-specific fields with inline fragments.',
      'The developer wants the schema to stay aligned with real model relationships.',
    ],
    requiredProjectSignals: [
      'Hub or parent model that owns block ordering',
      'Concrete block model names',
      'Discriminator/type field or association shape',
      'Expected GraphQL union/interface member types',
    ],
    implementationSteps: [
      'Identify the parent or hub model that owns the ordered block list.',
      'List the concrete block models and the discriminator or association that resolves each member type.',
      'Model the GraphQL union/interface contract explicitly before implementing runtime fetching.',
      'Generate or inspect SDL and confirm every concrete block type is present.',
      'Write query tests with __typename and inline fragments for each concrete block type.',
    ],
    validationChecklist: [
      'Every concrete block model maps to a GraphQL member type.',
      'The generated schema supports __typename and inline fragments for all member types.',
      'Runtime resolution preserves block ordering.',
      'Tests cover at least one query spanning multiple block types.',
    ],
    commonPitfalls: [
      'Overclaiming that polymorphism itself is unique instead of emphasizing model-native generation.',
      'Hardcoding block response shapes instead of resolving from the model layer.',
      'Skipping __typename/inline fragment tests.',
    ],
    docIds: [DOC_IDS.polymorphicBlocks, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.polymorphicBlocks],
    recipeIds: [RECIPE_IDS.polymorphicContentBlocks],
    pluginIds: [PLUGIN_IDS.sequelize],
  },
  {
    id: 'directive-middleware',
    scenario: 'directive-middleware',
    title: 'Attach runtime behavior with directives',
    summary: 'Use GraphQL Gene directives to keep auth, validation, or middleware behavior close to generated schema fields.',
    developerGoal: 'Attach runtime middleware such as auth to generated fields or types while keeping SDL visibility intentional.',
    whenToUse: [
      'The behavior belongs near a generated type or field.',
      'The developer wants auth, validation, or middleware to stay schema-adjacent.',
      'The team needs to decide whether a directive is runtime-only or SDL-visible.',
    ],
    requiredProjectSignals: [
      'Target type or field',
      'Middleware/auth behavior',
      'Whether the directive should print into SDL',
      'GraphQL server context shape',
    ],
    implementationSteps: [
      'Define the behavior that should wrap the generated resolver lifecycle.',
      'Decide whether the directive should be named and visible in SDL or runtime-only.',
      'Attach the directive at the narrowest type or field boundary that owns the behavior.',
      'Validate runtime behavior independently from printed SDL expectations.',
      'Add tests for both allowed and rejected/modified execution paths.',
    ],
    validationChecklist: [
      'The directive is attached at the expected type or field boundary.',
      'The team knows whether the directive should print into SDL.',
      'Runtime tests prove the middleware behavior runs.',
      'SDL tests or snapshots match the intended visibility mode.',
    ],
    commonPitfalls: [
      'Assuming runtime-only directives must appear in generated SDL.',
      'Attaching middleware too broadly and making behavior hard to reason about.',
      'Testing printed SDL but not the runtime resolver behavior.',
    ],
    docIds: [DOC_IDS.directives, DOC_IDS.schemaDesign],
    exampleIds: [EXAMPLE_IDS.directiveMiddleware],
    recipeIds: [RECIPE_IDS.directiveMiddlewareAuth],
    pluginIds: [PLUGIN_IDS.sequelize],
  },
]

export function listDeveloperTaskPatterns(
  catalog: KnowledgeCatalog,
  options: { query?: string, scenario?: string } = {},
) {
  const query = normalize(options.query ?? '')
  const patterns = DEVELOPER_TASK_PATTERNS
    .filter((pattern) => {
      if (options.scenario && pattern.scenario !== options.scenario && pattern.id !== options.scenario) {
        return false
      }

      if (!query) {
        return true
      }

      return normalize([
        pattern.id,
        pattern.title,
        pattern.summary,
        pattern.developerGoal,
        ...pattern.whenToUse,
        ...pattern.commonPitfalls,
      ].join(' ')).includes(query)
    })

  return {
    count: patterns.length,
    patterns: patterns.map(pattern => serializePattern(catalog, pattern)),
  }
}

export function planDeveloperTask(
  catalog: KnowledgeCatalog,
  input: DeveloperTaskPlanInput,
) {
  const pattern = resolvePattern(input.patternId, input.goal)
  const project = input.project ?? {}
  const constraints = uniqueStrings([...(input.constraints ?? []), ...(project.constraints ?? [])])
  const pluginStrategy = choosePluginStrategy(project)

  return {
    patternId: pattern.id,
    title: pattern.title,
    goal: input.goal ?? project.targetOutcome ?? pattern.developerGoal,
    targetVersion: input.targetVersion ?? project.graphqlGeneVersion ?? null,
    projectContext: serializeProject(project),
    pluginStrategy,
    fit: buildFitSummary(pattern, project, pluginStrategy),
    steps: buildDeveloperTaskSteps(pattern, project, pluginStrategy, constraints),
    validationChecklist: pattern.validationChecklist,
    risks: buildDeveloperTaskRisks(pattern, project, pluginStrategy),
    docs: findDocs(catalog, pattern.docIds),
    examples: findExamples(catalog, pattern.exampleIds),
    recipes: findRecipes(catalog, pattern.recipeIds),
    plugins: findPlugins(catalog, pluginStrategy.recommendedPluginIds.length ? pluginStrategy.recommendedPluginIds : pattern.pluginIds),
    agentInstructions: [
      'Use the host coding agent to inspect local files and summarize project context before applying this plan.',
      'Treat website playground examples as conceptual demonstrations, not as the implementation source for the developer project.',
      'Prefer canonical docs, recipes, and package/plugin guidance when example behavior and project constraints differ.',
    ],
  }
}

export function adaptExampleToProject(
  catalog: KnowledgeCatalog,
  input: AdaptExampleToProjectInput,
) {
  const pattern = resolvePattern(input.patternId, input.goal)
  const project = input.project ?? {}
  const targetModels = input.targetModels ?? inferTargetModels(pattern)
  const example = resolveExample(catalog, pattern, input.exampleId)

  return {
    patternId: pattern.id,
    exampleId: example?.id ?? null,
    exampleTitle: example?.title ?? null,
    targetVersion: input.targetVersion ?? project.graphqlGeneVersion ?? null,
    projectContext: serializeProject(project),
    sourcePolicy: {
      usePlaygroundAs: 'conceptual-reference',
      doNotUsePlaygroundAs: 'copy-paste runtime source',
      preferredTruthSource: 'canonical GraphQL Gene docs, recipes, and upstream package behavior',
    },
    conceptMapping: buildConceptMapping(pattern, targetModels),
    adaptationSteps: buildAdaptationSteps(pattern, project, targetModels),
    validationChecklist: pattern.validationChecklist,
    docs: findDocs(catalog, pattern.docIds),
    examples: example ? [mapExample(example)] : findExamples(catalog, pattern.exampleIds),
    recipes: findRecipes(catalog, pattern.recipeIds),
    warnings: buildAdaptationWarnings(pattern, project),
  }
}

export function validateDeveloperTaskPlan(
  catalog: KnowledgeCatalog,
  input: ValidateDeveloperTaskPlanInput,
) {
  const pattern = resolvePattern(input.patternId, input.goal)
  const project = input.project ?? {}
  const issues: DeveloperTaskPlanIssue[] = []

  if (input.usesPlaygroundRuntimeAsSource) {
    issues.push({
      severity: 'error',
      code: 'PLAYGROUND_RUNTIME_USED_AS_SOURCE',
      message: 'The plan treats the website playground runtime as the developer project implementation source.',
      remediation: 'Use playground scenarios as conceptual examples and rely on canonical docs, recipes, and package behavior for implementation.',
    })
  }

  if (input.usesPlaygroundCodeAsSource) {
    issues.push({
      severity: 'warning',
      code: 'PLAYGROUND_CODE_COPY_RISK',
      message: 'The plan appears to copy website demo code into the developer project.',
      remediation: 'Adapt the pattern to the project model layer and server stack instead of copying demo implementation details.',
    })
  }

  if (input.includesPluginDecision === false || !input.selectedPlugin) {
    issues.push({
      severity: 'warning',
      code: 'PLUGIN_DECISION_MISSING',
      message: 'The plan does not clearly choose the Sequelize plugin path or a custom plugin path.',
      remediation: 'Select the plugin strategy before changing schema generation code.',
    })
  }

  if (input.includesSchemaInspection === false) {
    issues.push({
      severity: 'warning',
      code: 'SCHEMA_INSPECTION_MISSING',
      message: 'The plan does not include generated SDL/schema inspection.',
      remediation: 'Inspect generated SDL before attaching or expanding runtime behavior.',
    })
  }

  if (input.includesTests === false) {
    issues.push({
      severity: 'warning',
      code: 'TESTS_MISSING',
      message: 'The plan does not include validation or regression tests.',
      remediation: 'Add smoke tests, schema checks, or query/runtime tests matching the task pattern.',
    })
  }

  if (pattern.id === 'query-lookahead' && input.handlesLookahead === false) {
    issues.push({
      severity: 'error',
      code: 'LOOKAHEAD_NOT_HANDLED',
      message: 'The plan targets query lookahead but does not validate selected-field-driven loading.',
      remediation: 'Add SQL/include graph checks or equivalent resolver-path validation.',
    })
  }

  if (pattern.id === 'directive-middleware' && input.handlesDirectiveRuntimeMode === false) {
    issues.push({
      severity: 'error',
      code: 'DIRECTIVE_RUNTIME_MODE_NOT_HANDLED',
      message: 'The plan targets directive middleware but does not distinguish runtime-only behavior from SDL-visible directives.',
      remediation: 'Decide and test whether the directive should print into SDL or remain runtime-only.',
    })
  }

  if (pattern.id === 'polymorphic-blocks' && input.handlesPolymorphicResolution === false) {
    issues.push({
      severity: 'error',
      code: 'POLYMORPHIC_RESOLUTION_NOT_HANDLED',
      message: 'The plan targets polymorphic blocks but does not validate member type resolution.',
      remediation: 'Add __typename and inline fragment tests for each concrete block type.',
    })
  }

  return {
    patternId: pattern.id,
    status: summarizeIssues(issues),
    issueCount: issues.length,
    issues,
    canonicalChecks: pattern.validationChecklist,
    docs: findDocs(catalog, pattern.docIds),
    recipes: findRecipes(catalog, pattern.recipeIds),
    projectContext: serializeProject(project),
  }
}

function serializePattern(catalog: KnowledgeCatalog, pattern: DeveloperTaskPatternSeed) {
  return {
    id: pattern.id,
    scenario: pattern.scenario,
    title: pattern.title,
    summary: pattern.summary,
    developerGoal: pattern.developerGoal,
    whenToUse: pattern.whenToUse,
    requiredProjectSignals: pattern.requiredProjectSignals,
    validationChecklist: pattern.validationChecklist,
    commonPitfalls: pattern.commonPitfalls,
    docs: findDocs(catalog, pattern.docIds),
    examples: findExamples(catalog, pattern.exampleIds),
    recipes: findRecipes(catalog, pattern.recipeIds),
    plugins: findPlugins(catalog, pattern.pluginIds),
  }
}

function resolvePattern(patternId?: string, goal?: string) {
  const normalizedPatternId = normalize(patternId ?? '')
  const direct = DEVELOPER_TASK_PATTERNS.find(pattern => pattern.id === normalizedPatternId || pattern.scenario === normalizedPatternId)

  if (direct) {
    return direct
  }

  const normalizedGoal = normalize(goal ?? '')
  if (normalizedGoal.includes('directive') || normalizedGoal.includes('auth')) {
    return getPattern('directive-middleware')
  }
  if (normalizedGoal.includes('block') || normalizedGoal.includes('polymorphic') || normalizedGoal.includes('fragment') || normalizedGoal.includes('cms')) {
    return getPattern('polymorphic-blocks')
  }
  if (normalizedGoal.includes('lookahead') || normalizedGoal.includes('join') || normalizedGoal.includes('n+1') || normalizedGoal.includes('query')) {
    return getPattern('query-lookahead')
  }

  return getPattern('model-to-schema')
}

function getPattern(id: DeveloperTaskPatternId) {
  const pattern = DEVELOPER_TASK_PATTERNS.find(entry => entry.id === id)
  if (!pattern) {
    throw new Error(`Unknown developer task pattern "${id}".`)
  }
  return pattern
}

function choosePluginStrategy(project: DeveloperProjectContext) {
  const orm = normalize(project.orm ?? '')
  const isSequelize = orm.includes('sequelize') || !orm

  if (isSequelize) {
    return {
      strategy: 'plugin-sequelize',
      recommendedPlugin: '@graphql-gene/plugin-sequelize',
      recommendedPluginIds: [PLUGIN_IDS.sequelize],
      rationale: orm
        ? 'The project ORM is Sequelize, so the documented first-class plugin path is the best starting point.'
        : 'No ORM was provided; start by confirming whether the project can use the documented Sequelize plugin path.',
    }
  }

  return {
    strategy: 'custom-plugin-evaluation',
    recommendedPlugin: null,
    recommendedPluginIds: [PLUGIN_IDS.customPlugin],
    rationale: `The project ORM "${project.orm}" is not Sequelize, so evaluate a custom GraphQL Gene plugin instead of forcing the Sequelize path.`,
  }
}

function buildFitSummary(
  pattern: DeveloperTaskPatternSeed,
  project: DeveloperProjectContext,
  pluginStrategy: ReturnType<typeof choosePluginStrategy>,
) {
  return [
    `Pattern "${pattern.title}" fits when the developer goal is: ${pattern.developerGoal}`,
    `Plugin strategy: ${pluginStrategy.strategy}. ${pluginStrategy.rationale}`,
    project.serverStack ? `Server stack: ${project.serverStack}.` : 'Server stack was not provided; the host agent should identify it before implementation.',
  ].join(' ')
}

function buildDeveloperTaskSteps(
  pattern: DeveloperTaskPatternSeed,
  project: DeveloperProjectContext,
  pluginStrategy: ReturnType<typeof choosePluginStrategy>,
  constraints: string[],
) {
  const steps = [
    pluginStrategy.recommendedPlugin
      ? `Adopt the recommended plugin path: ${pluginStrategy.recommendedPlugin}.`
      : 'Evaluate the custom plugin path before trying to adapt the Sequelize plugin.',
    ...pattern.implementationSteps,
  ]

  if (project.serverStack) {
    steps.push(`Wire the final generated schema into ${project.serverStack} only after schema inspection passes.`)
  }

  if (constraints.length) {
    steps.push(`Validate project constraints explicitly: ${constraints.join(', ')}.`)
  }

  return uniqueStringsPreserveOrder(steps)
}

function buildDeveloperTaskRisks(
  pattern: DeveloperTaskPatternSeed,
  project: DeveloperProjectContext,
  pluginStrategy: ReturnType<typeof choosePluginStrategy>,
) {
  return [
    ...pattern.commonPitfalls,
    ...(pluginStrategy.strategy === 'custom-plugin-evaluation'
      ? ['A non-Sequelize ORM usually requires explicit custom plugin evaluation before implementation.']
      : []),
    ...(project.currentGraphqlSetup
      ? ['Existing hand-written schema or resolvers may conflict with generated schema ownership boundaries.']
      : []),
  ]
}

function buildConceptMapping(pattern: DeveloperTaskPatternSeed, targetModels: string[]) {
  switch (pattern.id) {
    case 'model-to-schema':
      return [
        { exampleConcept: 'User/Order models', projectSubstitution: formatModels(targetModels), guidance: 'Replace demo models with the project ORM models that should own the generated GraphQL API.' },
        { exampleConcept: 'generated SDL panel', projectSubstitution: 'schema inspection output', guidance: 'Print or snapshot the generated SDL before server integration.' },
      ]
    case 'query-lookahead':
      return [
        { exampleConcept: 'me { orders } query', projectSubstitution: 'project hot nested query', guidance: 'Use the query that currently drives performance or association-loading risk.' },
        { exampleConcept: 'captured SQL/include graph', projectSubstitution: 'project ORM logging', guidance: 'Compare selected fields with actual ORM loading behavior.' },
      ]
    case 'polymorphic-blocks':
      return [
        { exampleConcept: 'Page blocks', projectSubstitution: formatModels(targetModels), guidance: 'Map the parent/hub model and concrete block models before designing union/interface behavior.' },
        { exampleConcept: '__typename and inline fragments', projectSubstitution: 'client fragment contract', guidance: 'Require query tests for every concrete member type.' },
      ]
    case 'directive-middleware':
      return [
        { exampleConcept: '@userAuth directive', projectSubstitution: 'project auth/validation middleware', guidance: 'Attach runtime behavior at the narrowest generated type or field boundary.' },
        { exampleConcept: 'named or anonymous mode', projectSubstitution: 'SDL-visible or runtime-only policy', guidance: 'Decide whether the directive should print into SDL before writing tests.' },
      ]
  }
}

function buildAdaptationSteps(
  pattern: DeveloperTaskPatternSeed,
  project: DeveloperProjectContext,
  targetModels: string[],
) {
  return [
    `Identify the project equivalents for this pattern: ${formatModels(targetModels)}.`,
    `Use the "${pattern.title}" docs and recipe as the source-backed implementation path.`,
    'Ask the host coding agent to inspect local model definitions, server setup, and package versions before editing code.',
    'Adapt concept names and relationships to the project model layer instead of copying website playground runtime code.',
    ...(project.orm ? [`Validate the plugin strategy against ORM "${project.orm}".`] : ['Identify the ORM/data layer before choosing a plugin strategy.']),
    'Add the validation checks listed by this tool before treating the implementation as complete.',
  ]
}

function buildAdaptationWarnings(pattern: DeveloperTaskPatternSeed, project: DeveloperProjectContext) {
  return [
    'Playground examples are demonstrations of capability, not project-ready implementation templates.',
    ...(normalize(project.orm ?? '').includes('sequelize') || !project.orm
      ? []
      : [`The documented Sequelize plugin path may not fit ORM "${project.orm}" without custom plugin work.`]),
    ...(pattern.id === 'polymorphic-blocks'
      ? ['Do not overclaim polymorphism as unique; emphasize model-native, generator-first schema generation.']
      : []),
  ]
}

function inferTargetModels(pattern: DeveloperTaskPatternSeed) {
  switch (pattern.id) {
    case 'model-to-schema':
    case 'query-lookahead':
      return ['User', 'Order']
    case 'polymorphic-blocks':
      return ['Page', 'HeroBlock', 'TextBlock']
    case 'directive-middleware':
      return ['User']
  }
}

function resolveExample(
  catalog: KnowledgeCatalog,
  pattern: DeveloperTaskPatternSeed,
  exampleId?: string,
) {
  if (exampleId) {
    return catalog.examples.find(example => example.exampleId === exampleId || example.id === exampleId)
  }

  const ids = new Set(pattern.exampleIds)
  return catalog.examples.find(example => ids.has(example.id))
}

function findDocs(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.docs, ids).map(mapDoc)
}

function findExamples(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.examples, ids).map(mapExample)
}

function findRecipes(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.recipes, ids).map(mapRecipe)
}

function findPlugins(catalog: KnowledgeCatalog, ids: string[]) {
  return mapByIds(catalog.plugins, ids).map(mapPlugin)
}

function mapByIds<T extends { id: string }>(entries: T[], ids: string[]) {
  const entriesById = new Map(entries.map(entry => [entry.id, entry]))
  return ids
    .map(id => entriesById.get(id))
    .filter((entry): entry is T => Boolean(entry))
}

function mapDoc(doc: DocKnowledgeEntry) {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary,
  }
}

function mapExample(example: ExampleKnowledgeEntry) {
  return {
    id: example.id,
    title: example.title,
    scenario: example.scenario,
    summary: example.summary,
    executionMode: example.executionMode ?? null,
  }
}

function mapRecipe(recipe: RecipeKnowledgeEntry) {
  return {
    id: recipe.id,
    title: recipe.title,
    recipeId: recipe.recipeId,
    summary: recipe.summary,
  }
}

function mapPlugin(plugin: PluginKnowledgeEntry) {
  return {
    id: plugin.id,
    title: plugin.title,
    packageName: plugin.packageName ?? null,
    summary: plugin.summary,
  }
}

function serializeProject(project: DeveloperProjectContext) {
  const entries = Object.entries(project).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }

    return value !== undefined && value !== null && value !== ''
  })

  return entries.length ? Object.fromEntries(entries) : null
}

function summarizeIssues(issues: DeveloperTaskPlanIssue[]): DeveloperTaskPlanStatus {
  if (issues.some(issue => issue.severity === 'error')) {
    return 'fail'
  }

  if (issues.some(issue => issue.severity === 'warning')) {
    return 'warn'
  }

  return 'pass'
}

function formatModels(models: string[]) {
  return models.length ? models.join(', ') : 'project models'
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)]
}

function uniqueStringsPreserveOrder(values: string[]) {
  return uniqueStrings(values)
}

function normalize(value: string) {
  return value.toLowerCase()
}
