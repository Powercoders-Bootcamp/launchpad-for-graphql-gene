import { describe, expect, it } from 'vitest'
import {
  adaptExampleToProject,
  classifyDeveloperGoal,
  diagnoseDeveloperIssue,
  listDeveloperTaskPatterns,
  planDeveloperTask,
  validateDeveloperTaskPlan,
} from '../packages/graphql-gene-knowledge/src'
import { buildTestSiteKnowledgeCatalog } from './support/site-knowledge'

describe('developer task patterns', () => {
  it('lists source-backed developer tasks with stage and capability filters', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = listDeveloperTaskPatterns(catalog, {
      stage: 'query',
      capability: 'polymorphism',
    })

    expect(result.count).toBeGreaterThanOrEqual(1)
    expect(result.patterns.some(pattern => pattern.taskId === 'model-polymorphic-content-blocks')).toBe(true)
    expect(result.patterns[0].sourceCounts).toBeDefined()
    expect(result.patterns[0].confidence).toBeDefined()
  })

  it('classifies a developer goal into ranked tasks with missing context prompts', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = classifyDeveloperGoal(catalog, {
      goal: 'I want to reduce N+1 behavior on nested order queries',
      project: {
        orm: 'Sequelize',
      },
    })

    expect(result.rankedTasks[0].taskId).toBe('optimize-lookahead-loading')
    expect(result.recommendedNextTool).toBe('plan_developer_task')
    expect(result.missingContextQuestions.length).toBeGreaterThanOrEqual(1)
  })

  it('plans a developer project task with evidence, warnings, and version metadata', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = planDeveloperTask(catalog, {
      patternId: 'query-lookahead',
      goal: 'Reduce N+1 queries on nested order fields',
      project: {
        serverStack: 'Apollo Server',
        orm: 'Sequelize',
        constraints: ['keep generated resolvers where possible'],
      },
    })

    expect(result.taskId).toBe('optimize-lookahead-loading')
    expect(result.patternId).toBe('query-lookahead')
    expect(result.pluginStrategy.strategy).toBe('plugin-sequelize')
    expect(result.steps.some(step => step.includes('@graphql-gene/plugin-sequelize'))).toBe(true)
    expect(result.validationChecklist.some(check => check.includes('SQL/include'))).toBe(true)
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/schema-design')).toBe(true)
    expect(result.sourceEvidence.length).toBeGreaterThan(0)
    expect(result.versionMetadata.workspaceGraphqlGeneRange).toBeTruthy()
  })

  it('adapts a canonical example to project model concepts without copying playground runtime code', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = adaptExampleToProject(catalog, {
      patternId: 'polymorphic-blocks',
      targetModels: ['Page', 'HeroSection', 'MarkdownSection'],
      project: {
        orm: 'Sequelize',
        serverStack: 'GraphQL Yoga',
      },
    })

    expect(result.taskId).toBe('model-polymorphic-content-blocks')
    expect(result.patternId).toBe('polymorphic-blocks')
    expect(result.sourcePolicy.usePlaygroundAs).toBe('conceptual-reference')
    expect(result.sourcePolicy.doNotUsePlaygroundAs).toBe('copy-paste runtime source')
    expect(result.conceptMapping.some((mapping: { projectSubstitution: string }) => (
      mapping.projectSubstitution.includes('HeroSection')
    ))).toBe(true)
    expect(result.warnings.some((warning: string) => warning.includes('model-native'))).toBe(true)
  })

  it('validates developer task plans against canonical boundaries', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = validateDeveloperTaskPlan(catalog, {
      patternId: 'directive-middleware',
      usesPlaygroundRuntimeAsSource: true,
      includesPluginDecision: false,
      includesSchemaInspection: false,
      includesTests: false,
      handlesDirectiveRuntimeMode: false,
    })

    expect(result.taskId).toBe('attach-directive-middleware')
    expect(result.status).toBe('fail')
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'PLAYGROUND_RUNTIME_USED_AS_SOURCE',
      'PLUGIN_DECISION_MISSING',
      'SCHEMA_INSPECTION_MISSING',
      'TESTS_MISSING',
      'DIRECTIVE_RUNTIME_MODE_NOT_HANDLED',
    ]))
  })

  it('diagnoses developer issues with task-aware troubleshooting and parity warnings', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = diagnoseDeveloperIssue(catalog, {
      patternId: 'polymorphic-blocks',
      symptom: 'the polymorphic block import shown in docs does not exist in my installed package',
      stage: 'plugin',
      project: {
        orm: 'Sequelize',
      },
    })

    expect(result.taskId).toBe('model-polymorphic-content-blocks')
    expect(result.diagnosisArea).toBe('plugin')
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.nextTool).toBe('plan_developer_task')
  })
})
