import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { AddressInfo } from 'node:net'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createGraphqlGeneMcpServer } from './server.js'

export interface GraphqlGeneMcpHttpServerOptions {
  host?: string
  port?: number
  path?: string
}

export interface GraphqlGeneMcpHttpServerHandle {
  server: Server
  host: string
  port: number
  path: string
  url: string
}

export async function startGraphqlGeneMcpHttpServer(
  options: GraphqlGeneMcpHttpServerOptions = {},
): Promise<GraphqlGeneMcpHttpServerHandle> {
  const host = options.host ?? '127.0.0.1'
  const port = options.port ?? 3001
  const path = normalizeMcpPath(options.path ?? '/mcp')

  const server = createServer(async (req, res) => {
    await handleHttpRequest(req, res, path)
  })

  await new Promise<void>((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise)
    server.listen(port, host, () => {
      server.off('error', rejectPromise)
      resolvePromise()
    })
  })

  const address = server.address() as AddressInfo

  return {
    server,
    host,
    port: address.port,
    path,
    url: `http://${host}:${address.port}${path}`,
  }
}

export async function stopGraphqlGeneMcpHttpServer(server: Server) {
  await new Promise<void>((resolvePromise, rejectPromise) => {
    server.close((error) => {
      if (error) {
        rejectPromise(error)
        return
      }

      resolvePromise()
    })
  })
}

export async function startGraphqlGeneMcpHttpServerFromEnv() {
  const handle = await startGraphqlGeneMcpHttpServer({
    host: process.env.GRAPHQL_GENE_MCP_HOST,
    port: readPort(process.env.GRAPHQL_GENE_MCP_PORT),
    path: process.env.GRAPHQL_GENE_MCP_PATH,
  })

  console.error(`[graphql-gene-mcp] streamable HTTP listening on ${handle.url}`)
  return handle
}

async function handleHttpRequest(req: IncomingMessage, res: ServerResponse, expectedPath: string) {
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`)

  if (requestUrl.pathname !== expectedPath) {
    writeJson(res, 404, {
      jsonrpc: '2.0',
      error: {
        code: -32004,
        message: `Not Found: expected ${expectedPath}`,
      },
      id: null,
    })
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    writeJson(res, 405, {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Method not allowed.',
      },
      id: null,
    })
    return
  }

  let parsedBody: unknown

  try {
    parsedBody = await readJsonBody(req)
  }
  catch {
    writeJson(res, 400, {
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Invalid JSON request body.',
      },
      id: null,
    })
    return
  }

  const mcpServer = createGraphqlGeneMcpServer()
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  const cleanup = once(async () => {
    await Promise.allSettled([
      transport.close(),
      mcpServer.close(),
    ])
  })

  res.once('close', () => {
    void cleanup()
  })

  try {
    await mcpServer.connect(transport)
    await transport.handleRequest(req, res, parsedBody)
  }
  catch (error) {
    console.error('[graphql-gene-mcp] HTTP transport error')
    console.error(error)

    if (!res.headersSent) {
      writeJson(res, 500, {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error.',
        },
        id: null,
      })
    }

    await cleanup()
  }
}

function normalizeMcpPath(value: string) {
  return value.startsWith('/') ? value : `/${value}`
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const body = Buffer.concat(chunks).toString('utf8').trim()
  return body ? JSON.parse(body) : {}
}

function readPort(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function writeJson(res: ServerResponse, statusCode: number, payload: unknown) {
  if (!res.headersSent) {
    res.statusCode = statusCode
    res.setHeader('content-type', 'application/json')
  }

  res.end(JSON.stringify(payload))
}

function once<T>(callback: () => Promise<T>) {
  let called = false

  return async () => {
    if (called) {
      return
    }

    called = true
    await callback()
  }
}
