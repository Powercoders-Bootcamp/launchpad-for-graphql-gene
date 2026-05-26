import { QueryRequestSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = QueryRequestSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
  }

  const { scenario, input } = parsed.data
  const example = getExample(scenario, input.exampleId)
  if (!example) {
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
  }

  try {
    const result = await runQuery({
      scenario,
      exampleId: input.exampleId,
      query: input.query,
      variables: input.variables,
    })
    return okResponse({
      scenario,
      result: { data: result.data },
      execution: {
        includeGraph: result.includeGraph,
        sql: result.sql,
        notes: result.notes,
      },
      diagnostics: result.diagnostics,
    })
  }
  catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT')
      return errorResponse('EXECUTION_TIMEOUT', 'Query execution exceeded the time limit.')
    return errorResponse('EXECUTION_ERROR', 'Query execution failed. Check the diagnostics.')
  }
})
