import { GenerateRequestSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const start = Date.now()

  const body = await readBody(event)
  const parsed = GenerateRequestSchema.safeParse(body)

  if (!parsed.success) {
    const res = errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
    logRequest({ requestId: res.requestId, scenario: 'model-to-schema', exampleId: body?.input?.exampleId ?? '', durationMs: Date.now() - start, status: 'error', errorCode: 'VALIDATION_ERROR' })
    return res
  }

  const { input } = parsed.data
  const example = getExample('model-to-schema', input.exampleId)
  if (!example) {
    const res = errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
    logRequest({ requestId: res.requestId, scenario: 'model-to-schema', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'UNKNOWN_EXAMPLE' })
    return res
  }

  if (input.modelEdits) {
    const disallowed = Object.keys(input.modelEdits).filter(k => !example.editableFields.includes(k))
    if (disallowed.length) {
      const res = errorResponse('VALIDATION_ERROR', `Fields not editable: ${disallowed.join(', ')}`)
      logRequest({ requestId: res.requestId, scenario: 'model-to-schema', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'VALIDATION_ERROR' })
      return res
    }
  }

  try {
    const result = await runGenerate({
      exampleId: input.exampleId,
      modelEdits: input.modelEdits,
      options: input.options,
    })
    const res = okResponse({
      scenario: 'model-to-schema' as const,
      schema: { sdl: result.sdl, typeSummary: result.typeSummary },
      diagnostics: result.diagnostics,
    })
    logRequest({ requestId: res.requestId, scenario: 'model-to-schema', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'ok' })
    return res
  }
  catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT') {
      const res = errorResponse('EXECUTION_TIMEOUT', 'Schema generation exceeded the time limit.')
      logRequest({ requestId: res.requestId, scenario: 'model-to-schema', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'EXECUTION_TIMEOUT' })
      return res
    }
    const res = errorResponse('EXECUTION_ERROR', 'Schema generation failed. Check the diagnostics.')
    logRequest({ requestId: res.requestId, scenario: 'model-to-schema', exampleId: input.exampleId, durationMs: Date.now() - start, status: 'error', errorCode: 'EXECUTION_ERROR' })
    return res
  }
})
