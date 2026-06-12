import { describe, expect, it } from 'vitest'
import {
  adaptExampleToProject,
  listDeveloperTaskPatterns,
  planDeveloperTask,
  validateDeveloperTaskPlan,
} from '../packages/graphql-gene-knowledge/src'
import { buildTestSiteKnowledgeCatalog } from './support/site-knowledge'

describe('developer task patterns', () => {
  it('lists source-backed developer task patterns', () => {
    const catalog = buildTestSiteKnowledgeCatalog()
    const result = listDeveloperTaskPatterns(catalog)

    expect(result.count).toBe(4)
    expect(result.patterns.map(pattern => pattern.id)).toEqual(expect.arrayContaining([
      'model-to-schema',
      'query-lookahead',
      'polymorphic-blocks',
      'directive-middleware',
    ]))
    expect(result.patterns.find(pattern => pattern.id === 'polymorphic-blocks')?.docs[0].id).toBe(
      'doc:/docs/guides/polymorphic-blocks',
    )
  })

  it('plans a developer project task from a playground-like pattern', () => {
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

    expect(result.patternId).toBe('query-lookahead')
    expect(result.pluginStrategy.strategy).toBe('plugin-sequelize')
    expect(result.steps.some(step => step.includes('@graphql-gene/plugin-sequelize'))).toBe(true)
    expect(result.validationChecklist.some(check => check.includes('SQL/include'))).toBe(true)
    expect(result.docs.some((doc: { id: string }) => doc.id === 'doc:/docs/guides/schema-design')).toBe(true)
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

    expect(result.sourcePolicy.usePlaygroundAs).toBe('conceptual-reference')
    expect(result.sourcePolicy.doNotUsePlaygroundAs).toBe('copy-paste runtime source')
    expect(result.conceptMapping.some((mapping: { projectSubstitution: string }) => (
      mapping.projectSubstitution.includes('HeroSection')
    ))).toBe(true)
    expect(result.warnings).toContain(
      'Do not overclaim polymorphism as unique; emphasize model-native, generator-first schema generation.',
    )
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

    expect(result.status).toBe('fail')
    expect(result.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'PLAYGROUND_RUNTIME_USED_AS_SOURCE',
      'PLUGIN_DECISION_MISSING',
      'SCHEMA_INSPECTION_MISSING',
      'TESTS_MISSING',
      'DIRECTIVE_RUNTIME_MODE_NOT_HANDLED',
    ]))
  })
})
