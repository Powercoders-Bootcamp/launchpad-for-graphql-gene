import { getQuery } from 'h3'
import { getRequestId } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { listKnowledgeDocs } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const section = asOptionalString(query.section)
  const scenario = asOptionalString(query.scenario)
  const status = asOptionalString(query.status)
  const docs = listKnowledgeDocs({ section, scenario, status })

  logKnowledgeRequest(event, {
    route: '/api/knowledge/docs',
    status: 'ok',
    section,
    scenario,
  })

  return okResponse({ docs }, getRequestId(event))
})

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}
