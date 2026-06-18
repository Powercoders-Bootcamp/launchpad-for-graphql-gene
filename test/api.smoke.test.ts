import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')
const localPort = 3174
const BASE = process.env.TEST_BASE_URL || `http://127.0.0.1:${localPort}`

let serverProcess: ChildProcessWithoutNullStreams | null = null
let serverLogs = ''

async function api(pathname: string, options?: RequestInit) {
  const response = await fetch(`${BASE}${pathname}`, options)
  return response.json()
}

async function post(pathname: string, body: unknown) {
  return api(pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeAll(async () => {
  if (process.env.TEST_BASE_URL) {
    const response = await fetch(`${BASE}/api/health`).catch(() => null)
    if (!response?.ok) {
      throw new Error(`Dev server not reachable at ${BASE}`)
    }
    return
  }

  serverProcess = spawn(
    process.execPath,
    ['node_modules/@nuxt/cli/bin/nuxi.mjs', 'dev', '--host', '127.0.0.1', '--port', String(localPort)],
    {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        NUXT_IGNORE_LOCK: '1',
        NUXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  serverProcess.stdout.on('data', (chunk) => {
    serverLogs += chunk.toString()
  })
  serverProcess.stderr.on('data', (chunk) => {
    serverLogs += chunk.toString()
  })

  await waitForServerReady()
}, 60000)

afterAll(async () => {
  if (!serverProcess || serverProcess.killed) {
    return
  }

  serverProcess.kill('SIGTERM')
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      serverProcess?.kill('SIGKILL')
      resolve(undefined)
    }, 8000)

    serverProcess?.once('exit', () => {
      clearTimeout(timeout)
      resolve(undefined)
    })
  })
})

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await api('/api/health')
    expect(res.status).toBe('ok')
    expect(res.health.status).toBe('ok')
    expect(res.requestId).toBeTypeOf('string')
  })
})

describe('GET /api/playground/examples', () => {
  it('returns envelope with examples array', async () => {
    const res = await api('/api/playground/examples')
    expect(res.status).toBe('ok')
    expect(res.requestId).toBeTypeOf('string')
    expect(Array.isArray(res.examples)).toBe(true)
    expect(res.examples.length).toBeGreaterThan(0)
  })

  it('every example has required fields', async () => {
    const res = await api('/api/playground/examples')
    for (const example of res.examples) {
      expect(example.id).toBeTypeOf('string')
      expect(example.scenario).toBeTypeOf('string')
      expect(example.title).toBeTypeOf('string')
      expect(Array.isArray(example.editableFields)).toBe(true)
    }
  })

  it('contains all four scenarios', async () => {
    const res = await api('/api/playground/examples')
    const scenarios = res.examples.map((example: { scenario: string }) => example.scenario)
    expect(scenarios).toContain('model-to-schema')
    expect(scenarios).toContain('query-lookahead')
    expect(scenarios).toContain('polymorphic-blocks')
    expect(scenarios).toContain('directive-middleware')
  })
})

describe('GET /api/knowledge/catalog', () => {
  it('returns a linked canonical knowledge catalog', async () => {
    const res = await api('/api/knowledge/catalog')
    expect(res.status).toBe('ok')
    expect(res.requestId).toBeTypeOf('string')
    expect(res.knowledge.counts.docs).toBe(8)
    expect(res.knowledge.counts.examples).toBe(4)
    expect(res.knowledge.counts.plugins).toBe(2)
    expect(res.knowledge.counts.recipes).toBe(5)
    expect(res.knowledge.counts.troubleshooting).toBe(5)
    expect(res.knowledge.byId['doc:/docs/guides/directives']).toBeDefined()
    expect(res.knowledge.byId['example:directive-middleware:user-auth-directive']).toBeDefined()
    expect(res.knowledge.byId['plugin:sequelize']).toBeDefined()
    expect(res.knowledge.byId['doc:/docs/guides/directives'].relatedIds).toContain(
      'example:directive-middleware:user-auth-directive',
    )
  })
})

