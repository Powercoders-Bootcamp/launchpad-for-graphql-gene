import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildKnowledgeCatalog } from '../packages/graphql-gene-knowledge/src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')
const docsRoot = path.join(workspaceRoot, 'content', 'graphql-gene', 'docs')

const docsConfig = {
  docsRoot: 'docs',
  sections: [
    { id: 'concepts', title: 'Concepts', order: 1 },
    { id: 'guides', title: 'Guides', order: 2 },
    { id: 'reference', title: 'Reference', order: 3 },
    { id: 'examples', title: 'Examples', order: 4 },
    { id: 'tutorials', title: 'Tutorials', order: 5 },
  ],
}

const examples = [
  {
    id: 'user-orders-basic',
    scenario: 'model-to-schema',
    title: 'User with Orders',
    description: 'Generate a schema from User and Order models with a hasMany association.',
    editableFields: ['includeOrders', 'includeAddress', 'showTypeSummary'],
  },
  {
    id: 'me-with-orders',
    scenario: 'query-lookahead',
    title: 'Me with Orders',
    description: 'Query the current user including their orders. Observe the JOIN in the SQL panel.',
    editableFields: ['query'],
  },
  {
    id: 'page-blocks-basic',
    scenario: 'polymorphic-blocks',
    title: 'Polymorphic Page Blocks',
    description: 'Query heterogeneous CMS blocks with inline fragments.',
    editableFields: ['query'],
  },
  {
    id: 'user-auth-directive',
    scenario: 'directive-middleware',
    title: 'Auth Directive',
    description: 'Attach @userAuth to a field and inspect schema and runtime behavior.',
    editableFields: ['directiveMode'],
  },
]

describe('buildKnowledgeCatalog', () => {
  it('normalizes docs and examples into a linked canonical catalog', () => {
    const catalog = buildKnowledgeCatalog({
      workspaceRoot,
      docsRoot,
      docsConfig,
      examples,
      sourceRepo: 'graphql-gene-site',
      sourceRef: 'workspace',
      versionRange: '^1.3.7',
    })

    expect(catalog.counts.docs).toBe(5)
    expect(catalog.counts.examples).toBe(4)
    expect(catalog.counts.entries).toBe(9)

    const directivesDoc = catalog.byId['doc:/docs/guides/directives']
    const directivesExample = catalog.byId['example:directive-middleware:user-auth-directive']

    expect(directivesDoc).toBeDefined()
    expect(directivesExample).toBeDefined()
    expect(directivesDoc.relatedIds).toContain('example:directive-middleware:user-auth-directive')
    expect(directivesExample.relatedIds).toContain('doc:/docs/guides/directives')
    expect(catalog.examples.every(example => example.executionMode === 'adapted')).toBe(true)
    expect(catalog.diagnostics.some(diagnostic => diagnostic.code === 'PLAYGROUND_RUNTIME_NOT_CANONICAL')).toBe(true)
  })
})
