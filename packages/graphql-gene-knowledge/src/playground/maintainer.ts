import type {
  DocKnowledgeEntry,
  ExampleKnowledgeEntry,
  KnowledgeCatalog,
  KnowledgeExecutionMode,
} from '../contracts'

export type PlaygroundParityGateSeverity = 'required' | 'recommended'
export type PlaygroundValidationSeverity = 'error' | 'warning' | 'info'
export type PlaygroundValidationStatus = 'pass' | 'warn' | 'fail'

export interface PlaygroundParityGate {
  id: string
  title: string
  severity: PlaygroundParityGateSeverity
  description: string
  check: string
}

export interface PlaygroundScenarioImplementationSummary {
  scenario: string
  exampleId?: string
  editableFields?: string[]
  docsSlugs?: string[]
  outputPanels?: string[]
  executionMode?: KnowledgeExecutionMode
  declaresAdaptedRuntime?: boolean
  hasFixture?: boolean
  hasApiValidation?: boolean
  hasTests?: boolean
  usesHardcodedOutput?: boolean
  sourcePath?: string
  runtimeSourcePath?: string
}

export interface PlaygroundScenarioPlanInput {
  scenario: string
  goal?: string
  exampleId?: string
  executionMode?: KnowledgeExecutionMode
  editableFields?: string[]
  outputPanels?: string[]
  upstreamSourcePath?: string
}

export interface PlaygroundCanonicalComparisonInput {
  scenario: string
  exampleId?: string
  observedExecutionMode?: KnowledgeExecutionMode
  observedSourceType?: string
  observedBehaviorSummary?: string
}

export interface PlaygroundValidationIssue {
  severity: PlaygroundValidationSeverity
  code: string
  message: string
  remediation?: string
}

export interface PlaygroundScenarioContract {
  scenario: string
  knownScenario: boolean
  examples: Array<{
    id: string
    exampleId: string
    title: string
    editableFields: string[]
    executionMode: KnowledgeExecutionMode | 'unknown'
    sourcePath: string
    runtimeSourcePath?: string
    sourceType: string
    confidence: string
  }>
  relatedDocs: Array<{
    id: string
    slug: string
    title: string
    summary: string
  }>
  expectedEditableFields: string[]
  expectedOutputPanels: string[]
  expectedApiEndpoints: string[]
  expectedEngineFunctions: string[]
  parityGates: PlaygroundParityGate[]
  implementationNotes: string[]
}

const PLAYGROUND_PARITY_GATES: PlaygroundParityGate[] = [
  {
    id: 'scenario-contract',
    title: 'Canonical scenario contract',
    severity: 'required',
    description: 'The scenario id, example id, and editable fields must match the canonical playground catalog.',
    check: 'Compare the implementation summary with inspect_playground_scenario before adding UI or API behavior.',
  },
  {
    id: 'docs-linkage',
    title: 'Docs linkage',
    severity: 'required',
    description: 'Each scenario should link back to the canonical docs that explain the GraphQL Gene behavior.',
    check: 'Ensure docsSlugs includes the related docs returned by inspect_playground_scenario.',
  },
  {
    id: 'execution-mode-honesty',
    title: 'Execution mode honesty',
    severity: 'required',
    description: 'Adapted or simulated demos must not be presented as exact upstream GraphQL Gene runtime behavior.',
    check: 'Set executionMode explicitly and show adapted-runtime notes when the runtime is not canonical.',
  },
  {
    id: 'no-hardcoded-output',
    title: 'No hardcoded output',
    severity: 'required',
    description: 'Generated SDL, query results, SQL, directive output, and diagnostics should come from runtime execution or validated fixtures.',
    check: 'Fail the scenario review if usesHardcodedOutput is true for primary result panels.',
  },
  {
    id: 'api-validation',
    title: 'API validation',
    severity: 'required',
    description: 'The Nitro API request schema must reject unknown scenario ids, unknown example ids, and non-editable fields.',
    check: 'Confirm the endpoint validates scenario, exampleId, payload size, and editableFields.',
  },
  {
    id: 'fixture-or-runtime-data',
    title: 'Fixture or runtime data',
    severity: 'recommended',
    description: 'Runtime scenarios should use explicit fixtures or a real upstream-backed runtime path.',
    check: 'Confirm hasFixture is true for query/directive scenarios unless the runtime is fully canonical.',
  },
  {
    id: 'test-coverage',
    title: 'Scenario test coverage',
    severity: 'recommended',
    description: 'Scenario behavior should be covered by API, catalog, and MCP maintainer validation tests.',
    check: 'Add or update tests for registry coverage, API validation, and parity tool output.',
  },
  {
    id: 'source-provenance',
    title: 'Source provenance',
    severity: 'recommended',
    description: 'Displayed code and runtime adapters should point to upstream or repo-local source paths.',
    check: 'Populate sourcePath and runtimeSourcePath so maintainers can audit drift.',
  },
]

