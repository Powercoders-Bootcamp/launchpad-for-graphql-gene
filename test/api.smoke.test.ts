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
