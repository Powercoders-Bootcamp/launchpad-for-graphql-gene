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
  it('serves a health endpoint for deployment checks', async () => {
    const response = await fetch(handle!.healthUrl)
    const payload = await response.json()

    expect(response.ok).toBe(true)
    expect(payload.status).toBe('ok')
    expect(payload.mcpPath).toBe('/mcp')
    expect(payload.healthPath).toBe('/healthz')
  })

  it('supports bearer auth for HTTP clients when configured', async () => {
    const securedHandle = await startGraphqlGeneMcpHttpServer({
      host: '127.0.0.1',
      port: 0,
      path: '/mcp',
      authToken: 'test-token',
      logRequests: false,
    })

    const securedClient = new Client({
      name: 'graphql-gene-mcp-http-auth-test',
      version: '1.0.0',
    })
    const securedTransport = new StreamableHTTPClientTransport(new URL(securedHandle.url), {
      requestInit: {
        headers: {
          Authorization: 'Bearer test-token',
        },
      },
    })

    try {
      await securedClient.connect(securedTransport)
      const result = await securedClient.listTools()
      expect(result.tools.some(tool => tool.name === 'search_knowledge')).toBe(true)
    }
    finally {
      await Promise.allSettled([
        securedTransport.close(),
        securedClient.close(),
      ])
      await stopGraphqlGeneMcpHttpServer(securedHandle.server)
    }
  })

  it('rejects unauthorized HTTP requests when bearer auth is enabled', async () => {
    const securedHandle = await startGraphqlGeneMcpHttpServer({
      host: '127.0.0.1',
      port: 0,
      path: '/mcp',
      authToken: 'test-token',
      logRequests: false,
    })

    try {
      const response = await fetch(securedHandle.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      })
      const payload = await response.json()

      expect(response.status).toBe(401)
      expect(payload.error.message).toBe('Unauthorized.')
    }
    finally {
      await stopGraphqlGeneMcpHttpServer(securedHandle.server)
    }
  })

  it('applies request body size limits before MCP execution', async () => {
    const limitedHandle = await startGraphqlGeneMcpHttpServer({
      host: '127.0.0.1',
      port: 0,
      path: '/mcp',
      maxBodyBytes: 32,
      logRequests: false,
    })

    try {
      const response = await fetch(limitedHandle.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'x'.repeat(200),
        }),
      })
      const payload = await response.json()

      expect(response.status).toBe(413)
      expect(payload.error.message).toContain('Request body too large')
    }
    finally {
      await stopGraphqlGeneMcpHttpServer(limitedHandle.server)
    }
  })

  it('applies rate limits before MCP execution', async () => {
    const limitedHandle = await startGraphqlGeneMcpHttpServer({
      host: '127.0.0.1',
      port: 0,
      path: '/mcp',
      rateLimit: {
        windowMs: 60_000,
        maxRequests: 1,
      },
      logRequests: false,
    })

    try {
      const firstResponse = await fetch(limitedHandle.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{',
      })
      expect(firstResponse.status).toBe(400)

      const secondResponse = await fetch(limitedHandle.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{',
      })
      const payload = await secondResponse.json()

      expect(secondResponse.status).toBe(429)
      expect(secondResponse.headers.get('retry-after')).toBeTruthy()
      expect(payload.error.message).toBe('Rate limit exceeded.')
    }
    finally {
      await stopGraphqlGeneMcpHttpServer(limitedHandle.server)
    }
  })

  it('lists MCP tools through the official HTTP client transport', async () => {
    const result = await client!.listTools()
    const toolNames = result.tools.map(tool => tool.name)

    expect(toolNames).toContain('search_knowledge')
    expect(toolNames).toContain('plan_graphql_gene_integration')
    expect(toolNames).toContain('classify_developer_goal')
    expect(toolNames).toContain('plan_developer_task')
    expect(toolNames).toContain('diagnose_developer_issue')
    expect(toolNames).toContain('diagnose_graphql_gene_issue')
    expect(toolNames).toContain('validate_playground_scenario')
  })

  it('lists and reads MCP resources through HTTP', async () => {
    const resources = await client!.listResources()
    expect(resources.resources.some(resource => resource.uri === 'knowledge://overview')).toBe(true)
    expect(resources.resources.some(resource => resource.uri === 'plugins://catalog')).toBe(true)
    expect(resources.resources.some(resource => resource.uri === 'recipes://catalog')).toBe(true)
    expect(resources.resources.some(resource => resource.uri === 'troubleshooting://catalog')).toBe(true)
    expect(resources.resources.some(resource => resource.uri === 'developer-tasks://overview')).toBe(true)

    const readResult = await client!.readResource({ uri: 'docs://docs/guides/directives' })
    const firstContent = readResult.contents[0]

    expect(firstContent).toBeDefined()
    expect('text' in firstContent && firstContent.text.includes('directive-middleware')).toBe(true)
  })

  it('reads curated recipe and troubleshooting resources through HTTP', async () => {
    const recipeResult = await client!.readResource({ uri: 'recipes://recipe/polymorphic-content-blocks' })
    const recipeContent = recipeResult.contents[0]
    expect(recipeContent).toBeDefined()
    expect('text' in recipeContent && recipeContent.text.includes('polymorphic-content-blocks')).toBe(true)

    const troubleshootingResult = await client!.readResource({
      uri: 'troubleshooting://issue/directive-not-printed-in-sdl',
    })
    const troubleshootingContent = troubleshootingResult.contents[0]
    expect(troubleshootingContent).toBeDefined()
    expect('text' in troubleshootingContent && troubleshootingContent.text.includes('directive-not-printed-in-sdl')).toBe(true)
  })

  it('reads developer task resources through HTTP', async () => {
    const taskResult = await client!.readResource({ uri: 'developer-tasks://task/optimize-lookahead-loading' })
    const taskContent = taskResult.contents[0]

    expect(taskContent).toBeDefined()
    expect('text' in taskContent && taskContent.text.includes('optimize-lookahead-loading')).toBe(true)
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

  it('supports curated search kinds over HTTP', async () => {
    const result = await client!.callTool({
      name: 'search_knowledge',
      arguments: {
        query: 'sequelize',
        kind: 'plugin',
        limit: 2,
      },
    })

    const textContent = result.content.find(item => item.type === 'text')
    expect(textContent).toBeDefined()

    const payload = JSON.parse(textContent!.text)
    expect(payload.results[0].id).toBe('plugin:sequelize')
  })
})
