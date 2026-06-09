import { connectGraphqlGeneMcpServer } from './server.js'

async function main() {
  await connectGraphqlGeneMcpServer()
  console.error('[graphql-gene-mcp] connected over stdio')
}

main().catch((error) => {
  console.error('[graphql-gene-mcp] failed to start')
  console.error(error)
  process.exit(1)
})
