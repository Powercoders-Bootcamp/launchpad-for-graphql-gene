import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { startGraphqlGeneMcpHttpServer, stopGraphqlGeneMcpHttpServer, type GraphqlGeneMcpHttpServerHandle } from '../mcp-server/src/http'

let handle: GraphqlGeneMcpHttpServerHandle | null = null
let client: Client | null = null
let transport: StreamableHTTPClientTransport | null = null

beforeAll(async () => {
  handle = await startGraphqlGeneMcpHttpServer({
    host: '127.0.0.1',
    port: 0,
    path: '/mcp',
  })

  client = new Client({
    name: 'graphql-gene-mcp-http-test',
    version: '1.0.0',
  })

  transport = new StreamableHTTPClientTransport(new URL(handle.url))
  await client.connect(transport)
}, 30000)

afterAll(async () => {
  await Promise.allSettled([
    transport?.close() ?? Promise.resolve(),
    client?.close() ?? Promise.resolve(),
  ])

  if (handle) {
    await stopGraphqlGeneMcpHttpServer(handle.server)
  }
})

describe('mcp-server streamable HTTP wrapper', () => {
  it('lists MCP tools through the official HTTP client transport', async () => {
    const result = await client!.listTools()
    const toolNames = result.tools.map(tool => tool.name)

    expect(toolNames).toContain('search_knowledge')
    expect(toolNames).toContain('plan_graphql_gene_integration')
    expect(toolNames).toContain('diagnose_graphql_gene_issue')
  })

  it('lists and reads MCP resources through HTTP', async () => {
    const resources = await client!.listResources()
    expect(resources.resources.some(resource => resource.uri === 'knowledge://overview')).toBe(true)

    const readResult = await client!.readResource({ uri: 'docs://docs/guides/directives' })
    const firstContent = readResult.contents[0]

    expect(firstContent).toBeDefined()
    expect('text' in firstContent && firstContent.text.includes('directive-middleware')).toBe(true)
  })

  it('calls a structured knowledge tool over HTTP', async () => {
    const result = await client!.callTool({
      name: 'search_knowledge',
      arguments: {
        query: 'directive',
        limit: 3,
      },
    })

    const textContent = result.content.find(item => item.type === 'text')
    expect(textContent).toBeDefined()
    expect(result.structuredContent).toBeDefined()

    const payload = JSON.parse(textContent!.text)
    expect(payload.results[0].id).toBe('doc:/docs/guides/directives')
    expect((result.structuredContent as { results: Array<{ id: string }> }).results[0].id).toBe(
      'doc:/docs/guides/directives',
    )
  })
})
