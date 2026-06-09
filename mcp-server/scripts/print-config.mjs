import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_DIR = dirname(fileURLToPath(import.meta.url))
const MCP_SERVER_ROOT = resolve(THIS_DIR, '..')
const WORKSPACE_ROOT = resolve(MCP_SERVER_ROOT, '..')

const host = process.env.GRAPHQL_GENE_MCP_HOST || '127.0.0.1'
const port = Number(process.env.GRAPHQL_GENE_MCP_PORT || 3001)
const path = normalizePath(process.env.GRAPHQL_GENE_MCP_PATH || '/mcp')

const payload = {
  workspaceRoot: WORKSPACE_ROOT,
  mcpServerRoot: MCP_SERVER_ROOT,
  stdio: {
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
  },
  http: {
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
  },
  genericRegistration: {
    stdio: {
      transport: 'stdio',
      command: process.platform === 'win32' ? 'cmd' : 'npm',
      args: process.platform === 'win32'
        ? ['/c', 'npm', '--prefix', WORKSPACE_ROOT, 'run', 'mcp:start']
        : ['--prefix', WORKSPACE_ROOT, 'run', 'mcp:start'],
      cwd: WORKSPACE_ROOT,
    },
    http: {
      transport: 'streamable-http',
      url: `http://${host}:${port}${path}`,
    },
  },
}

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(payload, null, 2))
  process.exit(0)
}

const lines = [
  'GraphQL Gene MCP Config',
  '=======================',
  '',
  `Workspace root: ${payload.workspaceRoot}`,
  `MCP server root: ${payload.mcpServerRoot}`,
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
]

process.stdout.write(lines.join('\n'))

function normalizePath(value) {
  return value.startsWith('/') ? value : `/${value}`
}
