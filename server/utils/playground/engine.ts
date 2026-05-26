/**
 * Execution engine — Phase 2 stubs.
 * Replace with real graphql-gene + Sequelize calls in Phase 3.
 * See docs/02-backend.md for the full implementation spec.
 */
import type { DiagnosticEntry, TypeSummaryEntry } from '~/types'

const TIMEOUT_MS_GENERATE = 3000
const TIMEOUT_MS_QUERY = 5000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms),
    ),
  ])
}

export async function runGenerate(params: {
  exampleId: string
  modelEdits?: Record<string, boolean | string | number>
  options?: { showTypeSummary?: boolean }
}): Promise<{ sdl: string; typeSummary?: TypeSummaryEntry[]; diagnostics: DiagnosticEntry[] }> {
  return withTimeout(
    Promise.resolve({
      // TODO (Phase 3): replace with real graphql-gene SDL generation
      sdl: `# Stub SDL for example: ${params.exampleId}\ntype Query {\n  placeholder: String\n}`,
      typeSummary: params.options?.showTypeSummary
        ? [{ name: 'Query', kind: 'object' as const, fields: ['placeholder'] }]
        : undefined,
      diagnostics: [],
    }),
    TIMEOUT_MS_GENERATE,
  )
}

export async function runQuery(params: {
  scenario: string
  exampleId: string
  query: string
  variables?: Record<string, unknown>
}): Promise<{
  data: Record<string, unknown>
  includeGraph: Record<string, string[]>
  sql: string | null
  notes: string[]
  diagnostics: DiagnosticEntry[]
}> {
  return withTimeout(
    Promise.resolve({
      // TODO (Phase 3): replace with real graphql-gene query execution
      data: { stub: `Result for example: ${params.exampleId}` },
      includeGraph: {},
      sql: null,
      notes: ['Phase 3 runtime integration not yet implemented.'],
      diagnostics: [],
    }),
    TIMEOUT_MS_QUERY,
  )
}

export async function runDirective(params: {
  exampleId: string
  directiveMode?: 'named' | 'anonymous'
}): Promise<{
  directive: { name: string; printsToSchema: boolean; runtimeBehaviorSummary: string }
  sdlExcerpt: string
  diagnostics: DiagnosticEntry[]
}> {
  return withTimeout(
    Promise.resolve({
      // TODO (Phase 3): replace with real graphql-gene directive scenario
      directive: {
        name: params.directiveMode === 'anonymous' ? '' : 'userAuth',
        printsToSchema: params.directiveMode !== 'anonymous',
        runtimeBehaviorSummary: 'Stub: loads authenticated user context before field resolution.',
      },
      sdlExcerpt: `# Stub SDL excerpt for: ${params.exampleId}\ntype Query { me: User @userAuth }`,
      diagnostics: [],
    }),
    TIMEOUT_MS_QUERY,
  )
}
