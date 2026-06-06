import { getRequestId, logPlaygroundRequest } from '~/server/utils/playground/logging'
import { getAllExamples } from '~/server/utils/playground/registry'
import { okResponse } from '~/server/utils/playground/response'

export default defineEventHandler((event) => {
  const response = okResponse({ examples: getAllExamples() }, getRequestId(event))

  logPlaygroundRequest(event, {
    route: '/api/playground/examples',
    status: 'ok',
  })

  return response
})
