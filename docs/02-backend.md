# Backend Spec

Nitro server routes that power the playground API. All types and Zod schemas are in
[01-types.md](./01-types.md). All routes live under `server/api/`.

---

## Shared Utilities

Create these before the route handlers.

### `server/utils/playground/response.ts`

Exports two helpers used by every handler:

```ts
import { randomUUID } from 'node:crypto'
import type { ErrorCode } from '~/types'

export function okResponse<T extends object>(data: T) {
  return { requestId: randomUUID(), status: 'ok' as const, ...data }
}

export function errorResponse(code: ErrorCode, message: string, details?: string[]) {
  return {
    requestId: randomUUID(),
    status: 'error' as const,
    error: { code, message, ...(details ? { details } : {}) },
  }
}
```

Rules:
- `message` must be human-readable and safe. No stack traces, no internal paths.
- `details` is optional field-level hints (e.g. Zod error messages).

### `server/utils/playground/registry.ts`

Exports the curated scenario + example catalog. This is the source of truth for which examples
exist — the frontend never creates examples dynamically.

```ts
import type { ScenarioId, Example } from '~/types'

const CATALOG: Example[] = [
  // model-to-schema
  {
    id: 'user-orders-basic',
    scenario: 'model-to-schema',
    title: 'User with Orders',
    description: 'Generate a schema from User and Order models with a hasMany association.',
    editableFields: ['includeOrders', 'includeAddress', 'showTypeSummary'],
  },
  // query-lookahead
  {
    id: 'me-with-orders',
    scenario: 'query-lookahead',
    title: 'Me with Orders',
    description: 'Query current user including their orders. Observe the JOIN in the SQL panel.',
    editableFields: ['query'],
  },
  // polymorphic-blocks
  {
    id: 'page-blocks-basic',
    scenario: 'polymorphic-blocks',
    title: 'Polymorphic Page Blocks',
    description: 'Query heterogeneous CMS blocks with inline fragments.',
    editableFields: ['query'],
  },
  // directive-middleware
  {
    id: 'user-auth-directive',
    scenario: 'directive-middleware',
    title: 'Auth Directive',
    description: 'Attach @userAuth to a field and inspect schema and runtime behavior.',
    editableFields: ['directiveMode'],
  },
]

export function getAllExamples(): Example[] {
  return CATALOG
}

export function getExample(scenario: ScenarioId, exampleId: string): Example | undefined {
  return CATALOG.find(e => e.scenario === scenario && e.id === exampleId)
}
```

### `server/utils/playground/fixtures.ts`

Provides seeded data for each scenario. Each fixture function returns the data needed to
seed the ephemeral SQLite database for that request.

```ts
// Shape returned for query-lookahead and polymorphic-blocks scenarios.
// Exact Sequelize model definitions go here.
export interface ScenarioFixture {
  users?: Array<{ id: number; email: string; name: string }>
  orders?: Array<{ id: number; userId: number; status: string; total: number }>
  pages?: Array<{ id: number; slug: string }>
  blocks?: Array<{ id: number; pageId: number; type: string; content: Record<string, unknown> }>
}

export function getFixture(scenario: string, exampleId: string): ScenarioFixture {
  if (scenario === 'query-lookahead' && exampleId === 'me-with-orders') {
    return {
      users: [{ id: 1, email: 'user@example.com', name: 'Alex' }],
      orders: [
        { id: 10, userId: 1, status: 'PAID', total: 99 },
        { id: 11, userId: 1, status: 'PENDING', total: 49 },
      ],
    }
  }
  if (scenario === 'polymorphic-blocks' && exampleId === 'page-blocks-basic') {
    return {
      pages: [{ id: 1, slug: '/home' }],
      blocks: [
        { id: 1, pageId: 1, type: 'HeroBlock', content: { headline: 'Welcome' } },
        { id: 2, pageId: 1, type: 'TextBlock', content: { body: 'Hello world' } },
      ],
    }
  }
  return {}
}
```

### `server/utils/playground/engine.ts`

Wraps the `graphql-gene` + Sequelize execution. Called by route handlers.

```ts
// engine.ts exports these four functions:

export async function runGenerate(params: {
  exampleId: string
  modelEdits?: Record<string, boolean | string | number>
  options?: { showTypeSummary?: boolean }
}): Promise<{ sdl: string; typeSummary?: TypeSummaryEntry[]; diagnostics: DiagnosticEntry[] }>

export async function runQuery(params: {
  scenario: 'query-lookahead' | 'polymorphic-blocks'
  exampleId: string
  query: string
  variables?: Record<string, unknown>
}): Promise<{
  data: Record<string, unknown>
  includeGraph: Record<string, string[]>
  sql: string | null
  notes: string[]
  diagnostics: DiagnosticEntry[]
}>

export async function runDirective(params: {
  exampleId: string
  directiveMode?: 'named' | 'anonymous'
}): Promise<{
  directive: { name: string; printsToSchema: boolean; runtimeBehaviorSummary: string }
  sdlExcerpt: string
  diagnostics: DiagnosticEntry[]
}>
```

Implementation notes for `engine.ts`:
- Seed an in-memory SQLite database from `getFixture()` at the start of each call.
- Wrap every execution in a `Promise.race` with a timeout rejection.
- Capture Sequelize SQL via the `logging` option: `logging: (sql) => capturedSql = sql`.
- Never re-throw internal errors with stack traces — catch and convert to `DiagnosticEntry`.