const SCENARIO_RUNTIME_CONTRACTS: Record<string, {
  expectedOutputPanels: string[]
  expectedApiEndpoints: string[]
  expectedEngineFunctions: string[]
  implementationNotes: string[]
}> = {
  'model-to-schema': {
    expectedOutputPanels: ['generated-sdl', 'type-summary', 'diagnostics'],
    expectedApiEndpoints: ['POST /api/playground/generate'],
    expectedEngineFunctions: ['runGenerate'],
    implementationNotes: [
      'Validate model edit fields against the canonical example editableFields.',
      'Generated SDL should come from the runtime engine, not a static string.',
    ],
  },
  'query-lookahead': {
    expectedOutputPanels: ['response-payload', 'captured-sql', 'include-graph', 'diagnostics'],
    expectedApiEndpoints: ['POST /api/playground/query'],
    expectedEngineFunctions: ['runQuery', 'runQueryLookahead'],
    implementationNotes: [
      'Use fixture-backed data so SQL and include graph output can be reproduced.',
      'Explain that the current website runtime is adapted when it differs from upstream behavior.',
    ],
  },
  'polymorphic-blocks': {
    expectedOutputPanels: ['response-payload', 'captured-sql', 'include-graph', 'diagnostics'],
    expectedApiEndpoints: ['POST /api/playground/query'],
    expectedEngineFunctions: ['runQuery', 'runQueryPolymorphicBlocks'],
    implementationNotes: [
      'Keep the GraphQL union/interface behavior aligned with the polymorphic-blocks docs.',
      'Inline fragment output should be produced by query execution, not a static response body.',
    ],
  },
  'directive-middleware': {
    expectedOutputPanels: ['directive-metadata', 'schema-excerpt', 'diagnostics'],
    expectedApiEndpoints: ['POST /api/playground/directives'],
    expectedEngineFunctions: ['runDirective'],
    implementationNotes: [
      'Represent named and anonymous directive modes explicitly.',
      'Make runtime-only directive behavior visible in notes when the SDL does not print a directive.',
    ],
  },
}

export function inspectPlaygroundScenario(
  catalog: KnowledgeCatalog,
  scenario: string,
): PlaygroundScenarioContract {
  return buildScenarioContract(catalog, scenario)
}

export function listPlaygroundParityGates(
  catalog: KnowledgeCatalog,
  scenario?: string,
) {
  const playgroundExamples = getPlaygroundExamples(catalog)
  const scenarios = scenario
    ? [scenario]
    : [...new Set(playgroundExamples.map(example => example.scenario))].sort()

  return {
    scenario: scenario ?? null,
    gates: PLAYGROUND_PARITY_GATES,
    scenarioContracts: scenarios.map(item => buildScenarioContract(catalog, item)),
  }
}

export function planPlaygroundScenario(
  catalog: KnowledgeCatalog,
  input: PlaygroundScenarioPlanInput,
) {
  const contract = buildScenarioContract(catalog, input.scenario)
  const targetExecutionMode = input.executionMode ?? inferPreferredExecutionMode(contract)
  const expectedEditableFields = input.editableFields?.length
    ? input.editableFields
    : contract.expectedEditableFields
  const expectedOutputPanels = input.outputPanels?.length
    ? input.outputPanels
    : contract.expectedOutputPanels

  return {
    scenario: input.scenario,
    exampleId: input.exampleId ?? contract.examples[0]?.exampleId ?? null,
    goal: input.goal ?? 'Implement a playground scenario that remains aligned with canonical GraphQL Gene knowledge.',
    knownScenario: contract.knownScenario,
    targetExecutionMode,
    requiredArtifacts: buildRequiredArtifacts(contract.knownScenario),
    steps: buildScenarioPlanSteps({
      contract,
      targetExecutionMode,
      expectedEditableFields,
      expectedOutputPanels,
      upstreamSourcePath: input.upstreamSourcePath,
    }),
    parityGates: contract.parityGates,
    relatedDocs: contract.relatedDocs,
    existingExamples: contract.examples,
  }
}

