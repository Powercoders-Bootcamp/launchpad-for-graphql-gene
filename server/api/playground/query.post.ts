import { QueryRequestSchema } from '~/types'
import { MAX_VARIABLES_BYTES } from '~/server/utils/playground/limits'
import { runQuery } from '~/server/utils/playground/engine'
import { getRequestId, logPlaygroundRequest } from '~/server/utils/playground/logging'
import { getExample } from '~/server/utils/playground/registry'
import { errorResponse, okResponse } from '~/server/utils/playground/response'

export default defineEventHandler(async (event) => {
  const requestId = getRequestId(event)
  const body = await readBody(event)
  const parsed = QueryRequestSchema.safeParse(body)

  if (!parsed.success) {
    setResponseStatus(event, 400)
    logPlaygroundRequest(event, {
      route: '/api/playground/query',
      scenario: body?.scenario,
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

  const { scenario, input } = parsed.data

  if (input.variables) {
    const variablesSize = Buffer.byteLength(JSON.stringify(input.variables))
    if (variablesSize > MAX_VARIABLES_BYTES) {
      setResponseStatus(event, 413)
      logPlaygroundRequest(event, {
        route: '/api/playground/query',
        scenario,
        exampleId: input.exampleId,
        status: 'error',
        errorCode: 'VALIDATION_ERROR',
      })
      return errorResponse('VALIDATION_ERROR', 'The variables payload is too large.', undefined, requestId)
    }
  }

  const example = getExample(scenario, input.exampleId)
  if (!example) {
    setResponseStatus(event, 404)
    logPlaygroundRequest(event, {
      route: '/api/playground/query',
      scenario,
      exampleId: input.exampleId,
      status: 'error',
      errorCode: 'UNKNOWN_EXAMPLE',
    })
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`, undefined, requestId)
  }

  try {
    const result = await runQuery({
      scenario,
      exampleId: input.exampleId,
      query: input.query,
      variables: input.variables,
    })
    const response = okResponse({
      scenario,
      result: { data: result.data },
      execution: {
        includeGraph: result.includeGraph,
        sql: result.sql,
        notes: result.notes,
      },
      diagnostics: result.diagnostics,
    }, requestId)

    logPlaygroundRequest(event, {
      route: '/api/playground/query',
      scenario,
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
      route: '/api/playground/query',
      scenario,
      exampleId: input.exampleId,
      status: 'error',
      errorCode,
    })

    if (errorCode === 'EXECUTION_TIMEOUT') {
      setResponseStatus(event, 504)
      return errorResponse('EXECUTION_TIMEOUT', 'Query execution exceeded the time limit.', undefined, requestId)
    }

    setResponseStatus(event, 500)
    return errorResponse('EXECUTION_ERROR', 'Query execution failed. Check the diagnostics.', undefined, requestId)
  }
})
