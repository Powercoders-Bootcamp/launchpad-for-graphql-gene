import { z } from 'zod'

// ─── Scenario IDs ────────────────────────────────────────────────────────────

export const SCENARIO_IDS = [
  'model-to-schema',
  'query-lookahead',
  'polymorphic-blocks',
  'directive-middleware',
] as const

export type ScenarioId = (typeof SCENARIO_IDS)[number]

// ─── Error codes ─────────────────────────────────────────────────────────────

export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNKNOWN_SCENARIO',
  'UNKNOWN_EXAMPLE',
  'EXECUTION_TIMEOUT',
  'EXECUTION_ERROR',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

// ─── API envelope ─────────────────────────────────────────────────────────────

export interface BaseResponse {
  requestId: string
  status: 'ok' | 'error'
}

export interface ErrorResponse extends BaseResponse {
  status: 'error'
  error: {
    code: ErrorCode
    message: string
    details?: string[]
  }
}

// ─── Shared sub-types ────────────────────────────────────────────────────────

export interface DiagnosticEntry {
  level: 'info' | 'warning' | 'error'
  message: string
  field?: string
}

export interface TypeSummaryEntry {
  name: string
  kind: 'object' | 'enum' | 'scalar' | 'union' | 'interface'
  fields: string[]
}

// ─── Example catalog ─────────────────────────────────────────────────────────

export interface Example {
  id: string
  scenario: ScenarioId
  title: string
  description: string
  editableFields: string[]
}

export interface ExamplesResponse extends BaseResponse {
  status: 'ok'
  examples: Example[]
}

// ─── POST /api/playground/generate ──────────────────────────────────────────

export interface GenerateRequest {
  scenario: 'model-to-schema'
  input: {
    exampleId: string
    modelEdits?: Record<string, boolean | string | number>
    options?: { showTypeSummary?: boolean }
  }
}

export interface GenerateResponse extends BaseResponse {
  status: 'ok'
  scenario: 'model-to-schema'
  schema: {
    sdl: string
    typeSummary?: TypeSummaryEntry[]
  }
  diagnostics: DiagnosticEntry[]
}

// ─── POST /api/playground/query ─────────────────────────────────────────────

export interface QueryRequest {
  scenario: 'query-lookahead' | 'polymorphic-blocks'
  input: {
    exampleId: string
    query: string
    variables?: Record<string, unknown>
  }
}

export interface QueryResponse extends BaseResponse {
  status: 'ok'
  scenario: 'query-lookahead' | 'polymorphic-blocks'
  result: { data: Record<string, unknown> }
  execution: {
    includeGraph: Record<string, string[]>
    sql: string | null
    notes: string[]
  }
  diagnostics: DiagnosticEntry[]
}

// ─── POST /api/playground/directives ────────────────────────────────────────

export interface DirectivesRequest {
  scenario: 'directive-middleware'
  input: {
    exampleId: string
    directiveMode?: 'named' | 'anonymous'
  }
}

export interface DirectivesResponse extends BaseResponse {
  status: 'ok'
  scenario: 'directive-middleware'
  directive: {
    name: string
    printsToSchema: boolean
    runtimeBehaviorSummary: string
  }
  schema: { sdlExcerpt: string }
  diagnostics: DiagnosticEntry[]
}

// ─── Zod schemas (backend) ───────────────────────────────────────────────────

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
    modelEdits: z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])).optional(),
    options: z.object({ showTypeSummary: z.boolean().optional() }).optional(),
  }),
})

export const QueryRequestSchema = z.object({
  scenario: z.enum(['query-lookahead', 'polymorphic-blocks']),
  input: z.object({
    exampleId: z.string().min(1).max(100),
    query: z.string().min(1).max(2000),
    variables: z.record(z.string(), z.unknown()).optional(),
  }),
})

export const DirectivesRequestSchema = z.object({
  scenario: z.literal('directive-middleware'),
  input: z.object({
    exampleId: z.string().min(1).max(100),
    directiveMode: z.enum(['named', 'anonymous']).optional(),
  }),
})

// ─── URL hash state ──────────────────────────────────────────────────────────

export interface PlaygroundHashState {
  scenarioId: ScenarioId
  exampleId: string
  query?: string
}

export const PlaygroundHashStateSchema = z.object({
  scenarioId: ScenarioIdSchema,
  exampleId: z.string().min(1),
  query: z.string().optional(),
})

// ─── Docs types ──────────────────────────────────────────────────────────────

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
  docsRoot: string
  sections: DocsSection[]
}

export interface DocsFrontmatter {
  title: string
  description: string
  section: DocsSectionId
  order: number
  slug: string
  category?: string
  status?: 'stable' | 'experimental' | 'planned' | 'deprecated'
  summary?: string
  related?: string[]
  sidebarLabel?: string
  playgroundScenario?: ScenarioId
}
