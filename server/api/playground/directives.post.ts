import { DirectivesRequestSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const start = Date.now()

  const body = await readBody(event)
  const parsed = DirectivesRequestSchema.safeParse(body)

  if (!parsed.success) {
    const res = errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
    logRequest({ requestId: res.requestId, scenario: 'directive-middleware', exampleId: body?.input?.exampleId ?? '', durationMs: Date.now() - start, status: 'error', errorCode: 'VALIDATION_ERROR' })
    return res
  }

  const { input } = parsed.data
  const example = getExample('directive-middleware', input.exampleId)
  if (!example) {
    const res = errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
    logRequest({ requestId: res.requestId, scenario: 'directive-middleware', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'UNKNOWN_EXAMPLE' })
    return res
  }

  try {
    const result = await runDirective({
      exampleId: input.exampleId,
      directiveMode: input.directiveMode,
    })
    const res = okResponse({
      scenario: 'directive-middleware' as const,
      directive: result.directive,
      schema: { sdlExcerpt: result.sdlExcerpt },
      diagnostics: result.diagnostics,
    })
    logRequest({ requestId: res.requestId, scenario: 'directive-middleware', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'ok' })
    return res
  }
  catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT') {
      const res = errorResponse('EXECUTION_TIMEOUT', 'Directive scenario exceeded the time limit.')
      logRequest({ requestId: res.requestId, scenario: 'directive-middleware', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'EXECUTION_TIMEOUT' })
      return res
    }
    const res = errorResponse('EXECUTION_ERROR', 'Directive scenario failed. Check the diagnostics.')
    logRequest({ requestId: res.requestId, scenario: 'directive-middleware', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'EXECUTION_ERROR' })
    return res
  }
})
