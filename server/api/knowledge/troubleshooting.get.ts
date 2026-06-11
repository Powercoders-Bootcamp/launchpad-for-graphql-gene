import { getQuery } from 'h3'
import { getRequestId } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { listKnowledgeTroubleshooting } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const scenario = asOptionalString(query.scenario)
  const stage = asOptionalString(query.stage)
  const troubleshooting = listKnowledgeTroubleshooting({ scenario, stage })

  logKnowledgeRequest(event, {
    route: '/api/knowledge/troubleshooting',
    status: 'ok',
    scenario,
  })

  return okResponse({ troubleshooting }, getRequestId(event))
})

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}
