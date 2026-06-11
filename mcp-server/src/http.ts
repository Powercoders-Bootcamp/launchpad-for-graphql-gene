import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { AddressInfo } from 'node:net'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createGraphqlGeneMcpServer } from './server.js'

const DEFAULT_MAX_BODY_BYTES = 256 * 1024
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 120

let requestSequence = 0

export interface GraphqlGeneMcpHttpRateLimitOptions {
  windowMs?: number
  maxRequests?: number
}

export interface GraphqlGeneMcpHttpServerOptions {
  host?: string
  port?: number
  path?: string
  healthPath?: string
  authToken?: string
  maxBodyBytes?: number
  rateLimit?: GraphqlGeneMcpHttpRateLimitOptions
  logRequests?: boolean
}

export interface GraphqlGeneMcpHttpServerHandle {
  server: Server
  host: string
  port: number
  path: string
  healthPath: string
  url: string
  healthUrl: string
}

export async function startGraphqlGeneMcpHttpServer(
  options: GraphqlGeneMcpHttpServerOptions = {},
): Promise<GraphqlGeneMcpHttpServerHandle> {
  const host = options.host ?? '127.0.0.1'
  const port = options.port ?? 3001
  const path = normalizeMcpPath(options.path ?? '/mcp')
  const healthPath = normalizeMcpPath(options.healthPath ?? '/healthz')
  const policy = resolveHttpPolicy(options)
  const rateLimiter = createRateLimiter(policy.rateLimit)

  const server = createServer(async (req, res) => {
    await handleHttpRequest(req, res, {
      path,
      healthPath,
      policy,
      rateLimiter,
    })
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
    healthPath,
    url: `http://${host}:${address.port}${path}`,
    healthUrl: `http://${host}:${address.port}${healthPath}`,
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
    healthPath: process.env.GRAPHQL_GENE_MCP_HEALTH_PATH,
    authToken: process.env.GRAPHQL_GENE_MCP_AUTH_TOKEN,
    maxBodyBytes: readPositiveInteger(process.env.GRAPHQL_GENE_MCP_MAX_BODY_BYTES),
    rateLimit: {
      windowMs: readPositiveInteger(process.env.GRAPHQL_GENE_MCP_RATE_LIMIT_WINDOW_MS),
      maxRequests: readInteger(process.env.GRAPHQL_GENE_MCP_RATE_LIMIT_MAX_REQUESTS),
    },
    logRequests: readBoolean(process.env.GRAPHQL_GENE_MCP_ENABLE_ACCESS_LOGS, true),
  })

  console.error(`[graphql-gene-mcp] streamable HTTP listening on ${handle.url}`)
  console.error(`[graphql-gene-mcp] health endpoint listening on ${handle.healthUrl}`)
  console.error(`[graphql-gene-mcp] HTTP auth ${process.env.GRAPHQL_GENE_MCP_AUTH_TOKEN ? 'enabled' : 'disabled'}`)
  console.error(
    `[graphql-gene-mcp] HTTP request limits maxBodyBytes=${readPositiveInteger(process.env.GRAPHQL_GENE_MCP_MAX_BODY_BYTES) ?? DEFAULT_MAX_BODY_BYTES}`,
  )
  console.error(
    `[graphql-gene-mcp] HTTP rate limit windowMs=${readPositiveInteger(process.env.GRAPHQL_GENE_MCP_RATE_LIMIT_WINDOW_MS) ?? DEFAULT_RATE_LIMIT_WINDOW_MS} maxRequests=${readInteger(process.env.GRAPHQL_GENE_MCP_RATE_LIMIT_MAX_REQUESTS) ?? DEFAULT_RATE_LIMIT_MAX_REQUESTS}`,
  )
  return handle
}

