import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildCachedSiteKnowledgeCatalog,
  createKnowledgeMcpManifest,
  type McpDomainContext,
} from '../../packages/graphql-gene-knowledge/src'

const DEFAULT_SOURCE_REPO = 'graphql-gene-site'
const DEFAULT_SOURCE_REF = 'workspace'
const WORKSPACE_ROOT_ENV = 'GRAPHQL_GENE_MCP_WORKSPACE_ROOT'
const SOURCE_REPO_ENV = 'GRAPHQL_GENE_MCP_SOURCE_REPO'
const SOURCE_REF_ENV = 'GRAPHQL_GENE_MCP_SOURCE_REF'
const GRAPHQL_GENE_VERSION_RANGE_ENV = 'GRAPHQL_GENE_MCP_GRAPHQL_GENE_VERSION_RANGE'

export function getWorkspaceRoot() {
  return resolveRuntimeRoots().workspaceRoot
}

export function getMcpServerRoot() {
  return resolveRuntimeRoots().mcpServerRoot
}

export function createKnowledgeDomainContext(): McpDomainContext {
  const workspaceRoot = getWorkspaceRoot()
  const sourceRepo = process.env[SOURCE_REPO_ENV] || DEFAULT_SOURCE_REPO
  const sourceRef = process.env[SOURCE_REF_ENV] || DEFAULT_SOURCE_REF

  return {
    catalog: buildCachedSiteKnowledgeCatalog({
      workspaceRoot,
      sourceRepo,
      sourceRef,
      versionRange: process.env[GRAPHQL_GENE_VERSION_RANGE_ENV] || readGraphqlGeneVersionRange(workspaceRoot),
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
    const packageJson = JSON.parse(readFileSync(resolve(getMcpServerRoot(), 'package.json'), 'utf8')) as {
      version?: string
    }

    return packageJson.version ?? '0.1.0'
  }
  catch {
    return '0.1.0'
  }
}

function resolveRuntimeRoots() {
  const workspaceRootOverride = process.env[WORKSPACE_ROOT_ENV]
  const workspaceRoot = workspaceRootOverride
    ? resolve(workspaceRootOverride)
    : findWorkspaceRoot(__dirname)
  const mcpServerRoot = findMcpServerRoot(__dirname) ?? resolve(workspaceRoot, 'mcp-server')

  return {
    workspaceRoot,
    mcpServerRoot,
  }
}

function findWorkspaceRoot(startDir: string) {
  const resolved = findAncestor(startDir, (candidateRoot) => {
    return existsSync(resolve(candidateRoot, 'mcp-server/package.json'))
      && existsSync(resolve(candidateRoot, 'content/graphql-gene/docs'))
  })

  return resolved ?? resolve(startDir, '..', '..')
}

function findMcpServerRoot(startDir: string) {
  return findAncestor(startDir, (candidateRoot) => {
    const packageJson = readJson(resolve(candidateRoot, 'package.json')) as { name?: string } | null
    return packageJson?.name === 'graphql-gene-mcp-server'
  })
}

function findAncestor(startDir: string, predicate: (candidateRoot: string) => boolean) {
  let candidateRoot = resolve(startDir)

  while (true) {
    if (predicate(candidateRoot)) {
      return candidateRoot
    }

    const parent = resolve(candidateRoot, '..')
    if (parent === candidateRoot) {
      return null
    }

    candidateRoot = parent
  }
}

function readJson(filePath: string) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as unknown
  }
  catch {
    return null
  }
}
