import { randomUUID } from 'node:crypto'
import { WINDOW_MS, MAX_REQUESTS_PER_WINDOW, MAX_BODY_BYTES } from '~/server/utils/playground/limits'
import { errorResponse } from '~/server/utils/playground/response'

interface RateEntry {
  count: number
  windowStart: number
}

interface PlaygroundEventContext {
  playgroundRequestId?: string
  playgroundStartedAt?: number
  playgroundIp?: string
}

const ipMap = new Map<string, RateEntry>()

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/playground/') && path !== '/api/health') return

  const context = event.context as PlaygroundEventContext
  context.playgroundRequestId ??= randomUUID()
  context.playgroundStartedAt ??= Date.now()
  context.playgroundIp = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  if (!path.startsWith('/api/playground/')) return

  // Body size check via Content-Length header
  const contentLength = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    setResponseStatus(event, 413)
    return errorResponse(
      'VALIDATION_ERROR',
      'Request body is too large for the playground API.',
      undefined,
      context.playgroundRequestId,
    )
  }

  // Only rate-limit mutating requests
  if (event.method !== 'POST') return

  const ip = context.playgroundIp ?? 'unknown'
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now })
    return
  }

  entry.count++

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    setResponseStatus(event, 429)
    return errorResponse(
      'EXECUTION_ERROR',
      'Rate limit exceeded. Please wait and try again.',
      undefined,
      context.playgroundRequestId,
    )
  }
})