---

## Route Handlers

### `server/api/health.get.ts`

```ts
export default defineEventHandler(() => {
  return { status: 'ok' }
})
```

Pinged on playground page load to pre-warm the serverless function.

---

### `server/api/playground/examples.get.ts`

```ts
import { getAllExamples } from '~/server/utils/playground/registry'
import { okResponse } from '~/server/utils/playground/response'

export default defineEventHandler(() => {
  return okResponse({ examples: getAllExamples() })
})
```

No request body. Returns the full catalog.

---

### `server/api/playground/generate.post.ts`

```ts
import { GenerateRequestSchema } from '~/types'
import { getExample } from '~/server/utils/playground/registry'
import { runGenerate } from '~/server/utils/playground/engine'
import { okResponse, errorResponse } from '~/server/utils/playground/response'

export default defineEventHandler(async (event) => {
  // 1. Parse + validate body
  const body = await readBody(event)
  const parsed = GenerateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(
      'VALIDATION_ERROR',
      'The request payload is not valid.',
      parsed.error.issues.map(i => i.message),
    )
  }

  // 2. Validate example exists
  const { input } = parsed.data
  const example = getExample('model-to-schema', input.exampleId)
  if (!example) {
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
  }

  // 3. Validate editable fields
  if (input.modelEdits) {
    const disallowed = Object.keys(input.modelEdits).filter(
      k => !example.editableFields.includes(k),
    )
    if (disallowed.length) {
      return errorResponse('VALIDATION_ERROR', `Fields not editable: ${disallowed.join(', ')}`)
    }
  }

  // 4. Execute with timeout
  try {
    const result = await runGenerate({
      exampleId: input.exampleId,
      modelEdits: input.modelEdits,
      options: input.options,
    })
    return okResponse({ scenario: 'model-to-schema', schema: { sdl: result.sdl, typeSummary: result.typeSummary }, diagnostics: result.diagnostics })
  } catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT') {
      return errorResponse('EXECUTION_TIMEOUT', 'Schema generation exceeded the time limit.')
    }
    return errorResponse('EXECUTION_ERROR', 'Schema generation failed. Check the diagnostics.')
  }
})
```

---

### `server/api/playground/query.post.ts`

```ts
import { QueryRequestSchema } from '~/types'
import { getExample } from '~/server/utils/playground/registry'
import { runQuery } from '~/server/utils/playground/engine'
import { okResponse, errorResponse } from '~/server/utils/playground/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = QueryRequestSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
  }

  const { scenario, input } = parsed.data
  const example = getExample(scenario, input.exampleId)
  if (!example) {
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
  }

  try {
    const result = await runQuery({ scenario, exampleId: input.exampleId, query: input.query, variables: input.variables })
    return okResponse({
      scenario,
      result: { data: result.data },
      execution: { includeGraph: result.includeGraph, sql: result.sql, notes: result.notes },
      diagnostics: result.diagnostics,
    })
  } catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT') {
      return errorResponse('EXECUTION_TIMEOUT', 'Query execution exceeded the time limit.')
    }
    return errorResponse('EXECUTION_ERROR', 'Query execution failed. Check the diagnostics.')
  }
})
```

---

### `server/api/playground/directives.post.ts`

```ts
import { DirectivesRequestSchema } from '~/types'
import { getExample } from '~/server/utils/playground/registry'
import { runDirective } from '~/server/utils/playground/engine'
import { okResponse, errorResponse } from '~/server/utils/playground/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = DirectivesRequestSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 'The request payload is not valid.',
      parsed.error.issues.map(i => i.message))
  }

  const { input } = parsed.data
  const example = getExample('directive-middleware', input.exampleId)
  if (!example) {
    return errorResponse('UNKNOWN_EXAMPLE', `No example found for id "${input.exampleId}".`)
  }

  try {
    const result = await runDirective({ exampleId: input.exampleId, directiveMode: input.directiveMode })
    return okResponse({
      scenario: 'directive-middleware',
      directive: result.directive,
      schema: { sdlExcerpt: result.sdlExcerpt },
      diagnostics: result.diagnostics,
    })
  } catch (err: unknown) {
    if ((err as Error).message === 'TIMEOUT') {
      return errorResponse('EXECUTION_TIMEOUT', 'Directive scenario exceeded the time limit.')
    }
    return errorResponse('EXECUTION_ERROR', 'Directive scenario failed. Check the diagnostics.')
  }
})
```

---

## Security Rules

Apply these in every handler (or in Nitro middleware):

| Constraint | Limit |
|---|---|
| Max request body size | 64 KB |
| Max `query` string length | 2 000 characters (enforced in Zod schema) |
| Max `variables` payload | 8 KB |
| Generation timeout | 3 000 ms |
| Query execution timeout | 5 000 ms |
| Scenario whitelist | `SCENARIO_IDS` from `01-types.md` |
| Example whitelist | Registry in `server/utils/playground/registry.ts` |

Implement timeout via:

```ts
const TIMEOUT_MS = 3000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms),
    ),
  ])
}
```

## Observability

Log these fields on every request (use `console.log` or Nitro's `useLogger`):

```ts
{
  requestId: string
  scenario: string
  exampleId: string
  durationMs: number
  status: 'ok' | 'error'
  errorCode?: ErrorCode
}
```

Never log full request bodies or variable payloads.