export function validatePlaygroundScenario(
  catalog: KnowledgeCatalog,
  input: PlaygroundScenarioImplementationSummary,
) {
  const contract = buildScenarioContract(catalog, input.scenario)
  const issues: PlaygroundValidationIssue[] = []
  const checks: Array<{ id: string, status: PlaygroundValidationStatus, message: string }> = []

  if (!contract.knownScenario) {
    issues.push({
      severity: 'error',
      code: 'UNKNOWN_SCENARIO',
      message: `Scenario "${input.scenario}" is not in the canonical playground catalog.`,
      remediation: 'Add the scenario to canonical example metadata before implementing UI or runtime behavior.',
    })
  }

  const selectedExample = input.exampleId
    ? contract.examples.find(example => example.exampleId === input.exampleId)
    : contract.examples[0]

  if (input.exampleId && !selectedExample) {
    issues.push({
      severity: 'error',
      code: 'UNKNOWN_EXAMPLE',
      message: `Example "${input.exampleId}" is not registered for scenario "${input.scenario}".`,
      remediation: 'Use an existing example id or add the example to the canonical playground catalog first.',
    })
  }

  validateEditableFields(contract, input, issues)
  validateDocsLinkage(contract, input, issues)
  validateOutputPanels(contract, input, issues)
  validateExecutionMode(selectedExample, input, issues)
  validateImplementationFlags(input, issues)

  for (const gate of PLAYGROUND_PARITY_GATES) {
    checks.push({
      id: gate.id,
      status: statusForGate(gate.id, issues),
      message: gate.check,
    })
  }

  return {
    scenario: input.scenario,
    exampleId: input.exampleId ?? selectedExample?.exampleId ?? null,
    status: summarizeValidationStatus(issues),
    issueCount: issues.length,
    issues,
    checks,
    contract,
  }
}

export function comparePlaygroundWithCanonical(
  catalog: KnowledgeCatalog,
  input: PlaygroundCanonicalComparisonInput,
) {
  const contract = buildScenarioContract(catalog, input.scenario)
  const selectedExample = input.exampleId
    ? contract.examples.find(example => example.exampleId === input.exampleId)
    : contract.examples[0]
  const canonicalExecutionMode = selectedExample?.executionMode ?? inferPreferredExecutionMode(contract)
  const observedExecutionMode = input.observedExecutionMode ?? 'adapted'
  const differences: string[] = []

  if (!contract.knownScenario) {
    differences.push('The scenario is not registered in the canonical playground catalog.')
  }

  if (canonicalExecutionMode !== observedExecutionMode) {
    differences.push(
      `Observed executionMode "${observedExecutionMode}" differs from canonical "${canonicalExecutionMode}".`,
    )
  }

  if (observedExecutionMode === 'canonical' && canonicalExecutionMode !== 'canonical') {
    differences.push('The implementation appears to overclaim canonical runtime parity.')
  }

  if (input.observedSourceType && selectedExample?.sourceType && input.observedSourceType !== selectedExample.sourceType) {
    differences.push(
      `Observed sourceType "${input.observedSourceType}" differs from canonical "${selectedExample.sourceType}".`,
    )
  }

  const verdict = differences.some(value => value.includes('overclaim') || value.includes('not registered'))
    ? 'misrepresented'
    : differences.length
      ? 'needs-review'
      : 'aligned'

  return {
    scenario: input.scenario,
    exampleId: input.exampleId ?? selectedExample?.exampleId ?? null,
    verdict,
    canonical: {
      knownScenario: contract.knownScenario,
      executionMode: canonicalExecutionMode,
      sourceType: selectedExample?.sourceType ?? null,
      sourcePath: selectedExample?.sourcePath ?? null,
      runtimeSourcePath: selectedExample?.runtimeSourcePath ?? null,
    },
    observed: {
      executionMode: observedExecutionMode,
      sourceType: input.observedSourceType ?? null,
      behaviorSummary: input.observedBehaviorSummary ?? null,
    },
    differences,
    guidance: buildComparisonGuidance(verdict, canonicalExecutionMode),
    relatedDocs: contract.relatedDocs,
    parityGates: contract.parityGates,
  }
}

