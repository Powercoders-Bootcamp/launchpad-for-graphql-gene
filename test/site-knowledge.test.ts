import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildSiteKnowledgeCatalog,
  getSitePluginKnowledge,
  getSitePlaygroundExample,
  getSitePlaygroundExamples,
  getSiteRecipeKnowledge,
  getSiteTroubleshootingKnowledge,
  siteDocsConfig,
} from '../packages/graphql-gene-knowledge/src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')

describe('site knowledge seeds', () => {
  it('exports the shared docs config and playground examples', () => {
    expect(siteDocsConfig.sections.length).toBe(5)
    expect(getSitePlaygroundExamples().length).toBe(4)
    expect(getSitePluginKnowledge().length).toBe(2)
    expect(getSiteRecipeKnowledge().length).toBe(5)
    expect(getSiteTroubleshootingKnowledge().length).toBe(5)
    expect(getSitePlaygroundExample('directive-middleware', 'user-auth-directive')?.title).toBe('Auth Directive')
  })

  it('builds the site knowledge catalog from shared seed data', () => {
    const catalog = buildSiteKnowledgeCatalog({
      workspaceRoot,
      sourceRepo: 'graphql-gene-site',
      sourceRef: 'workspace',
      versionRange: '^1.3.7',
    })

    expect(catalog.counts.docs).toBe(8)
    expect(catalog.counts.examples).toBe(4)
    expect(catalog.counts.plugins).toBe(2)
    expect(catalog.counts.recipes).toBe(5)
    expect(catalog.counts.troubleshooting).toBe(5)
    expect(catalog.byId['doc:/docs/guides/directives']).toBeDefined()
    expect(catalog.byId['example:directive-middleware:user-auth-directive']).toBeDefined()
    expect(catalog.byId['plugin:sequelize']).toBeDefined()
    expect(catalog.byId['recipe:sequelize-bootstrap']).toBeDefined()
    expect(catalog.byId['troubleshooting:missing-types-in-generated-schema']).toBeDefined()
    expect(catalog.audit?.metadata.upstreamRepo).toBeTruthy()
    expect(catalog.audit?.metadata.status).toBe('full')
    expect(catalog.audit?.repositoryInventory.some(entry => entry.path === 'content/graphql-gene/docs')).toBe(true)
    expect(catalog.audit?.coverage.capabilities).toBeGreaterThanOrEqual(8)
    expect(catalog.audit?.packageParity.summary.unresolved).toBeGreaterThan(0)
    expect(catalog.byId['doc:/docs/concepts/getting-started'].upstreamSourcePath).toBe('README.md#quick-setup')
    expect(catalog.byId['doc:/mcp/setup'].provenanceStatus).toBe('local-only')
  })
})
