import { GenerateRequestSchema } from '~/types'
import { runGenerate } from '~/server/utils/playground/engine'
import { getRequestId, logPlaygroundRequest } from '~/server/utils/playground/logging'
import { getExample } from '~/server/utils/playground/registry'
import { errorResponse, okResponse } from '~/server/utils/playground/response'

export default defineEventHandler(async (event) => {
  const requestId = getRequestId(event)
  const body = await readBody(event)
  const parsed = GenerateRequestSchema.safeParse(body)

  if (!parsed.success) {
    setResponseStatus(event, 400)
    logPlaygroundRequest(event, {
      route: '/api/playground/generate',
      scenario: 'model-to-schema',
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
  const example = getExample('model-to-schema', input.exampleId)
  if (!example) {
    setResponseStatus(event, 404)
    logPlaygroundRequest(event, {
      route: '/api/playground/generate',
      scenario: 'model-to-schema',
      exampleId: input.exampleId,
      status: 'error',
      errorCode: 'UNKNOWN_EXAMPLE',
    })
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`, undefined, requestId)
  }

  if (input.modelEdits) {
    const disallowed = Object.keys(input.modelEdits).filter(field => !example.editableFields.includes(field))
    if (disallowed.length) {
      setResponseStatus(event, 400)
      logPlaygroundRequest(event, {
        route: '/api/playground/generate',
        scenario: 'model-to-schema',
        exampleId: input.exampleId,
        status: 'error',
        errorCode: 'VALIDATION_ERROR',
      })
      return errorResponse('VALIDATION_ERROR', `Fields not editable: ${disallowed.join(', ')}`, undefined, requestId)
    }
  }

  try {
    const result = await runGenerate({
      exampleId: input.exampleId,
      modelEdits: input.modelEdits,
      options: input.options,
    })
    const response = okResponse({
      scenario: 'model-to-schema' as const,
      schema: { sdl: result.sdl, typeSummary: result.typeSummary },
      diagnostics: result.diagnostics,
    }, requestId)

    logPlaygroundRequest(event, {
      route: '/api/playground/generate',
      scenario: 'model-to-schema',
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
      route: '/api/playground/generate',
      scenario: 'model-to-schema',
      exampleId: input.exampleId,
      status: 'error',
      errorCode,
    })

    if (errorCode === 'EXECUTION_TIMEOUT') {
      setResponseStatus(event, 504)
      return errorResponse('EXECUTION_TIMEOUT', 'Schema generation exceeded the time limit.', undefined, requestId)
    }

    setResponseStatus(event, 500)
    return errorResponse('EXECUTION_ERROR', 'Schema generation failed. Check the diagnostics.', undefined, requestId)
  }
})
