import { startGraphqlGeneMcpHttpServerFromEnv } from './http.js'

startGraphqlGeneMcpHttpServerFromEnv().catch((error) => {
  console.error('[graphql-gene-mcp] failed to start streamable HTTP server')
  console.error(error)
  process.exit(1)
})
