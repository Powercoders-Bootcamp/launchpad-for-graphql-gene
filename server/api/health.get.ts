import { getRequestId, logPlaygroundRequest } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'

export default defineEventHandler((event) => {
  const response = okResponse({
    health: { status: 'ok' as const },
  }, getRequestId(event))

  logPlaygroundRequest(event, {
    route: '/api/health',
    status: 'ok',
  })

  return response
})