describe('GET /api/knowledge/overview', () => {
  it('returns section and scenario summaries', async () => {
    const res = await api('/api/knowledge/overview')
    expect(res.status).toBe('ok')
    expect(res.overview.counts.docs).toBe(8)
    expect(res.overview.counts.examples).toBe(4)
    expect(res.overview.counts.plugins).toBe(2)

    const guidesSection = res.overview.sections.find((section: { id: string }) => section.id === 'guides')
    expect(guidesSection.docCount).toBe(5)

    const directiveScenario = res.overview.scenarios.find((scenario: { id: string }) => scenario.id === 'directive-middleware')
    expect(directiveScenario.linkedDocCount).toBe(1)
    expect(directiveScenario.recipeCount).toBeGreaterThanOrEqual(1)
    expect(directiveScenario.executionModes).toContain('adapted')
  })
})

describe('GET /api/knowledge/docs', () => {
  it('supports scenario filtering', async () => {
    const res = await api('/api/knowledge/docs?scenario=directive-middleware')
    expect(res.status).toBe('ok')
    expect(res.docs.length).toBe(1)
    expect(res.docs[0].slug).toBe('/docs/guides/directives')
  })
})

describe('GET /api/knowledge/examples', () => {
  it('supports scenario filtering', async () => {
    const res = await api('/api/knowledge/examples?scenario=directive-middleware')
    expect(res.status).toBe('ok')
    expect(res.examples.length).toBe(1)
    expect(res.examples[0].id).toBe('example:directive-middleware:user-auth-directive')
    expect(res.examples[0].executionMode).toBe('adapted')
  })
})

describe('GET /api/knowledge/plugins', () => {
  it('supports ORM filtering', async () => {
    const res = await api('/api/knowledge/plugins?orm=sequelize')
    expect(res.status).toBe('ok')
    expect(res.plugins.length).toBeGreaterThanOrEqual(1)
    expect(res.plugins[0].kind).toBe('plugin')
  })
})

describe('GET /api/knowledge/recipes', () => {
  it('supports scenario filtering', async () => {
    const res = await api('/api/knowledge/recipes?scenario=polymorphic-blocks')
    expect(res.status).toBe('ok')
    expect(res.recipes.length).toBeGreaterThanOrEqual(1)
    expect(res.recipes.some((recipe: { id: string }) => recipe.id === 'recipe:polymorphic-content-blocks')).toBe(true)
  })
})

describe('GET /api/knowledge/troubleshooting', () => {
  it('supports stage filtering', async () => {
    const res = await api('/api/knowledge/troubleshooting?stage=directive')
    expect(res.status).toBe('ok')
    expect(res.troubleshooting.length).toBeGreaterThanOrEqual(1)
    expect(res.troubleshooting.some((issue: { id: string }) => issue.id === 'troubleshooting:directive-not-printed-in-sdl')).toBe(true)
  })
})