async function handleHttpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: {
    path: string
    healthPath: string
    policy: HttpPolicy
    rateLimiter: RateLimiter
  },
) {
  const expectedPath = options.path
  const healthPath = options.healthPath
  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`)
  const requestId = nextRequestId()
  const startedAt = Date.now()
  const logContext = {
    requestId,
    method: req.method ?? 'UNKNOWN',
    path: requestUrl.pathname,
    clientIp: getClientIp(req),
  }

  attachAccessLogger(res, logContext, options.policy, startedAt)

  if (requestUrl.pathname === healthPath) {
    handleHealthRequest(req, res, expectedPath, healthPath)
    return
  }

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

  const rateLimit = options.rateLimiter(logContext.clientIp)
  if (rateLimit) {
    applyRateLimitHeaders(res, rateLimit)

    if (!rateLimit.allowed) {
      writeJson(res, 429, {
        jsonrpc: '2.0',
        error: {
          code: -32029,
          message: 'Rate limit exceeded.',
        },
        id: null,
      })
      return
    }
  }

  if (options.policy.authToken && !isAuthorized(req, options.policy.authToken)) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    writeJson(res, 401, {
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Unauthorized.',
      },
      id: null,
    })
    return
  }

  let parsedBody: unknown

  try {
    parsedBody = await readJsonBody(req, options.policy.maxBodyBytes)
  }
  catch (error) {
    if (error instanceof HttpBodyTooLargeError) {
      writeJson(res, 413, {
        jsonrpc: '2.0',
        error: {
          code: -32013,
          message: `Request body too large. Max ${options.policy.maxBodyBytes} bytes.`,
        },
        id: null,
      })
      return
    }

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
    logHttpError(logContext, error)

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

function handleHealthRequest(
  req: IncomingMessage,
  res: ServerResponse,
  expectedPath: string,
  healthPath: string,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    writeJson(res, 405, {
      status: 'error',
      error: 'Method not allowed.',
    })
    return
  }

  writeJson(res, 200, {
    status: 'ok',
    service: 'graphql-gene-mcp',
    transport: 'streamable-http',
    mcpPath: expectedPath,
    healthPath,
  })
}

function normalizeMcpPath(value: string) {
  return value.startsWith('/') ? value : `/${value}`
}

async function readJsonBody(req: IncomingMessage, maxBodyBytes: number) {
  const declaredLength = readInteger(firstHeaderValue(req.headers['content-length']))
  if (typeof declaredLength === 'number' && declaredLength > maxBodyBytes) {
    throw new HttpBodyTooLargeError()
  }

  const chunks: Buffer[] = []
  let totalBytes = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += buffer.length

    if (totalBytes > maxBodyBytes) {
      throw new HttpBodyTooLargeError()
    }

    chunks.push(buffer)
  }

  const body = Buffer.concat(chunks).toString('utf8').trim()
  return body ? JSON.parse(body) : {}
}

function readPort(value?: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function readInteger(value?: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : undefined
}

function readPositiveInteger(value?: string | null) {
  const parsed = readInteger(value)
  return typeof parsed === 'number' && parsed > 0 ? parsed : undefined
}

function readBoolean(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false
  }

  return fallback
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

function resolveHttpPolicy(options: GraphqlGeneMcpHttpServerOptions): HttpPolicy {
  const authToken = options.authToken?.trim() || undefined
  const maxBodyBytes = options.maxBodyBytes && options.maxBodyBytes > 0
    ? options.maxBodyBytes
    : DEFAULT_MAX_BODY_BYTES
  const logRequests = options.logRequests ?? true

  return {
    authToken,
    maxBodyBytes,
    logRequests,
    rateLimit: {
      windowMs: options.rateLimit?.windowMs && options.rateLimit.windowMs > 0
        ? options.rateLimit.windowMs
        : DEFAULT_RATE_LIMIT_WINDOW_MS,
      maxRequests: typeof options.rateLimit?.maxRequests === 'number'
        ? options.rateLimit.maxRequests
        : DEFAULT_RATE_LIMIT_MAX_REQUESTS,
    },
  }
}

function createRateLimiter(config: HttpPolicy['rateLimit']): RateLimiter {
  if (!config || config.maxRequests <= 0) {
    return () => null
  }

  const buckets = new Map<string, { count: number, resetAt: number }>()

  return (key: string) => {
    const now = Date.now()
    const existing = buckets.get(key)

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + config.windowMs
      buckets.set(key, { count: 1, resetAt })
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: Math.max(config.maxRequests - 1, 0),
        resetAt,
      }
    }

    existing.count += 1

    if (existing.count > config.maxRequests) {
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetAt: existing.resetAt,
      }
    }

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: Math.max(config.maxRequests - existing.count, 0),
      resetAt: existing.resetAt,
    }
  }
}

function applyRateLimitHeaders(res: ServerResponse, result: RateLimitResult) {
  res.setHeader('X-RateLimit-Limit', String(result.limit))
  res.setHeader('X-RateLimit-Remaining', String(result.remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

  if (!result.allowed) {
    const retryAfterSeconds = Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1)
    res.setHeader('Retry-After', String(retryAfterSeconds))
  }
}

function isAuthorized(req: IncomingMessage, authToken: string) {
  const header = firstHeaderValue(req.headers.authorization)
  return header === `Bearer ${authToken}`
}

function attachAccessLogger(
  res: ServerResponse,
  context: {
    requestId: string
    method: string
    path: string
    clientIp: string
  },
  policy: HttpPolicy,
  startedAt: number,
) {
  if (!policy.logRequests) {
    return
  }

  res.once('finish', () => {
    const durationMs = Date.now() - startedAt
    console.error(
      `[graphql-gene-mcp] http request=${context.requestId} client=${context.clientIp} method=${context.method} path=${context.path} status=${res.statusCode} durationMs=${durationMs}`,
    )
  })
}

function logHttpError(
  context: {
    requestId: string
    method: string
    path: string
    clientIp: string
  },
  error: unknown,
) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(
    `[graphql-gene-mcp] http error request=${context.requestId} client=${context.clientIp} method=${context.method} path=${context.path} message=${sanitizeLogValue(message)}`,
  )
}

function sanitizeLogValue(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function getClientIp(req: IncomingMessage) {
  return req.socket.remoteAddress ?? 'unknown'
}

function nextRequestId() {
  requestSequence += 1
  return `http-${requestSequence}`
}

function firstHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

class HttpBodyTooLargeError extends Error {}

interface HttpPolicy {
  authToken?: string
  maxBodyBytes: number
  logRequests: boolean
  rateLimit: {
    windowMs: number
    maxRequests: number
  } | null
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
}

type RateLimiter = (key: string) => RateLimitResult | null
