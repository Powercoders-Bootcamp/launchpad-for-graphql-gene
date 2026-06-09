import { getQuery } from 'h3'
import { getRequestId } from '~/server/utils/playground/logging'
import { errorResponse, okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { searchKnowledge } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const searchQuery = asOptionalString(query.q)
  const kind = asOptionalString(query.kind)
  const section = asOptionalString(query.section)
  const scenario = asOptionalString(query.scenario)
  const limit = normalizeLimit(query.limit)
  const requestId = getRequestId(event)

  if (!searchQuery || searchQuery.length < 2) {
    setResponseStatus(event, 400)
    logKnowledgeRequest(event, {
      route: '/api/knowledge/search',
      status: 'error',
      errorCode: 'VALIDATION_ERROR',
      query: searchQuery ?? null,
      kind,
      section,
      scenario,
    })
    return errorResponse(
      'VALIDATION_ERROR',
      'The search query must contain at least 2 characters.',
      undefined,
      requestId,
    )
  }

  const results = searchKnowledge({
    query: searchQuery,
    kind: kind === 'doc' || kind === 'example' ? kind : undefined,
    section,
    scenario,
    limit,
  })

  logKnowledgeRequest(event, {
    route: '/api/knowledge/search',
    status: 'ok',
    query: searchQuery,
    kind,
    section,
    scenario,
  })

  return okResponse({
    query: searchQuery,
    filters: {
      kind: kind ?? null,
      section: section ?? null,
      scenario: scenario ?? null,
      limit,
    },
    results,
  }, requestId)
})

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeLimit(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 10
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 25)
}
