import { getQuery } from 'h3'
import { getRequestId } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { listKnowledgeExamples } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const scenario = asOptionalString(query.scenario)
  const executionMode = asOptionalString(query.executionMode)
  const examples = listKnowledgeExamples({ scenario, executionMode })

  logKnowledgeRequest(event, {
    route: '/api/knowledge/examples',
    status: 'ok',
    scenario,
  })

  return okResponse({ examples }, getRequestId(event))
})

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}
