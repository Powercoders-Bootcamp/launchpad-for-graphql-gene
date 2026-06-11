import { getRequestId } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'
import { logKnowledgeRequest } from '~/server/utils/knowledge/logging'
import { getKnowledgeCatalog } from '~/server/utils/knowledge/service'

export default defineEventHandler((event) => {
  const knowledge = getKnowledgeCatalog()

  const response = okResponse({ knowledge }, getRequestId(event))

  logKnowledgeRequest(event, {
    route: '/api/knowledge/catalog',
    status: 'ok',
  })

  return response
})