function buildScenarioContract(
  catalog: KnowledgeCatalog,
  scenario: string,
): PlaygroundScenarioContract {
  const examples = getPlaygroundExamples(catalog).filter(example => example.scenario === scenario)
  const relatedDocs = collectScenarioDocs(catalog, scenario)
  const runtimeContract = SCENARIO_RUNTIME_CONTRACTS[scenario] ?? {
    expectedOutputPanels: [],
    expectedApiEndpoints: [],
    expectedEngineFunctions: [],
    implementationNotes: [
      'Add canonical example metadata before wiring UI behavior.',
      'Choose the execution mode explicitly before presenting runtime output.',
    ],
  }

  return {
    scenario,
    knownScenario: examples.length > 0,
    examples: examples.map(mapExampleForContract),
    relatedDocs: relatedDocs.map(mapDocForContract),
    expectedEditableFields: uniqueStrings(examples.flatMap(example => example.editableFields)),
    expectedOutputPanels: runtimeContract.expectedOutputPanels,
    expectedApiEndpoints: runtimeContract.expectedApiEndpoints,
    expectedEngineFunctions: runtimeContract.expectedEngineFunctions,
    parityGates: PLAYGROUND_PARITY_GATES,
    implementationNotes: runtimeContract.implementationNotes,
  }
}

function collectScenarioDocs(catalog: KnowledgeCatalog, scenario: string): DocKnowledgeEntry[] {
  const directDocs = catalog.docs.filter(doc => doc.playgroundScenario === scenario)
  const exampleDocIds = new Set(
    getPlaygroundExamples(catalog)
      .filter(example => example.scenario === scenario)
      .flatMap(example => example.recommendedDocIds),
  )
  const recommendedDocs = catalog.docs.filter(doc => exampleDocIds.has(doc.id))

  return dedupeById([...directDocs, ...recommendedDocs])
}

function mapExampleForContract(example: ExampleKnowledgeEntry): PlaygroundScenarioContract['examples'][number] {
  return {
    id: example.id,
    exampleId: example.exampleId,
    title: example.title,
    editableFields: example.editableFields,
    executionMode: example.executionMode ?? 'unknown',
    sourcePath: example.sourcePath,
    runtimeSourcePath: example.runtimeSourcePath,
    sourceType: example.sourceType,
    confidence: example.confidence,
  }
}

function mapDocForContract(doc: DocKnowledgeEntry) {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
  }
}

function validateEditableFields(
  contract: PlaygroundScenarioContract,
  input: PlaygroundScenarioImplementationSummary,
  issues: PlaygroundValidationIssue[],
) {
  if (!input.editableFields) {
    return
  }

  const expected = new Set(contract.expectedEditableFields)
  const actual = new Set(input.editableFields)
  const unknown = input.editableFields.filter(field => !expected.has(field))
  const missing = contract.expectedEditableFields.filter(field => !actual.has(field))

  if (unknown.length) {
    issues.push({
      severity: 'error',
      code: 'UNKNOWN_EDITABLE_FIELDS',
      message: `Editable fields are not in the canonical contract: ${unknown.join(', ')}.`,
      remediation: 'Remove the fields from the UI/API or add them to the canonical example metadata first.',
    })
  }

  if (missing.length) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_EDITABLE_FIELDS',
      message: `Canonical editable fields are not represented: ${missing.join(', ')}.`,
      remediation: 'Expose the missing fields or document why this scenario intentionally narrows the controls.',
    })
  }
}

function validateDocsLinkage(
  contract: PlaygroundScenarioContract,
  input: PlaygroundScenarioImplementationSummary,
  issues: PlaygroundValidationIssue[],
) {
  if (!input.docsSlugs) {
    return
  }

  const actual = new Set(input.docsSlugs.map(normalizeDocSlug))
  const missing = contract.relatedDocs
    .map(doc => doc.slug)
    .filter(slug => !actual.has(normalizeDocSlug(slug)))

  if (missing.length) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_DOC_LINKS',
      message: `Related canonical docs are not linked: ${missing.join(', ')}.`,
      remediation: 'Link the scenario to its canonical docs so playground behavior stays explainable.',
    })
  }
}

