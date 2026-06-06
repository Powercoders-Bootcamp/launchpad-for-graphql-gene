import { QueryRequestSchema } from '~/types'
import { MAX_VARIABLES_BYTES } from '~/server/utils/playground/limits'

export default defineEventHandler(async (event) => {
  const start = Date.now()

  const body = await readBody(event)
  const parsed = QueryRequestSchema.safeParse(body)

  if (!parsed.success) {
    const res = errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
    logRequest({ requestId: res.requestId, scenario: body?.scenario ?? 'query', exampleId: body?.input?.exampleId ?? '', durationMs: Date.now() - start, status: 'error', errorCode: 'VALIDATION_ERROR' })
    return res
  }

  const { scenario, input } = parsed.data

  if (input.variables) {
    const variablesSize = Buffer.byteLength(JSON.stringify(input.variables))
    if (variablesSize > MAX_VARIABLES_BYTES) {
      const res = errorResponse('VALIDATION_ERROR', 'The variables payload is too large.')
      logRequest({ requestId: res.requestId, scenario, exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'VALIDATION_ERROR' })
      return res
    }
  }

  const example = getExample(scenario, input.exampleId)
  if (!example) {
    const res = errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
    logRequest({ requestId: res.requestId, scenario, exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'UNKNOWN_EXAMPLE' })
    return res
  }

  try {
    const result = await runQuery({
      scenario,
      exampleId: input.exampleId,
      query: input.query,
      variables: input.variables,
    })
    const res = okResponse({
      scenario,
      result: { data: result.data },
      execution: {
        includeGraph: result.includeGraph,
        sql: result.sql,
        notes: result.notes,
      },
      diagnostics: result.diagnostics,
    })
    logRequest({ requestId: res.requestId, scenario, exampleId: input.exampleId, durationMs: Date.now() - start, status: 'ok' })
    return res
  }
  catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT') {
      const res = errorResponse('EXECUTION_TIMEOUT', 'Query execution exceeded the time limit.')
      logRequest({ requestId: res.requestId, scenario, exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'EXECUTION_TIMEOUT' })
      return res
    }
    const res = errorResponse('EXECUTION_ERROR', 'Query execution failed. Check the diagnostics.')
    logRequest({ requestId: res.requestId, scenario, exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'EXECUTION_ERROR' })
    return res
  }
})
