# Shared Types

Single source of truth for all TypeScript types and Zod schemas used across the project.
Do not redefine these locally — import from `~/types` or copy these definitions verbatim into
`types/index.ts` when scaffolding.

---

## Scenario IDs

```ts
export const SCENARIO_IDS = [
  'model-to-schema',
  'query-lookahead',
  'polymorphic-blocks',
  'directive-middleware',
] as const

export type ScenarioId = (typeof SCENARIO_IDS)[number]
```

## Error Codes

```ts
export const ERROR_CODES = [
  'VALIDATION_ERROR',   // malformed request payload
  'UNKNOWN_SCENARIO',   // scenario not in whitelist
  'UNKNOWN_EXAMPLE',    // exampleId not registered for this scenario
  'EXECUTION_TIMEOUT',  // exceeded time limit
  'EXECUTION_ERROR',    // runtime failure (safe message only)
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]
```

---

## API Envelope

Every response from every endpoint shares this envelope:

```ts
interface BaseResponse {
  requestId: string
  status: 'ok' | 'error'
}

interface ErrorResponse extends BaseResponse {
  status: 'error'
  error: {
    code: ErrorCode
    message: string      // safe, human-readable — no stack traces
    details?: string[]   // optional field-level hints
  }
}
```

---

## Shared Sub-types

```ts
interface DiagnosticEntry {
  level: 'info' | 'warning' | 'error'
  message: string
  field?: string
}

interface TypeSummaryEntry {
  name: string
  kind: 'object' | 'enum' | 'scalar' | 'union' | 'interface'
  fields: string[]
}
```

---

## GET /api/health

```ts
// Response
interface HealthResponse {
  status: 'ok'
}
```

---

## GET /api/playground/examples

```ts
interface Example {
  id: string
  scenario: ScenarioId
  title: string
  description: string
  editableFields: string[]  // field names the user may modify
}

// Response
interface ExamplesResponse extends BaseResponse {
  status: 'ok'
  examples: Example[]
}
```

---

## POST /api/playground/generate

```ts
// Request
interface GenerateRequest {
  scenario: 'model-to-schema'
  input: {
    exampleId: string
    modelEdits?: Record<string, boolean | string | number>
    options?: {
      showTypeSummary?: boolean
    }
  }
}

// Response
interface GenerateResponse extends BaseResponse {
  status: 'ok'
  scenario: 'model-to-schema'
  schema: {
    sdl: string
    typeSummary?: TypeSummaryEntry[]
  }
  diagnostics: DiagnosticEntry[]
}
```

---

## POST /api/playground/query

```ts
// Request
interface QueryRequest {
  scenario: 'query-lookahead' | 'polymorphic-blocks'
  input: {
    exampleId: string
    query: string        // max 2 000 characters
    variables?: Record<string, unknown>
  }
}

// Response
interface QueryResponse extends BaseResponse {
  status: 'ok'
  scenario: 'query-lookahead' | 'polymorphic-blocks'
  result: {
    data: Record<string, unknown>
  }
  execution: {
    includeGraph: Record<string, string[]>  // { ModelName: ['assocA', 'assocB'] }
    sql: string | null   // Sequelize SQL string; null when no DB query was made
    notes: string[]      // human-readable explanation of include decisions
  }
  diagnostics: DiagnosticEntry[]
}
```

---

## POST /api/playground/directives

```ts
// Request
interface DirectivesRequest {
  scenario: 'directive-middleware'
  input: {
    exampleId: string
    directiveMode?: 'named' | 'anonymous'
  }
}

// Response
interface DirectivesResponse extends BaseResponse {
  status: 'ok'
  scenario: 'directive-middleware'
  directive: {
    name: string
    printsToSchema: boolean
    runtimeBehaviorSummary: string
  }
  schema: {
    sdlExcerpt: string
  }
  diagnostics: DiagnosticEntry[]
}
```

---

## Zod Schemas (backend — use in Nitro route handlers)