function validateOutputPanels(
  contract: PlaygroundScenarioContract,
  input: PlaygroundScenarioImplementationSummary,
  issues: PlaygroundValidationIssue[],
) {
  if (!input.outputPanels) {
    return
  }

  const actual = new Set(input.outputPanels)
  const missing = contract.expectedOutputPanels.filter(panel => !actual.has(panel))

  if (missing.length) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_OUTPUT_PANELS',
      message: `Expected output panels are missing: ${missing.join(', ')}.`,
      remediation: 'Keep result, SQL/include, schema, and diagnostics panels aligned with the scenario contract.',
    })
  }
}

function validateExecutionMode(
  selectedExample: PlaygroundScenarioContract['examples'][number] | undefined,
  input: PlaygroundScenarioImplementationSummary,
  issues: PlaygroundValidationIssue[],
) {
  if (!selectedExample || !input.executionMode) {
    return
  }

  if (input.executionMode === 'canonical' && selectedExample.executionMode !== 'canonical') {
    issues.push({
      severity: 'error',
      code: 'EXECUTION_MODE_OVERCLAIM',
      message: `Implementation claims canonical runtime behavior, but the canonical catalog marks it as "${selectedExample.executionMode}".`,
      remediation: 'Mark the scenario as adapted or complete upstream parity before claiming canonical execution.',
    })
  }

  if (input.executionMode !== 'canonical' && input.declaresAdaptedRuntime === false) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_ADAPTED_RUNTIME_DISCLOSURE',
      message: 'The implementation is not canonical but does not disclose adapted runtime behavior.',
      remediation: 'Show an adapted-runtime note in the scenario metadata or UI copy.',
    })
  }
}

function validateImplementationFlags(
  input: PlaygroundScenarioImplementationSummary,
  issues: PlaygroundValidationIssue[],
) {
  if (input.usesHardcodedOutput) {
    issues.push({
      severity: 'error',
      code: 'HARDCODED_OUTPUT',
      message: 'Primary playground output is reported as hardcoded.',
      remediation: 'Move primary output generation into runtime execution, fixtures, or a validated upstream-derived artifact.',
    })
  }

  if (input.hasApiValidation === false) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_API_VALIDATION',
      message: 'The scenario summary does not include API validation.',
      remediation: 'Validate scenario id, example id, editable fields, and request size before executing the runtime.',
    })
  }

  if (input.hasTests === false) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_TEST_COVERAGE',
      message: 'The scenario summary does not include maintainer test coverage.',
      remediation: 'Add API, catalog, or parity validator tests for the scenario.',
    })
  }

  if (input.hasFixture === false) {
    issues.push({
      severity: 'info',
      code: 'FIXTURE_NOT_DECLARED',
      message: 'No fixture/runtime data source was declared for the scenario.',
      remediation: 'Use explicit fixtures for adapted query/runtime demos so outputs remain reproducible.',
    })
  }

  if (!input.sourcePath || !input.runtimeSourcePath) {
    issues.push({
      severity: 'info',
      code: 'PROVENANCE_PATHS_INCOMPLETE',
      message: 'The implementation summary does not include both sourcePath and runtimeSourcePath.',
      remediation: 'Include source and runtime paths so maintainers can audit drift.',
    })
  }
}

function statusForGate(gateId: string, issues: PlaygroundValidationIssue[]): PlaygroundValidationStatus {
  const relatedIssues = issues.filter(issue => issueMatchesGate(issue.code, gateId))

  if (relatedIssues.some(issue => issue.severity === 'error')) {
    return 'fail'
  }

  if (relatedIssues.some(issue => issue.severity === 'warning')) {
    return 'warn'
  }

  return 'pass'
}

