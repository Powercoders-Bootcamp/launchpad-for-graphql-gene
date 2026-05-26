# Frontend Spec

Vue 3 + Nuxt 4 playground UI and composables. Types are in [01-types.md](./01-types.md).
State is managed via composables only — no Pinia.

---

## Composable: `usePlayground.ts`

File: `composables/usePlayground.ts`

```ts
import type { ScenarioId, Example, PlaygroundHashState } from '~/types'
import type { GenerateResponse, QueryResponse, DirectivesResponse } from '~/types'

export interface PlaygroundState {
  scenarioId: ScenarioId
  exampleId: string
  query: string
  examples: Example[]
  isLoading: boolean
  error: string | null
  // Output
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

export function usePlayground() {
  const state = reactive<PlaygroundState>({ /* initial values */ })

  // Actions
  async function loadExamples(): Promise<void>
  async function selectScenario(id: ScenarioId): Promise<void>
  async function selectExample(id: string): Promise<void>
  async function runGenerate(): Promise<void>
  async function runQuery(): Promise<void>
  async function runDirectives(): Promise<void>

  // URL hash sync
  function encodeToHash(): string   // btoa(JSON.stringify({ scenarioId, exampleId, query }))
  function decodeFromHash(hash: string): Partial<PlaygroundHashState> | null

  return { state, loadExamples, selectScenario, selectExample, runGenerate, runQuery, runDirectives, encodeToHash, decodeFromHash }
}
```

Implementation rules:
- `runGenerate`, `runQuery`, and `runDirectives` set `state.isLoading = true` before the fetch and
  `false` in a `finally` block.
- `state.error` stores a user-readable message string on failure; `null` on success.
- After each action that changes `scenarioId`, `exampleId`, or `query`, call `encodeToHash()` and
  write the result to `window.location.hash`.
- `decodeFromHash` must validate with `PlaygroundHashStateSchema` (from `01-types.md`) before
  applying — invalid hashes are silently ignored.

---

## Composable: `useEditor.ts`

File: `composables/useEditor.ts`

```ts
import type * as Monaco from 'monaco-editor'

export interface EditorInstance {
  mount(el: HTMLElement, options: Monaco.editor.IStandaloneEditorConstructionOptions): Monaco.editor.IStandaloneCodeEditor
  setValue(editorId: string, value: string): void
  getValue(editorId: string): string
  dispose(editorId: string): void
  disposeAll(): void
}

export function useEditor(): EditorInstance
```

Monaco panel configurations:

| Panel ID | Language | Read-only | Purpose |
|---|---|---|---|
| `input` | `graphql` | false | User edits query |
| `sdl-output` | `graphql` | true | Generated SDL |
| `result-output` | `json` | true | Query result data |
| `sql-output` | `sql` | true | Sequelize SQL string |

Global Monaco settings for all panels:
```ts
{
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineNumbers: 'off',   // for output panels
  renderLineHighlight: 'none',
}
```

---

## Page: `pages/playground.vue`

### Component hierarchy

```
<PlaygroundPage>
  ├── <ScenarioTabs>           — tabs: model-to-schema | query-lookahead | polymorphic-blocks | directive-middleware
  ├── <ExampleSwitcher>        — dropdown/list of examples for active scenario
  ├── <InputPanel>             — Monaco editor (language: graphql, editable)
  ├── <RunButton>              — triggers runGenerate / runQuery / runDirectives
  ├── <OutputTabs>             — tabs depend on active scenario (see below)
  │   ├── <SdlOutputPanel>     — Monaco read-only, language: graphql
  │   ├── <ResultOutputPanel>  — Monaco read-only, language: json
  │   └── <SqlOutputPanel>     — Monaco read-only, language: sql
  ├── <DiagnosticsPanel>       — list of DiagnosticEntry items
  └── <LoadingOverlay>         — shown while isLoading
```

### Output tabs per scenario

| Scenario | Tabs shown |
|---|---|
| `model-to-schema` | SDL, Type Summary |
| `query-lookahead` | Result, SQL |
| `polymorphic-blocks` | Result, SQL |
| `directive-middleware` | SDL Excerpt |

### On mount

```ts
onMounted(async () => {
  // 1. Ping health endpoint to pre-warm the serverless function
  await $fetch('/api/health').catch(() => {})

  // 2. Load the example catalog
  await loadExamples()

  // 3. Check for URL hash — restore state if valid
  const hash = window.location.hash.slice(1)
  if (hash) {
    const decoded = decodeFromHash(hash)
    if (decoded?.scenarioId) await selectScenario(decoded.scenarioId)
    if (decoded?.exampleId) await selectExample(decoded.exampleId)
    if (decoded?.query) state.query = decoded.query
  }

  // 4. Check for URL search params from docs deep-links
  //    ?scenario=<id>&example=<id>
  const params = new URLSearchParams(window.location.search)
  const scenarioParam = params.get('scenario') as ScenarioId | null
  const exampleParam = params.get('example')
  if (scenarioParam) await selectScenario(scenarioParam)
  if (exampleParam) await selectExample(exampleParam)
})
```

### URL hash update

Update `window.location.hash` (without pushing a new history entry) whenever:
- `state.scenarioId` changes
- `state.exampleId` changes
- `state.query` changes (debounce 300 ms)

```ts
watch([() => state.scenarioId, () => state.exampleId], () => {
  window.location.hash = encodeToHash()
})
watchDebounced(() => state.query, () => {
  window.location.hash = encodeToHash()
}, { debounce: 300 })
```

---

## Component: `DocsPlaygroundCallout.vue`

File: `components/docs/DocsPlaygroundCallout.vue`

Rendered by `@nuxt/content` MDC when a doc page has `playgroundScenario` frontmatter.

Props:
```ts
interface Props {
  scenario: ScenarioId       // from page frontmatter
  example?: string           // optional specific example ID
  label?: string             // CTA button text (default: "Try in Playground")
}
```

Renders a visually distinct callout block with a button that navigates to:
```
/playground?scenario=<scenario>&example=<example>
```

---

## Component: `DocsSidebar.vue`

File: `components/docs/DocsSidebar.vue`

Built from `@nuxt/content` query results. No props required — reads from the store/composable.

Rendering rules:
- Group pages by `section`, sorted by `section.order` from `docs.config.ts`.
- Within each section, group by `category` (if present), then sort by `order`.
- Show `status` badge when value is `experimental`, `planned`, or `deprecated` (not `stable`).
- Active page is highlighted based on current route.

---

## Component: `DocsArticle.vue`

File: `components/docs/DocsArticle.vue`

Wraps a rendered `@nuxt/content` page. Provides:
- Page title (`h1`) from `frontmatter.title`
- "Edit on GitHub" link (optional — only include if docs are sourced from a public GitHub repo)
- Status badge when `frontmatter.status` is not `stable`
- Renders `<ContentRenderer>` for the body

---

## Error and Loading States

| State | UI |
|---|---|
| `state.isLoading === true` | Disable Run button + show spinner overlay on output panels |
| `state.error !== null` | Show inline error banner above output tabs; do not clear output panels |
| `diagnostics` not empty | Show collapsible diagnostics panel below output |
| Network failure (fetch throws) | Set `state.error` to a generic safe message |
