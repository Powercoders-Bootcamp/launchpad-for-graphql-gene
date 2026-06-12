import { describe, expect, it } from 'vitest'
import { buildTestSiteKnowledgeCatalog } from './support/site-knowledge'

describe('buildKnowledgeCatalog', () => {
  it('normalizes docs and examples into a linked canonical catalog', () => {
    const catalog = buildTestSiteKnowledgeCatalog()

    expect(catalog.counts.docs).toBe(8)
    expect(catalog.counts.examples).toBe(4)
    expect(catalog.counts.plugins).toBe(2)
    expect(catalog.counts.recipes).toBe(5)
    expect(catalog.counts.troubleshooting).toBe(5)
    expect(catalog.counts.entries).toBe(24)

    const directivesDoc = catalog.byId['doc:/docs/guides/directives']
    const directivesExample = catalog.byId['example:directive-middleware:user-auth-directive']
    const directiveRecipe = catalog.byId['recipe:directive-middleware-auth']

    expect(directivesDoc).toBeDefined()
    expect(directivesExample).toBeDefined()
    expect(directiveRecipe).toBeDefined()
    expect(directivesDoc.relatedIds).toContain('example:directive-middleware:user-auth-directive')
    expect(directivesDoc.relatedIds).toContain('recipe:directive-middleware-auth')
    expect(directivesExample.relatedIds).toContain('doc:/docs/guides/directives')
    expect(directiveRecipe.relatedIds).toContain('doc:/docs/guides/directives')
    expect(catalog.examples.every(example => example.executionMode === 'adapted')).toBe(true)
    expect(catalog.diagnostics.some(diagnostic => diagnostic.code === 'PLAYGROUND_RUNTIME_NOT_CANONICAL')).toBe(true)
    expect(catalog.diagnostics.some(diagnostic => diagnostic.code === 'PLAYGROUND_PARITY_GATES_REQUIRED')).toBe(true)
    expect(catalog.diagnostics.some(diagnostic => diagnostic.code === 'PLAYGROUND_DISPLAYED_CODE_PARITY_UNVERIFIED')).toBe(true)
    expect(catalog.diagnostics.some(diagnostic => diagnostic.code === 'CURATED_KNOWLEDGE_NORMALIZED')).toBe(true)
  })
})
