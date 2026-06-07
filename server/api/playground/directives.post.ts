import { DirectivesRequestSchema } from '~/types'
import { runDirective } from '~/server/utils/playground/engine'
import { getRequestId, logPlaygroundRequest } from '~/server/utils/playground/logging'
import { getExample } from '~/server/utils/playground/registry'
import { errorResponse, okResponse } from '~/server/utils/playground/response'

export default defineEventHandler(async (event) => {
  const requestId = getRequestId(event)
  const body = await readBody(event)
  const parsed = DirectivesRequestSchema.safeParse(body)

  if (!parsed.success) {
    setResponseStatus(event, 400)
    logPlaygroundRequest(event, {
      route: '/api/playground/directives',
      scenario: 'directive-middleware',
      exampleId: body?.input?.exampleId,
      status: 'error',
      errorCode: 'VALIDATION_ERROR',
    })
    return errorResponse(
      'VALIDATION_ERROR',
      'The request payload is not valid.',
      parsed.error.issues.map(issue => issue.message),
      requestId,
    )
  }

  const { input } = parsed.data
  const example = getExample('directive-middleware', input.exampleId)
  if (!example) {
    setResponseStatus(event, 404)
    logPlaygroundRequest(event, {
      route: '/api/playground/directives',
      scenario: 'directive-middleware',
      exampleId: input.exampleId,
      status: 'error',
      errorCode: 'UNKNOWN_EXAMPLE',
    })
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`, undefined, requestId)
  }

  try {
    const result = await runDirective({
      exampleId: input.exampleId,
      directiveMode: input.directiveMode,
    })
    const response = okResponse({
      scenario: 'directive-middleware' as const,
      directive: result.directive,
      schema: { sdlExcerpt: result.sdlExcerpt },
      diagnostics: result.diagnostics,
    }, requestId)

    logPlaygroundRequest(event, {
      route: '/api/playground/directives',
      scenario: 'directive-middleware',
      exampleId: input.exampleId,
      status: 'ok',
    })

    return response
  }
  catch (error: unknown) {
    const errorCode = (error as Error).message === 'TIMEOUT'
      ? 'EXECUTION_TIMEOUT'
      : 'EXECUTION_ERROR'

    logPlaygroundRequest(event, {
      route: '/api/playground/directives',
      scenario: 'directive-middleware',
      exampleId: input.exampleId,
      status: 'error',
      errorCode,
    })

    if (errorCode === 'EXECUTION_TIMEOUT') {
      setResponseStatus(event, 504)
      return errorResponse('EXECUTION_TIMEOUT', 'Directive scenario exceeded the time limit.', undefined, requestId)
    }

    setResponseStatus(event, 500)
    return errorResponse('EXECUTION_ERROR', 'Directive scenario failed. Check the diagnostics.', undefined, requestId)
  }
})
