import { DirectivesRequestSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = DirectivesRequestSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
  }

  const { input } = parsed.data
  const example = getExample('directive-middleware', input.exampleId)
  if (!example) {
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
  }

  try {
    const result = await runDirective({
      exampleId: input.exampleId,
      directiveMode: input.directiveMode,
    })
    return okResponse({
      scenario: 'directive-middleware' as const,
      directive: result.directive,
      schema: { sdlExcerpt: result.sdlExcerpt },
      diagnostics: result.diagnostics,
    })
  }
  catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT')
      return errorResponse('EXECUTION_TIMEOUT', 'Directive scenario exceeded the time limit.')
    return errorResponse('EXECUTION_ERROR', 'Directive scenario failed. Check the diagnostics.')
  }
})
