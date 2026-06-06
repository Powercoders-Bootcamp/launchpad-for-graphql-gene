import { describe, it, expect, beforeAll } from 'vitest'

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, options)
  return res.json()
}

async function post(path: string, body: unknown) {
  return api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Verify server is reachable before running
beforeAll(async () => {
  const res = await fetch(`${BASE}/api/health`).catch(() => null)
  if (!res?.ok) throw new Error(`Dev server not reachable at ${BASE} — run "npm run dev" first`)
})

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await api('/api/health')
    expect(res.status).toBe('ok')
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
    const scenarios = res.examples.map((e: { scenario: string }) => e.scenario)
    expect(scenarios).toContain('model-to-schema')
    expect(scenarios).toContain('query-lookahead')
    expect(scenarios).toContain('polymorphic-blocks')
    expect(scenarios).toContain('directive-middleware')
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
    const userType = res.schema.typeSummary.find((t: { name: string }) => t.name === 'User')
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