describe('GET /api/knowledge/search', () => {
  it('returns ranked results for a query', async () => {
    const res = await api('/api/knowledge/search?q=directive')
    expect(res.status).toBe('ok')
    expect(res.results.length).toBeGreaterThan(1)
    expect(res.results[0].id).toBe('doc:/docs/guides/directives')
    expect(res.results.some((result: { id: string }) => result.id === 'example:directive-middleware:user-auth-directive')).toBe(true)
  })

  it('applies doc filters', async () => {
    const res = await api('/api/knowledge/search?q=plugin&kind=doc&section=reference')
    expect(res.status).toBe('ok')
    expect(res.results.length).toBeGreaterThanOrEqual(1)
    expect(res.results[0].id).toBe('doc:/docs/reference/writing-a-plugin')
    expect(res.results.some((result: { id: string }) => result.id === 'doc:/mcp/version-contract')).toBe(true)
  })

  it('supports curated kind filters', async () => {
    const res = await api('/api/knowledge/search?q=sequelize&kind=plugin')
    expect(res.status).toBe('ok')
    expect(res.results.length).toBeGreaterThanOrEqual(1)
    expect(res.results[0].id).toBe('plugin:sequelize')
  })

  it('rejects too-short queries', async () => {
    const response = await fetch(`${BASE}/api/knowledge/search?q=a`)
    const json = await response.json()
    expect(response.status).toBe(400)
    expect(json.status).toBe('error')
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('POST /api/playground/generate', () => {
  it('returns real SDL for user-orders-basic', async () => {
    const res = await post('/api/playground/generate', {
      scenario: 'model-to-schema',
      input: { exampleId: 'user-orders-basic' },
    })
    expect(res.status).toBe('ok')
    expect(res.requestId).toBeTypeOf('string')
    expect(res.scenario).toBe('model-to-schema')
    expect(res.schema.sdl).toContain('type User')
    expect(res.schema.sdl).toContain('type Order')
    expect(Array.isArray(res.diagnostics)).toBe(true)
  })

  it('returns typeSummary when requested', async () => {
    const res = await post('/api/playground/generate', {
      scenario: 'model-to-schema',
      input: {
        exampleId: 'user-orders-basic',
        options: { showTypeSummary: true },
      },
    })
    expect(res.schema.typeSummary).toBeDefined()
    expect(Array.isArray(res.schema.typeSummary)).toBe(true)
    const userType = res.schema.typeSummary.find((type: { name: string }) => type.name === 'User')
    expect(userType).toBeDefined()
    expect(userType.kind).toBe('object')
  })

  it('returns UNKNOWN_EXAMPLE for unknown exampleId', async () => {
    const res = await post('/api/playground/generate', {
      scenario: 'model-to-schema',
      input: { exampleId: 'does-not-exist' },
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('UNKNOWN_EXAMPLE')
    expect(res.error.message).toBeTypeOf('string')
  })

  it('returns VALIDATION_ERROR for missing input field', async () => {
    const res = await post('/api/playground/generate', {
      scenario: 'model-to-schema',
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR for unknown scenario', async () => {
    const res = await post('/api/playground/generate', {
      scenario: 'not-a-real-scenario',
      input: { exampleId: 'user-orders-basic' },
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('VALIDATION_ERROR')
  })

  it('error responses never contain stack traces', async () => {
    const res = await post('/api/playground/generate', {
      scenario: 'model-to-schema',
      input: { exampleId: 'does-not-exist' },
    })
    const body = JSON.stringify(res)
    expect(body).not.toContain('node_modules')
    expect(body).not.toContain('\n    at ')
  })
})

describe('POST /api/playground/query', () => {
  it('returns real data and SQL for me-with-orders', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'query-lookahead',
      input: {
        exampleId: 'me-with-orders',
        query: '{ me { id email orders { id status } } }',
      },
    })
    expect(res.status).toBe('ok')
    expect(res.requestId).toBeTypeOf('string')
    expect(res.scenario).toBe('query-lookahead')
    expect(res.result.data.me).toBeDefined()
    expect(res.result.data.me.id).toBeDefined()
    expect(res.result.data.me.email).toBeDefined()
    expect(Array.isArray(res.result.data.me.orders)).toBe(true)
  })

  it('returns SQL for query-lookahead', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'query-lookahead',
      input: {
        exampleId: 'me-with-orders',
        query: '{ me { id email orders { id status } } }',
      },
    })
    expect(res.execution.sql).not.toBeNull()
    expect(res.execution.sql).toBeTypeOf('string')
  })

  it('returns includeGraph with orders for me-with-orders', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'query-lookahead',
      input: {
        exampleId: 'me-with-orders',
        query: '{ me { id email orders { id status } } }',
      },
    })
    expect(res.execution.includeGraph.User).toContain('orders')
  })

  it('returns real data for polymorphic-blocks', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'polymorphic-blocks',
      input: {
        exampleId: 'page-blocks-basic',
        query: '{ page(slug: "/home") { id slug blocks { ... on HeroBlock { id headline } ... on TextBlock { id body } } } }',
      },
    })
    expect(res.status).toBe('ok')
    expect(res.scenario).toBe('polymorphic-blocks')
    expect(res.result.data.page).toBeDefined()
    expect(Array.isArray(res.result.data.page.blocks)).toBe(true)
  })

  it('returns UNKNOWN_EXAMPLE for unknown exampleId', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'query-lookahead',
      input: {
        exampleId: 'does-not-exist',
        query: '{ me { id } }',
      },
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('UNKNOWN_EXAMPLE')
  })

  it('returns VALIDATION_ERROR when query field is missing', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'query-lookahead',
      input: { exampleId: 'me-with-orders' },
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('VALIDATION_ERROR')
  })

  it('error responses never contain stack traces', async () => {
    const res = await post('/api/playground/query', {
      scenario: 'query-lookahead',
      input: { exampleId: 'does-not-exist', query: '{ me { id } }' },
    })
    const body = JSON.stringify(res)
    expect(body).not.toContain('node_modules')
    expect(body).not.toContain('\n    at ')
  })
})

