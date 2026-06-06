import { reactive } from 'vue'
import type {
  DiagnosticEntry,
  DirectivesResponse,
  Example,
  ExamplesResponse,
  GenerateResponse,
  PlaygroundHashState,
  QueryResponse,
  ScenarioId,
  TypeSummaryEntry,
} from '~/types'
import { PlaygroundHashStateSchema } from '~/types'

type DirectiveMode = 'named' | 'anonymous'

type GenerateState = {
  includeOrders: boolean
  includeAddress: boolean
  showTypeSummary: boolean
}

const DEFAULT_QUERY_BY_SCENARIO: Partial<Record<ScenarioId, string>> = {
  'query-lookahead': `query MeWithOrders {
  me {
    id
    email
    name
    address
    orders {
      id
      status
      total
    }
  }
}`,
  'polymorphic-blocks': `query HomePageBlocks {
  page(slug: "/home") {
    id
    slug
    blocks {
      __typename
      ... on HeroBlock {
        id
        headline
      }
      ... on TextBlock {
        id
        body
      }
    }
  }
}`,
}

export interface PlaygroundState {
  scenarioId: ScenarioId
  exampleId: string
  query: string
  examples: Example[]
  isLoading: boolean
  error: string | null
  generate: GenerateState
  directiveMode: DirectiveMode
  sdl: string | null
  typeSummary: TypeSummaryEntry[] | null
  queryResult: Record<string, unknown> | null
  includeGraph: Record<string, string[]> | null
  sql: string | null
  executionNotes: string[]
  directiveInfo: DirectivesResponse['directive'] | null
  sdlExcerpt: string | null
  diagnostics: DiagnosticEntry[]
}

function getDefaultQuery(scenarioId: ScenarioId) {
  return DEFAULT_QUERY_BY_SCENARIO[scenarioId] ?? ''
}

export function usePlayground() {
  const state = reactive<PlaygroundState>({
    scenarioId: 'model-to-schema',
    exampleId: '',
    query: getDefaultQuery('model-to-schema'),
    examples: [],
    isLoading: false,
    error: null,
    generate: {
      includeOrders: true,
      includeAddress: true,
      showTypeSummary: true,
    },
    directiveMode: 'named',
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

  function applyScenarioDefaults(id: ScenarioId) {
    state.query = getDefaultQuery(id)
    if (id === 'directive-middleware') {
      state.directiveMode = 'named'
    }
  }

  async function loadExamples() {
    try {
      const response = await $fetch<ExamplesResponse>('/api/playground/examples')
      state.examples = response.examples
      const first = state.examples.find(example => example.scenario === state.scenarioId)
      if (first && !state.exampleId) {
        state.exampleId = first.id
      }
      applyScenarioDefaults(state.scenarioId)
    }
    catch {
      state.error = 'Failed to load examples.'
    }
  }

  async function selectScenario(id: ScenarioId) {
    state.scenarioId = id
    clearOutput()
    const first = state.examples.find(example => example.scenario === id)
    state.exampleId = first?.id ?? ''
    applyScenarioDefaults(id)
  }

  async function selectExample(id: string) {
    state.exampleId = id
    clearOutput()
    if (state.scenarioId === 'query-lookahead' || state.scenarioId === 'polymorphic-blocks') {
      state.query = getDefaultQuery(state.scenarioId)
    }
  }

  function resetQueryToDefault() {
    state.query = getDefaultQuery(state.scenarioId)
    state.error = null
  }

  async function runGenerate() {
    state.isLoading = true
    state.error = null

    try {
      const response = await $fetch<GenerateResponse>('/api/playground/generate', {
        method: 'POST',
        body: {
          scenario: 'model-to-schema',
          input: {
            exampleId: state.exampleId,
            modelEdits: {
              includeOrders: state.generate.includeOrders,
              includeAddress: state.generate.includeAddress,
            },
            options: {
              showTypeSummary: state.generate.showTypeSummary,
            },
          },
        },
      })

      state.sdl = response.schema?.sdl ?? null
      state.typeSummary = response.schema?.typeSummary ?? null
      state.diagnostics = response.diagnostics ?? []
    }
    catch (error) {
      state.error = readFetchError(error, 'Schema generation failed. Please try again.')
    }
    finally {
      state.isLoading = false
    }
  }

  async function runQuery() {
    state.isLoading = true
    state.error = null

    try {
      const response = await $fetch<QueryResponse>('/api/playground/query', {
        method: 'POST',
        body: {
          scenario: state.scenarioId,
          input: {
            exampleId: state.exampleId,
            query: state.query,
            variables: {},
          },
        },
      })

      state.queryResult = response.result?.data ?? null
      state.includeGraph = response.execution?.includeGraph ?? null
      state.sql = response.execution?.sql ?? null
      state.executionNotes = response.execution?.notes ?? []
      state.diagnostics = response.diagnostics ?? []
    }
    catch (error) {
      state.error = readFetchError(error, 'Query execution failed. Please try again.')
    }
    finally {
      state.isLoading = false
    }
  }

  async function runDirectives() {
    state.isLoading = true
    state.error = null

    try {
      const response = await $fetch<DirectivesResponse>('/api/playground/directives', {
        method: 'POST',
        body: {
          scenario: 'directive-middleware',
          input: {
            exampleId: state.exampleId,
            directiveMode: state.directiveMode,
          },
        },
      })

      state.directiveInfo = response.directive ?? null
      state.sdlExcerpt = response.schema?.sdlExcerpt ?? null
      state.diagnostics = response.diagnostics ?? []
    }
    catch (error) {
      state.error = readFetchError(error, 'Directive scenario failed. Please try again.')
    }
    finally {
      state.isLoading = false
    }
  }

  function encodeToHash(): string {
    const payload: PlaygroundHashState = {
      scenarioId: state.scenarioId,
      exampleId: state.exampleId,
      ...(state.query ? { query: state.query } : {}),
    }

    return btoa(JSON.stringify(payload))
  }

  function decodeFromHash(hash: string): Partial<PlaygroundHashState> | null {
    try {
      const result = PlaygroundHashStateSchema.safeParse(JSON.parse(atob(hash)))
      return result.success ? result.data : null
    }
    catch {
      return null
    }
  }

  return {
    state,
    loadExamples,
    selectScenario,
    selectExample,
    resetQueryToDefault,
    runGenerate,
    runQuery,
    runDirectives,
    encodeToHash,
    decodeFromHash,
  }
}

function readFetchError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { error?: { message?: string } } }).data
    if (data?.error?.message) {
      return data.error.message
    }
  }

  return fallback
}
