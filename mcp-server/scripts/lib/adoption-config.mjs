import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_DIR = dirname(fileURLToPath(import.meta.url))
const SCRIPTS_ROOT = resolve(THIS_DIR, '..')
const MCP_SERVER_ROOT = resolve(SCRIPTS_ROOT, '..')
const WORKSPACE_ROOT = resolve(MCP_SERVER_ROOT, '..')
const SERVER_ID = 'graphql-gene'

export function buildMcpAdoptionConfig(options = {}) {
  const env = options.env ?? process.env
  const platform = options.platform ?? process.platform
  const host = env.GRAPHQL_GENE_MCP_HOST || '127.0.0.1'
  const port = normalizePort(env.GRAPHQL_GENE_MCP_PORT)
  const path = normalizePath(env.GRAPHQL_GENE_MCP_PATH || '/mcp')
  const selectedPlatform = platform === 'win32' ? 'windows' : 'posix'

  const stdio = {
    windows: {
      command: 'cmd',
      args: ['/c', 'npm', '--prefix', WORKSPACE_ROOT, 'run', 'mcp:start'],
      cwd: WORKSPACE_ROOT,
    },
    posix: {
      command: 'npm',
      args: ['--prefix', WORKSPACE_ROOT, 'run', 'mcp:start'],
      cwd: WORKSPACE_ROOT,
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
        args: ['/c', 'npm', '--prefix', WORKSPACE_ROOT, 'run', 'mcp:start:http'],
        cwd: WORKSPACE_ROOT,
        env: {
          GRAPHQL_GENE_MCP_HOST: host,
          GRAPHQL_GENE_MCP_PORT: String(port),
          GRAPHQL_GENE_MCP_PATH: path,
        },
      },
      posix: {
        command: 'npm',
        args: ['--prefix', WORKSPACE_ROOT, 'run', 'mcp:start:http'],
        cwd: WORKSPACE_ROOT,
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
    workspaceRoot: WORKSPACE_ROOT,
    mcpServerRoot: MCP_SERVER_ROOT,
    selectedPlatform,
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