describe('POST /api/playground/directives', () => {
  it('returns directive metadata for user-auth-directive in named mode', async () => {
    const res = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'user-auth-directive', directiveMode: 'named' },
    })
    expect(res.status).toBe('ok')
    expect(res.requestId).toBeTypeOf('string')
    expect(res.scenario).toBe('directive-middleware')
    expect(res.directive.name).toBeTypeOf('string')
    expect(res.directive.printsToSchema).toBe(true)
    expect(res.directive.runtimeBehaviorSummary).toBeTypeOf('string')
  })

  it('returns directive metadata in anonymous mode', async () => {
    const res = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'user-auth-directive', directiveMode: 'anonymous' },
    })
    expect(res.status).toBe('ok')
    expect(res.directive.printsToSchema).toBe(false)
  })

  it('returns SDL excerpt', async () => {
    const res = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'user-auth-directive', directiveMode: 'named' },
    })
    expect(res.schema.sdlExcerpt).toBeTypeOf('string')
    expect(res.schema.sdlExcerpt.length).toBeGreaterThan(0)
  })

  it('named and anonymous mode produce different SDL excerpts', async () => {
    const named = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'user-auth-directive', directiveMode: 'named' },
    })
    const anonymous = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'user-auth-directive', directiveMode: 'anonymous' },
    })
    expect(named.schema.sdlExcerpt).not.toBe(anonymous.schema.sdlExcerpt)
  })

  it('returns UNKNOWN_EXAMPLE for unknown exampleId', async () => {
    const res = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'does-not-exist' },
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('UNKNOWN_EXAMPLE')
  })

  it('returns VALIDATION_ERROR for bad payload', async () => {
    const res = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: {},
    })
    expect(res.status).toBe('error')
    expect(res.error.code).toBe('VALIDATION_ERROR')
  })

  it('error responses never contain stack traces', async () => {
    const res = await post('/api/playground/directives', {
      scenario: 'directive-middleware',
      input: { exampleId: 'does-not-exist' },
    })
    const body = JSON.stringify(res)
    expect(body).not.toContain('node_modules')
    expect(body).not.toContain('\n    at ')
  })
})

async function waitForServerReady() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 60000) {
    if (serverProcess?.exitCode !== null) {
      throw new Error(`Nuxt dev server exited early.\n${serverLogs}`)
    }

    try {
      const response = await fetch(`${BASE}/api/health`, {
        signal: AbortSignal.timeout(2000),
      })

      if (response.ok) {
        return
      }
    }
    catch {
      // Keep polling until the server is ready.
    }

    await wait(750)
  }

  throw new Error(`Timed out waiting for the Nuxt dev server.\n${serverLogs}`)
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
