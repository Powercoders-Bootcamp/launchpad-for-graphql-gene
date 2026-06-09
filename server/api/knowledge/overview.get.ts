import { getRequestId } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { getKnowledgeOverview } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const response = okResponse({
    overview: getKnowledgeOverview(),
  }, getRequestId(event))

  logKnowledgeRequest(event, {
    route: '/api/knowledge/overview',
    status: 'ok',
  })

  return response
})
