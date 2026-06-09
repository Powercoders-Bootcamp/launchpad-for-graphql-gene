import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildSiteKnowledgeCatalog,
  createKnowledgeMcpManifest,
  type McpDomainContext,
} from '../../packages/graphql-gene-knowledge/src'

const WORKSPACE_ROOT = resolve(__dirname, '..', '..')

export function getWorkspaceRoot() {
  return WORKSPACE_ROOT
}

export function createKnowledgeDomainContext(): McpDomainContext {
  const workspaceRoot = getWorkspaceRoot()

  return {
    catalog: buildSiteKnowledgeCatalog({
      workspaceRoot,
      sourceRepo: 'graphql-gene-site',
      sourceRef: 'workspace',
      versionRange: readGraphqlGeneVersionRange(workspaceRoot),
    }),
    serverVersion: readMcpServerVersion(),
  }
}

export function createKnowledgeManifest() {
  return createKnowledgeMcpManifest(readMcpServerVersion())
}

function readGraphqlGeneVersionRange(workspaceRoot: string) {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(workspaceRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
    }

    return packageJson.dependencies?.['graphql-gene']
  }
  catch {
    return undefined
  }
}

function readMcpServerVersion() {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, 'mcp-server/package.json'), 'utf8')) as {
      version?: string
    }

    return packageJson.version ?? '0.1.0'
  }
  catch {
    return '0.1.0'
  }
}
