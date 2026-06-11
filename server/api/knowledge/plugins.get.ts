import { getQuery } from 'h3'
import { getRequestId } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { listKnowledgePlugins } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const scenario = asOptionalString(query.scenario)
  const orm = asOptionalString(query.orm)
  const plugins = listKnowledgePlugins({ scenario, orm })

  logKnowledgeRequest(event, {
    route: '/api/knowledge/plugins',
    status: 'ok',
    scenario,
  })

  return okResponse({ plugins }, getRequestId(event))
})

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}
