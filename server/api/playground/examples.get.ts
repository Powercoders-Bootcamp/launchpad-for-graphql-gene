export default defineEventHandler(() => {
  const res = okResponse({ examples: getAllExamples() })
  logRequest({ requestId: res.requestId, scenario: 'examples', exampleId: '', durationMs: 0, status: 'ok' })
  return res
})
