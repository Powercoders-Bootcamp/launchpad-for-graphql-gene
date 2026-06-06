import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..', '..')
const port = 3173
const baseUrl = `http://127.0.0.1:${port}`

let serverProcess
let serverLogs = ''

before(async () => {
  serverProcess = spawn(
    process.execPath,
    ['node_modules/@nuxt/cli/bin/nuxi.mjs', 'dev', '--host', '127.0.0.1', '--port', String(port)],
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

  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      serverLogs += `\n[process exited with code ${code}]`
    }
  })

  await waitForServerReady()
})

after(async () => {
  if (!serverProcess || serverProcess.killed) {
    return
  }

  serverProcess.kill('SIGTERM')
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      serverProcess.kill('SIGKILL')
      resolve()
    }, 8000)

    serverProcess.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
  })
})

test('GET /api/health returns the health envelope', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  const json = await response.json()

  assert.equal(response.status, 200)
  assert.equal(json.status, 'ok')
  assert.equal(json.health.status, 'ok')
  assert.ok(typeof json.requestId === 'string' && json.requestId.length > 8)
})

test('GET /api/playground/examples returns the example catalog', async () => {
  const response = await fetch(`${baseUrl}/api/playground/examples`)
  const json = await response.json()

  assert.equal(response.status, 200)
  assert.equal(json.status, 'ok')
  assert.equal(json.examples.length, 4)
})

test('POST /api/playground/generate returns real SDL and type summary', async () => {
  const response = await postJson('/api/playground/generate', {
    scenario: 'model-to-schema',
    input: {
      exampleId: 'user-orders-basic',
      modelEdits: {
        includeOrders: true,
        includeAddress: true,
      },
      options: {
        showTypeSummary: true,
      },
    },
  })

  assert.equal(response.status, 200)
  assert.equal(response.json.status, 'ok')
  assert.match(response.json.schema.sdl, /type User/)
  assert.ok(response.json.schema.typeSummary.some((entry) => entry.name === 'User'))
})

test('POST /api/playground/generate rejects invalid payloads with 400', async () => {
  const response = await postJson('/api/playground/generate', {
    scenario: 'model-to-schema',
    input: {
      exampleId: '',
    },
  })

  assert.equal(response.status, 400)
  assert.equal(response.json.status, 'error')
  assert.equal(response.json.error.code, 'VALIDATION_ERROR')
})

test('POST /api/playground/query returns result data, include graph, and SQL', async () => {
  const response = await postJson('/api/playground/query', {
    scenario: 'query-lookahead',
    input: {
      exampleId: 'me-with-orders',
      query: `query MeWithOrders {
  me {
    id
    email
    orders {
      id
      status
    }
  }
}`,
      variables: {},
    },
  })

  assert.equal(response.status, 200)
  assert.equal(response.json.status, 'ok')
  assert.equal(response.json.result.data.me.email, 'user@example.com')
  assert.ok(response.json.execution.includeGraph.User.includes('orders'))
  assert.ok(typeof response.json.execution.sql === 'string' && response.json.execution.sql.length > 0)
})

test('POST /api/playground/directives returns directive metadata', async () => {
  const response = await postJson('/api/playground/directives', {
    scenario: 'directive-middleware',
    input: {
      exampleId: 'user-auth-directive',
      directiveMode: 'named',
    },
  })

  assert.equal(response.status, 200)
  assert.equal(response.json.status, 'ok')
  assert.equal(response.json.directive.printsToSchema, true)
  assert.match(response.json.schema.sdlExcerpt, /userAuth|@userAuth|directive/i)
})

test('POST /api/playground/query rejects unknown examples with 404', async () => {
  const response = await postJson('/api/playground/query', {
    scenario: 'query-lookahead',
    input: {
      exampleId: 'missing-example',
      query: '{ me { id } }',
      variables: {},
    },
  })

  assert.equal(response.status, 404)
  assert.equal(response.json.status, 'error')
  assert.equal(response.json.error.code, 'UNKNOWN_EXAMPLE')
})

test('POST /api/playground/query rejects oversized variables with 413', async () => {
  const response = await postJson('/api/playground/query', {
    scenario: 'query-lookahead',
    input: {
      exampleId: 'me-with-orders',
      query: '{ me { id } }',
      variables: {
        huge: 'x'.repeat(10000),
      },
    },
  })

  assert.equal(response.status, 413)
  assert.equal(response.json.status, 'error')
  assert.equal(response.json.error.code, 'VALIDATION_ERROR')
})

async function waitForServerReady() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 60000) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Nuxt dev server exited early.\n${serverLogs}`)
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`, {
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

async function postJson(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return {
    status: response.status,
    json: await response.json(),
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
