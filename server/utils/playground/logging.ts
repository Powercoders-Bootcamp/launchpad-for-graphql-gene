import type { H3Event } from 'h3'
import { getOrCreateRequestId, getOrCreateRequestStartedAt } from '~/server/utils/request-context'

interface PlaygroundEventContext {
  playgroundRequestId?: string
  playgroundStartedAt?: number
  playgroundIp?: string
}

function getPlaygroundContext(event: H3Event): PlaygroundEventContext {
  return event.context as PlaygroundEventContext
}

export function getRequestId(event: H3Event) {
  return getOrCreateRequestId(event)
}

export function logPlaygroundRequest(event: H3Event, payload: {
  route: string
  scenario?: string
  exampleId?: string
  status: 'ok' | 'error'
  errorCode?: string
}) {
  const context = getPlaygroundContext(event)
  const startedAt = Number(context.playgroundStartedAt ?? getOrCreateRequestStartedAt(event))

  console.info(JSON.stringify({
    scope: 'playground-api',
    requestId: getOrCreateRequestId(event),
    route: payload.route,
    scenario: payload.scenario ?? null,
    exampleId: payload.exampleId ?? null,
    status: payload.status,
    errorCode: payload.errorCode ?? null,
    durationMs: Date.now() - startedAt,
  }))
}
