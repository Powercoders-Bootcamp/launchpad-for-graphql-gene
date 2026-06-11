import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildKnowledgeCatalog,
  getSitePluginKnowledge,
  getSiteRecipeKnowledge,
  getSiteTroubleshootingKnowledge,
  searchKnowledgeCatalog,
} from '../packages/graphql-gene-knowledge/src'

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

function buildCatalog() {
  return buildKnowledgeCatalog({
    workspaceRoot,
    docsRoot,
    docsConfig,
    examples,
    plugins: getSitePluginKnowledge(),
    recipes: getSiteRecipeKnowledge(),
    troubleshooting: getSiteTroubleshootingKnowledge(),
    sourceRepo: 'graphql-gene-site',
    sourceRef: 'workspace',
    versionRange: '^1.3.7',
  })
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
