import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'

const THIS_DIR = dirname(fileURLToPath(import.meta.url))
const SERVER_ID = 'graphql-gene'
const WORKSPACE_ROOT_ENV = 'GRAPHQL_GENE_MCP_WORKSPACE_ROOT'
const SOURCE_REPO_ENV = 'GRAPHQL_GENE_MCP_SOURCE_REPO'
const SOURCE_REF_ENV = 'GRAPHQL_GENE_MCP_SOURCE_REF'
const GRAPHQL_GENE_VERSION_RANGE_ENV = 'GRAPHQL_GENE_MCP_GRAPHQL_GENE_VERSION_RANGE'

export function buildMcpAdoptionConfig(options = {}) {
  const env = options.env ?? process.env
  const platform = options.platform ?? process.platform
  const { workspaceRoot, mcpServerRoot } = resolveRuntimeRoots(env)
  const host = env.GRAPHQL_GENE_MCP_HOST || '127.0.0.1'
  const port = normalizePort(env.GRAPHQL_GENE_MCP_PORT)
  const path = normalizePath(env.GRAPHQL_GENE_MCP_PATH || '/mcp')
  const selectedPlatform = platform === 'win32' ? 'windows' : 'posix'

  const stdio = {
    windows: {
      command: 'cmd',
      args: ['/c', 'npm', '--prefix', mcpServerRoot, 'run', 'start'],
      cwd: workspaceRoot,
    },
    posix: {
      command: 'npm',
      args: ['--prefix', mcpServerRoot, 'run', 'start'],
      cwd: workspaceRoot,
    },
  }

  const http = {
    host,
    port,
    path,
    url: `http://${host}:${port}${path}`,
    start: {
      windows: {
        command: 'cmd',
        args: ['/c', 'npm', '--prefix', mcpServerRoot, 'run', 'start:http'],
        cwd: workspaceRoot,
        env: {
          GRAPHQL_GENE_MCP_HOST: host,
          GRAPHQL_GENE_MCP_PORT: String(port),
          GRAPHQL_GENE_MCP_PATH: path,
        },
      },
      posix: {
        command: 'npm',
        args: ['--prefix', mcpServerRoot, 'run', 'start:http'],
        cwd: workspaceRoot,
        env: {
          GRAPHQL_GENE_MCP_HOST: host,
          GRAPHQL_GENE_MCP_PORT: String(port),
          GRAPHQL_GENE_MCP_PATH: path,
        },
      },
    },
  }

  const currentStdio = stdio[selectedPlatform]
  const currentHttp = http.start[selectedPlatform]
  const commonStdioServer = {
    command: currentStdio.command,
    args: currentStdio.args,
  }

  return {
    serverId: SERVER_ID,
    workspaceRoot,
    mcpServerRoot,
    selectedPlatform,
    runtimeContract: {
      workspaceRootEnvVar: WORKSPACE_ROOT_ENV,
      sourceRepoEnvVar: SOURCE_REPO_ENV,
      sourceRefEnvVar: SOURCE_REF_ENV,
      graphqlGeneVersionRangeEnvVar: GRAPHQL_GENE_VERSION_RANGE_ENV,
      defaultSourceRepo: env[SOURCE_REPO_ENV] || 'graphql-gene-site',
      defaultSourceRef: env[SOURCE_REF_ENV] || 'workspace',
      detectedGraphqlGeneVersionRange: readWorkspaceGraphqlGeneVersionRange(workspaceRoot),
    },
    stdio,
    http,
    genericRegistration: {
      stdio: {
        transport: 'stdio',
        command: currentStdio.command,
        args: currentStdio.args,
        cwd: currentStdio.cwd,
      },
      http: {
        transport: 'streamable-http',
        url: http.url,
      },
    },
    clientPresets: {
      claudeDesktop: {
        description: 'Common mcpServers wrapper for Claude Desktop style local stdio registration.',
        mcpServers: {
          [SERVER_ID]: commonStdioServer,
        },
      },
      cursor: {
        description: 'Common mcpServers wrapper for Cursor style local stdio registration.',
        mcpServers: {
          [SERVER_ID]: commonStdioServer,
        },
      },
      genericMcpServers: {
        description: 'Common mcpServers wrapper used by several desktop and IDE MCP hosts.',
        mcpServers: {
          [SERVER_ID]: commonStdioServer,
        },
      },
      genericHttp: {
        description: 'Generic Streamable HTTP registration for clients that support remote MCP endpoints.',
        transport: 'streamable-http',
        url: http.url,
      },
      genericStdio: {
        description: 'Transport-first stdio registration for generic MCP clients.',
        transport: 'stdio',
        command: currentStdio.command,
        args: currentStdio.args,
        cwd: currentStdio.cwd,
      },
    },
  }
}

export function formatMcpAdoptionConfig(payload) {
  const lines = [
    'GraphQL Gene MCP Config',
    '=======================',
    '',
    `Workspace root: ${payload.workspaceRoot}`,
    `MCP server root: ${payload.mcpServerRoot}`,
    `Selected platform: ${payload.selectedPlatform}`,
    '',
    'Recommended stdio registration (Windows):',
    JSON.stringify(payload.stdio.windows, null, 2),
    '',
    'Recommended stdio registration (POSIX):',
    JSON.stringify(payload.stdio.posix, null, 2),
    '',
    'Recommended Streamable HTTP endpoint:',
    JSON.stringify(payload.http, null, 2),
    '',
    'Generic client registration snippets:',
    JSON.stringify(payload.genericRegistration, null, 2),
    '',
    'Client presets:',
    JSON.stringify(payload.clientPresets, null, 2),
  ]

  return lines.join('\n')
}

function normalizePath(value) {
  return value.startsWith('/') ? value : `/${value}`
}

function normalizePort(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3001
}

function resolveRuntimeRoots(env) {
  const workspaceRootOverride = env[WORKSPACE_ROOT_ENV]
  const workspaceRoot = workspaceRootOverride
    ? resolve(workspaceRootOverride)
    : findWorkspaceRoot(THIS_DIR)
  const mcpServerRoot = findMcpServerRoot(THIS_DIR) ?? resolve(workspaceRoot, 'mcp-server')

  return {
    workspaceRoot,
    mcpServerRoot,
  }
}

function findWorkspaceRoot(startDir) {
  const resolved = findAncestor(startDir, (candidateRoot) => {
    return existsSync(resolve(candidateRoot, 'mcp-server/package.json'))
      && existsSync(resolve(candidateRoot, 'content/graphql-gene/docs'))
  })

  return resolved ?? resolve(startDir, '..', '..')
}

function findMcpServerRoot(startDir) {
  return findAncestor(startDir, (candidateRoot) => {
    const packageJson = readJson(resolve(candidateRoot, 'package.json'))
    return packageJson?.name === 'graphql-gene-mcp-server'
  })
}

function findAncestor(startDir, predicate) {
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

function readWorkspaceGraphqlGeneVersionRange(workspaceRoot) {
  return readJson(resolve(workspaceRoot, 'package.json'))?.dependencies?.['graphql-gene']
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  }
  catch {
    return null
  }
}
