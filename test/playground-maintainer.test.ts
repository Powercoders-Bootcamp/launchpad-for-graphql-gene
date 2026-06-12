import { describe, expect, it } from 'vitest'
import {
  comparePlaygroundWithCanonical,
  inspectPlaygroundScenario,
  listPlaygroundParityGates,
  planPlaygroundScenario,
  validatePlaygroundScenario,
} from '../packages/graphql-gene-knowledge/src'
import { buildTestSiteKnowledgeCatalog } from './support/site-knowledge'

describe('playground maintainer guidance', () => {
  it('inspects the canonical contract for an existing playground scenario', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const contract = inspectPlaygroundScenario(catalog, 'polymorphic-blocks')

    expect(contract.knownScenario).toBe(true)
    expect(contract.expectedApiEndpoints).toContain('POST /api/playground/query')
    expect(contract.expectedOutputPanels).toEqual(expect.arrayContaining([
      'response-payload',
      'captured-sql',
      'include-graph',
      'diagnostics',
    ]))
    expect(contract.relatedDocs.some(doc => doc.slug === '/docs/guides/polymorphic-blocks')).toBe(true)
    expect(contract.parityGates.some(gate => gate.id === 'no-hardcoded-output')).toBe(true)
  })

  it('validates implementation summaries against parity gates', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = validatePlaygroundScenario(catalog, {
      scenario: 'polymorphic-blocks',
      exampleId: 'page-blocks-basic',
      editableFields: ['query', 'unsupportedControl'],
      docsSlugs: ['/docs/guides/polymorphic-blocks'],
      outputPanels: ['response-payload'],
      executionMode: 'canonical',
      declaresAdaptedRuntime: false,
      hasApiValidation: false,
      hasTests: false,
      usesHardcodedOutput: true,
    })

    expect(result.status).toBe('fail')
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'UNKNOWN_EDITABLE_FIELDS',
      'EXECUTION_MODE_OVERCLAIM',
      'HARDCODED_OUTPUT',
      'MISSING_API_VALIDATION',
      'MISSING_TEST_COVERAGE',
    ]))
    expect(result.checks.find(check => check.id === 'no-hardcoded-output')?.status).toBe('fail')
  })

  it('plans required artifacts for a new playground scenario', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const plan = planPlaygroundScenario(catalog, {
      scenario: 'subscription-events',
      goal: 'Show how a future GraphQL Gene subscription scenario should be authored.',
      executionMode: 'simulated',
      upstreamSourcePath: 'examples/subscription-events.ts',
    })

    expect(plan.knownScenario).toBe(false)
    expect(plan.requiredArtifacts).toContain('canonical example metadata entry')
    expect(plan.requiredArtifacts).toContain('Nitro API request validation')
    expect(plan.steps.some(step => step.includes('examples/subscription-events.ts'))).toBe(true)
  })

  it('flags playground parity overclaims against canonical metadata', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const comparison = comparePlaygroundWithCanonical(catalog, {
      scenario: 'query-lookahead',
      exampleId: 'me-with-orders',
      observedExecutionMode: 'canonical',
      observedSourceType: 'demo-runtime',
    })

    expect(comparison.verdict).toBe('misrepresented')
    expect(comparison.differences.some(difference => difference.includes('overclaim'))).toBe(true)
    expect(comparison.guidance).toContain('Do not present this scenario as canonical')
  })

  it('lists shared parity gates for all scenario contracts', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = listPlaygroundParityGates(catalog)

    expect(result.gates.map(gate => gate.id)).toEqual(expect.arrayContaining([
      'scenario-contract',
      'docs-linkage',
      'execution-mode-honesty',
      'no-hardcoded-output',
      'api-validation',
    ]))
    expect(result.scenarioContracts.length).toBe(4)
  })
})