function issueMatchesGate(code: string, gateId: string) {
  switch (gateId) {
    case 'scenario-contract':
      return ['UNKNOWN_SCENARIO', 'UNKNOWN_EXAMPLE', 'UNKNOWN_EDITABLE_FIELDS', 'MISSING_EDITABLE_FIELDS'].includes(code)
    case 'docs-linkage':
      return code === 'MISSING_DOC_LINKS'
    case 'execution-mode-honesty':
      return ['EXECUTION_MODE_OVERCLAIM', 'MISSING_ADAPTED_RUNTIME_DISCLOSURE'].includes(code)
    case 'no-hardcoded-output':
      return code === 'HARDCODED_OUTPUT'
    case 'api-validation':
      return code === 'MISSING_API_VALIDATION'
    case 'fixture-or-runtime-data':
      return code === 'FIXTURE_NOT_DECLARED'
    case 'test-coverage':
      return code === 'MISSING_TEST_COVERAGE'
    case 'source-provenance':
      return code === 'PROVENANCE_PATHS_INCOMPLETE'
    default:
      return false
  }
}

function summarizeValidationStatus(issues: PlaygroundValidationIssue[]): PlaygroundValidationStatus {
  if (issues.some(issue => issue.severity === 'error')) {
    return 'fail'
  }

  if (issues.some(issue => issue.severity === 'warning')) {
    return 'warn'
  }

  return 'pass'
}

function inferPreferredExecutionMode(contract: PlaygroundScenarioContract): KnowledgeExecutionMode {
  const modes = contract.examples.map(example => example.executionMode)
  if (modes.includes('canonical')) {
    return 'canonical'
  }
  if (modes.includes('simulated')) {
    return 'simulated'
  }
  return 'adapted'
}

function buildRequiredArtifacts(knownScenario: boolean) {
  return [
    ...(knownScenario ? [] : ['canonical example metadata entry']),
    'playground registry entry',
    'runtime engine function or adapter',
    'Nitro API request validation',
    'UI state and output panel wiring',
    'fixture or upstream-derived runtime data',
    'docs link or callout',
    'API/catalog/parity tests',
  ]
}

function buildScenarioPlanSteps(options: {
  contract: PlaygroundScenarioContract
  targetExecutionMode: KnowledgeExecutionMode
  expectedEditableFields: string[]
  expectedOutputPanels: string[]
  upstreamSourcePath?: string
}) {
  const steps = [
    'Start by registering or confirming the canonical scenario and example metadata.',
    `Set executionMode to "${options.targetExecutionMode}" and disclose adapted behavior when it is not canonical.`,
    `Wire editable fields from the canonical contract: ${formatList(options.expectedEditableFields)}.`,
    `Wire output panels from the scenario contract: ${formatList(options.expectedOutputPanels)}.`,
    'Implement API validation before invoking the runtime engine.',
    'Generate primary outputs through runtime execution, validated fixtures, or upstream-derived artifacts.',
    'Add parity tests that call the maintainer validation tool with the implementation summary.',
  ]

  if (options.upstreamSourcePath) {
    steps.splice(1, 0, `Use upstream source provenance: ${options.upstreamSourcePath}.`)
  }

  if (options.contract.relatedDocs.length) {
    steps.push(`Link the scenario to canonical docs: ${options.contract.relatedDocs.map(doc => doc.slug).join(', ')}.`)
  }

  return steps
}

function buildComparisonGuidance(verdict: string, canonicalExecutionMode: KnowledgeExecutionMode | 'unknown') {
  if (verdict === 'aligned') {
    return 'The playground summary is aligned with the canonical scenario contract. Keep the parity gates in CI or maintainer tests.'
  }

  if (verdict === 'misrepresented') {
    return `Do not present this scenario as canonical while the catalog says "${canonicalExecutionMode}". Update executionMode disclosure or complete upstream parity work first.`
  }

  return 'Review the listed differences, then update either the implementation summary or the canonical metadata so the scenario contract is explicit.'
}

function normalizeDocSlug(slug: string) {
  return slug.startsWith('/') ? slug : `/${slug}`
}

function formatList(values: string[]) {
  return values.length ? values.join(', ') : 'none yet'
}

function uniqueStrings(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function dedupeById<T extends { id: string }>(entries: T[]) {
  const seen = new Set<string>()
  const result: T[] = []

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      continue
    }

    seen.add(entry.id)
    result.push(entry)
  }

  return result
}

function getPlaygroundExamples(catalog: KnowledgeCatalog) {
  return catalog.examples.filter(example => example.suitableSurfaces?.includes('playground'))
}
