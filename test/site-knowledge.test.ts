import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildSiteKnowledgeCatalog,
  getSitePlaygroundExample,
  getSitePlaygroundExamples,
  siteDocsConfig,
} from '../packages/graphql-gene-knowledge/src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')

describe('site knowledge seeds', () => {
  it('exports the shared docs config and playground examples', () => {
    expect(siteDocsConfig.sections.length).toBe(5)
    expect(getSitePlaygroundExamples().length).toBe(4)
    expect(getSitePlaygroundExample('directive-middleware', 'user-auth-directive')?.title).toBe('Auth Directive')
  })

  it('builds the site knowledge catalog from shared seed data', () => {
    const catalog = buildSiteKnowledgeCatalog({
      workspaceRoot,
      sourceRepo: 'graphql-gene-site',
      sourceRef: 'workspace',
      versionRange: '^1.3.7',
    })

    expect(catalog.counts.docs).toBe(5)
    expect(catalog.counts.examples).toBe(4)
    expect(catalog.byId['doc:/docs/guides/directives']).toBeDefined()
    expect(catalog.byId['example:directive-middleware:user-auth-directive']).toBeDefined()
  })
})
