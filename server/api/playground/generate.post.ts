import { GenerateRequestSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = GenerateRequestSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
  }

  const { input } = parsed.data
  const example = getExample('model-to-schema', input.exampleId)
  if (!example) {
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
  }

  if (input.modelEdits) {
    const disallowed = Object.keys(input.modelEdits).filter(k => !example.editableFields.includes(k))
    if (disallowed.length) {
      return errorResponse('VALIDATION_ERROR', `Fields not editable: ${disallowed.join(', ')}`)
    }
  }

  try {
    const result = await runGenerate({
      exampleId: input.exampleId,
      modelEdits: input.modelEdits,
      options: input.options,
    })
    return okResponse({
      scenario: 'model-to-schema' as const,
      schema: { sdl: result.sdl, typeSummary: result.typeSummary },
      diagnostics: result.diagnostics,
    })
  }
  catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT')
      return errorResponse('EXECUTION_TIMEOUT', 'Schema generation exceeded the time limit.')
    return errorResponse('EXECUTION_ERROR', 'Schema generation failed. Check the diagnostics.')
  }
})
