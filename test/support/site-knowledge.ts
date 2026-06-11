import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSiteKnowledgeCatalog, type McpDomainContext } from '../../packages/graphql-gene-knowledge/src'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const workspaceRoot = path.resolve(__dirname, '..', '..')

export function buildTestSiteKnowledgeCatalog() {
  return buildSiteKnowledgeCatalog({
    workspaceRoot,
    sourceRepo: 'graphql-gene-site',
    sourceRef: 'workspace',
    versionRange: '^1.3.7',
  })
}

export function createTestKnowledgeContext(serverVersion = '0.1.0-test'): McpDomainContext {
  return {
    catalog: buildTestSiteKnowledgeCatalog(),
    serverVersion,
  }
}
