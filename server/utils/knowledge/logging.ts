import type { H3Event } from 'h3'
import { getOrCreateRequestId, getOrCreateRequestStartedAt } from '~/server/utils/request-context'

export function logKnowledgeRequest(event: H3Event, payload: {
  route: string
  status: 'ok' | 'error'
  errorCode?: string
  query?: string | null
  kind?: string | null
  section?: string | null
  scenario?: string | null
}) {
  const startedAt = getOrCreateRequestStartedAt(event)

  console.info(JSON.stringify({
    scope: 'knowledge-api',
    requestId: getOrCreateRequestId(event),
    route: payload.route,
    query: payload.query ?? null,
    kind: payload.kind ?? null,
    section: payload.section ?? null,
    scenario: payload.scenario ?? null,
    status: payload.status,
    errorCode: payload.errorCode ?? null,
    durationMs: Date.now() - startedAt,
  }))
}
