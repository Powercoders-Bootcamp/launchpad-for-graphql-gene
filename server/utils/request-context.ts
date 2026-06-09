import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'

interface ApiEventContext {
  playgroundRequestId?: string
  playgroundStartedAt?: number
  playgroundIp?: string
}

function getApiContext(event: H3Event): ApiEventContext {
  return event.context as ApiEventContext
}

export function getOrCreateRequestId(event: H3Event) {
  const context = getApiContext(event)
  context.playgroundRequestId ??= randomUUID()
  return context.playgroundRequestId
}

export function getOrCreateRequestStartedAt(event: H3Event) {
  const context = getApiContext(event)
  context.playgroundStartedAt ??= Date.now()
  return context.playgroundStartedAt
}