```ts
import { z } from 'zod'

export const ScenarioIdSchema = z.enum([
  'model-to-schema',
  'query-lookahead',
  'polymorphic-blocks',
  'directive-middleware',
])

export const GenerateRequestSchema = z.object({
  scenario: z.literal('model-to-schema'),
  input: z.object({
    exampleId: z.string().min(1).max(100),
    modelEdits: z
      .record(z.union([z.boolean(), z.string(), z.number()]))
      .optional(),
    options: z
      .object({ showTypeSummary: z.boolean().optional() })
      .optional(),
  }),
})

export const QueryRequestSchema = z.object({
  scenario: z.enum(['query-lookahead', 'polymorphic-blocks']),
  input: z.object({
    exampleId: z.string().min(1).max(100),
    query: z.string().min(1).max(2000),
    variables: z.record(z.unknown()).optional(),
  }),
})

export const DirectivesRequestSchema = z.object({
  scenario: z.literal('directive-middleware'),
  input: z.object({
    exampleId: z.string().min(1).max(100),
    directiveMode: z.enum(['named', 'anonymous']).optional(),
  }),
})
```

---

## URL Hash State (frontend)

The playground encodes active state in the URL hash so links are shareable without server
persistence.

```ts
interface PlaygroundHashState {
  scenarioId: ScenarioId
  exampleId: string
  query?: string
}

// Encode:  btoa(JSON.stringify(state))
// Decode:  JSON.parse(atob(hash)) — validate result with PlaygroundHashStateSchema before use

import { z } from 'zod'

export const PlaygroundHashStateSchema = z.object({
  scenarioId: ScenarioIdSchema,
  exampleId: z.string().min(1),
  query: z.string().optional(),
})
```

---

## Docs Types

### docs.config.ts (must exist at `content/graphql-gene/docs.config.ts`)

```ts
export type DocsSectionId =
  | 'concepts'
  | 'guides'
  | 'reference'
  | 'examples'
  | 'tutorials'

export interface DocsSection {
  id: DocsSectionId
  title: string
  order: number
  description?: string
}

export interface DocsConfig {
  docsRoot: string       // 'docs'
  sections: DocsSection[]
}

export const docsConfig: DocsConfig = {
  docsRoot: 'docs',
  sections: [
    { id: 'concepts',  title: 'Concepts',   order: 1, description: 'Mental models and architecture explanations.' },
    { id: 'guides',    title: 'Guides',     order: 2, description: 'Focused feature and how-to pages.' },
    { id: 'reference', title: 'Reference',  order: 3, description: 'Exact lookup-style API and configuration.' },
    { id: 'examples',  title: 'Examples',   order: 4, description: 'Runnable or inspectable scenarios.' },
    { id: 'tutorials', title: 'Tutorials',  order: 5, description: 'Step-by-step onboarding flows.' },
  ],
}
```

### Per-page frontmatter (in each markdown doc file)

```ts
interface DocsFrontmatter {
  // Required
  title: string
  description: string
  section: DocsSectionId
  order: number
  slug: string          // e.g. '/docs/guides/directives'

  // Optional
  category?: string     // sidebar subgroup, e.g. 'core' | 'advanced' | 'plugins'
  status?: 'stable' | 'experimental' | 'planned' | 'deprecated'
  summary?: string      // one sentence; used in search cards and AI retrieval
  related?: string[]    // other page slugs
  sidebarLabel?: string // shorter label for sidebar when title is long
  playgroundScenario?: ScenarioId  // renders "Try in Playground" callout
}
```

Example frontmatter:

```yaml
---
title: Directives
description: Runtime middleware and schema-printing behavior in graphql-gene.
section: guides
category: core
order: 3
slug: /docs/guides/directives
status: stable
summary: Learn how graphql-gene directives affect runtime behavior and generated SDL.
related:
  - /docs/guides/schema-design
playgroundScenario: directive-middleware
---
```
