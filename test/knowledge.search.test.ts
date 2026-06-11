import { describe, expect, it } from 'vitest'
import {
  searchKnowledgeCatalog,
} from '../packages/graphql-gene-knowledge/src'
import { buildTestSiteKnowledgeCatalog } from './support/site-knowledge'

function buildCatalog() {
  return buildTestSiteKnowledgeCatalog()
}

describe('searchKnowledgeCatalog', () => {
  it('ranks the directives doc above the directive playground example', () => {
    const results = searchKnowledgeCatalog(buildCatalog(), { query: 'directive', limit: 5 })

    expect(results.length).toBeGreaterThan(1)
    expect(results[0].entry.id).toBe('doc:/docs/guides/directives')
    expect(results.some(result => result.entry.id === 'example:directive-middleware:user-auth-directive')).toBe(true)
  })

  it('supports doc-only section filtering', () => {
    const results = searchKnowledgeCatalog(buildCatalog(), {
      query: 'plugin',
      kind: 'doc',
      section: 'reference',
      limit: 5,
    })

    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].entry.id).toBe('doc:/docs/reference/writing-a-plugin')
    expect(results.some(result => result.entry.id === 'doc:/docs/reference/mcp-version-contract')).toBe(true)
  })

  it('supports scenario filtering across the linked knowledge graph', () => {
    const results = searchKnowledgeCatalog(buildCatalog(), {
      query: 'blocks',
      scenario: 'polymorphic-blocks',
      limit: 5,
    })

    expect(results.map(result => result.entry.id)).toContain('doc:/docs/guides/polymorphic-blocks')
    expect(results.map(result => result.entry.id)).toContain('example:polymorphic-blocks:page-blocks-basic')
    expect(results.map(result => result.entry.id)).toContain('recipe:polymorphic-content-blocks')
  })

  it('finds curated troubleshooting guidance by symptom keywords', () => {
    const results = searchKnowledgeCatalog(buildCatalog(), {
      query: 'missing types schema',
      kind: 'troubleshooting',
      limit: 5,
    })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].entry.id).toBe('troubleshooting:missing-types-in-generated-schema')
  })
})
