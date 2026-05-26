import { reactive } from 'vue'
import type { ScenarioId, Example, DiagnosticEntry, TypeSummaryEntry, PlaygroundHashState } from '~/types'
import { PlaygroundHashStateSchema, SCENARIO_IDS } from '~/types'

export interface PlaygroundState {
  scenarioId: ScenarioId
  exampleId: string
  query: string
  examples: Example[]
  isLoading: boolean
  error: string | null
  // SDL generation output
  sdl: string | null
  typeSummary: TypeSummaryEntry[] | null
  // Query execution output
  queryResult: Record<string, unknown> | null
  includeGraph: Record<string, string[]> | null
  sql: string | null
  executionNotes: string[]
  // Directive scenario output
  directiveInfo: { name: string; printsToSchema: boolean; runtimeBehaviorSummary: string } | null
  sdlExcerpt: string | null
  // Shared
  diagnostics: DiagnosticEntry[]
}

export function usePlayground() {
  const state = reactive<PlaygroundState>({
    scenarioId: 'model-to-schema',
    exampleId: '',
    query: '',
    examples: [],
    isLoading: false,
    error: null,
    sdl: null,
    typeSummary: null,
    queryResult: null,
    includeGraph: null,
    sql: null,
    executionNotes: [],
    directiveInfo: null,
    sdlExcerpt: null,
    diagnostics: [],
  })

  function clearOutput() {
    state.sdl = null
    state.typeSummary = null
    state.queryResult = null
    state.includeGraph = null
    state.sql = null
    state.executionNotes = []
    state.directiveInfo = null
    state.sdlExcerpt = null
    state.diagnostics = []
    state.error = null
  }

  async function loadExamples() {
    try {
      const res = await $fetch<{ examples: Example[] }>('/api/playground/examples')
      state.examples = res.examples
      const first = state.examples.find(e => e.scenario === state.scenarioId)
      if (first && !state.exampleId) state.exampleId = first.id
    }
    catch {
      state.error = 'Failed to load examples.'
    }
  }

  async function selectScenario(id: ScenarioId) {
    state.scenarioId = id
    clearOutput()
    const first = state.examples.find(e => e.scenario === id)
    state.exampleId = first?.id ?? ''
    state.query = ''
  }

  async function selectExample(id: string) {
    state.exampleId = id
    clearOutput()
  }

  async function runGenerate() {
    state.isLoading = true
    state.error = null
    try {
      const res = await $fetch<any>('/api/playground/generate', {
        method: 'POST',
        body: { scenario: 'model-to-schema', input: { exampleId: state.exampleId } },
      })
      if (res.status === 'error') { state.error = res.error.message; return }
      state.sdl = res.schema?.sdl ?? null
      state.typeSummary = res.schema?.typeSummary ?? null
      state.diagnostics = res.diagnostics ?? []
    }
    catch { state.error = 'Request failed. Please try again.' }
    finally { state.isLoading = false }
  }

  async function runQuery() {
    state.isLoading = true
    state.error = null
    try {
      const res = await $fetch<any>('/api/playground/query', {
        method: 'POST',
        body: {
          scenario: state.scenarioId,
          input: { exampleId: state.exampleId, query: state.query, variables: {} },
        },
      })
      if (res.status === 'error') { state.error = res.error.message; return }
      state.queryResult = res.result?.data ?? null
      state.includeGraph = res.execution?.includeGraph ?? null
      state.sql = res.execution?.sql ?? null
      state.executionNotes = res.execution?.notes ?? []
      state.diagnostics = res.diagnostics ?? []
    }
    catch { state.error = 'Request failed. Please try again.' }
    finally { state.isLoading = false }
  }

  async function runDirectives() {
    state.isLoading = true
    state.error = null
    try {
      const res = await $fetch<any>('/api/playground/directives', {
        method: 'POST',
        body: { scenario: 'directive-middleware', input: { exampleId: state.exampleId } },
      })
      if (res.status === 'error') { state.error = res.error.message; return }
      state.directiveInfo = res.directive ?? null
      state.sdlExcerpt = res.schema?.sdlExcerpt ?? null
      state.diagnostics = res.diagnostics ?? []
    }
    catch { state.error = 'Request failed. Please try again.' }
    finally { state.isLoading = false }
  }

  function encodeToHash(): string {
    const s: PlaygroundHashState = {
      scenarioId: state.scenarioId,
      exampleId: state.exampleId,
      ...(state.query ? { query: state.query } : {}),
    }
    return btoa(JSON.stringify(s))
  }

  function decodeFromHash(hash: string): Partial<PlaygroundHashState> | null {
    try {
      const result = PlaygroundHashStateSchema.safeParse(JSON.parse(atob(hash)))
      return result.success ? result.data : null
    }
    catch { return null }
  }

  return {
    state,
    loadExamples,
    selectScenario,
    selectExample,
    runGenerate,
    runQuery,
    runDirectives,
    encodeToHash,
    decodeFromHash,
  }
}
