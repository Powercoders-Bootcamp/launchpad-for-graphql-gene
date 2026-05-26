export default defineEventHandler(() => {
  return okResponse({ examples: getAllExamples() })
})
