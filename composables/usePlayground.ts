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
  const { t } = useI18n()
  let latestRequestToken = 0

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
    latestRequestToken += 1
    state.isLoading = false
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
      state.error = t('playground.errors.loadExamples')
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

  function markDirty() {
    latestRequestToken += 1
    state.isLoading = false
    state.error = null
  }

  function beginRequest() {
    const token = ++latestRequestToken
    state.isLoading = true
    state.error = null
    return token
  }

  function isLatestRequest(token: number) {
    return token === latestRequestToken
  }

  function finishRequest(token: number) {
    if (isLatestRequest(token)) {
      state.isLoading = false
    }
  }

  async function runGenerate() {
    const token = beginRequest()

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

      if (!isLatestRequest(token)) {
        return
      }

      state.sdl = response.schema?.sdl ?? null
      state.typeSummary = response.schema?.typeSummary ?? null
      state.diagnostics = response.diagnostics ?? []
    }
    catch (error) {
      if (isLatestRequest(token)) {
        state.error = readFetchError(error, t('playground.errors.generate'))
      }
    }
    finally {
      finishRequest(token)
    }
  }

  async function runQuery() {
    const token = beginRequest()

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

      if (!isLatestRequest(token)) {
        return
      }

      state.queryResult = response.result?.data ?? null
      state.includeGraph = response.execution?.includeGraph ?? null
      state.sql = response.execution?.sql ?? null
      state.executionNotes = response.execution?.notes ?? []
      state.diagnostics = response.diagnostics ?? []
    }
    catch (error) {
      if (isLatestRequest(token)) {
        state.error = readFetchError(error, t('playground.errors.query'))
      }
    }
    finally {
      finishRequest(token)
    }
  }

  async function runDirectives() {
    const token = beginRequest()

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

      if (!isLatestRequest(token)) {
        return
      }

      state.directiveInfo = response.directive ?? null
      state.sdlExcerpt = response.schema?.sdlExcerpt ?? null
      state.diagnostics = response.diagnostics ?? []
    }
    catch (error) {
      if (isLatestRequest(token)) {
        state.error = readFetchError(error, t('playground.errors.directives'))
      }
    }
    finally {
      finishRequest(token)
    }
  }

  function encodeToHash(): string {
    const payload: PlaygroundHashState = {
      scenarioId: state.scenarioId,
      exampleId: state.exampleId,
      ...(state.query ? { query: state.query } : {}),
    }

    return toBase64Url(JSON.stringify(payload))
  }

  function decodeFromHash(hash: string): Partial<PlaygroundHashState> | null {
    try {
      const result = PlaygroundHashStateSchema.safeParse(JSON.parse(fromBase64Url(hash)))
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
    markDirty,
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

function toBase64Url(value: string) {
  return btoa(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const normalized = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')

  const padding = normalized.length % 4
  const padded = padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), '=')

  return atob(padded)
}
