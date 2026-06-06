import { WINDOW_MS, MAX_REQUESTS_PER_WINDOW, MAX_BODY_BYTES } from '~/server/utils/playground/limits'

interface RateEntry {
  count: number
  windowStart: number
}

const ipMap = new Map<string, RateEntry>()

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/playground/')) return

  // Body size check via Content-Length header
  const contentLength = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    setResponseStatus(event, 413)
    return { status: 'error', error: { message: 'Request body too large.' } }
  }

  // Only rate-limit mutating requests
  if (event.method !== 'POST') return

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now })
    return
  }

  entry.count++

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    setResponseStatus(event, 429)
    return { status: 'error', error: { message: 'Too many requests. Please wait a moment and try again.' } }
  }
})
