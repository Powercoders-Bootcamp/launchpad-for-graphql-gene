<template>
  <main class="playground-page">
    <header class="playground-hero">
      <div class="playground-hero-copy">
        <p class="playground-eyebrow">Interactive Playground</p>
        <h1>{{ activeScenarioTitle }}</h1>
        <p class="playground-lede">
          {{ activeExample?.description ?? 'Run a scenario and inspect the generated output.' }}
        </p>
      </div>

      <div class="playground-hero-actions">
        <button
          v-if="isQueryScenario"
          class="playground-button playground-button--ghost"
          type="button"
          @click="resetQueryToDefault"
        >
          Reset query
        </button>

        <button
          class="playground-button playground-button--primary"
          type="button"
          :disabled="state.isLoading"
          @click="run"
        >
          {{ state.isLoading ? 'Running...' : 'Run scenario' }}
        </button>
      </div>
    </header>

    <section class="playground-toolbar">
      <nav class="playground-scenarios" aria-label="Scenarios">
        <button
          v-for="id in SCENARIO_IDS"
          :key="id"
          class="playground-scenario-pill"
          :class="{ 'is-active': state.scenarioId === id }"
          type="button"
          @click="selectScenario(id)"
        >
          {{ scenarioTitles[id] }}
        </button>
      </nav>

      <label class="playground-field">
        <span class="playground-field-label">Example</span>
        <select
          v-model="state.exampleId"
          class="playground-select"
          @change="selectExample(state.exampleId)"
        >
          <option v-for="example in scenarioExamples" :key="example.id" :value="example.id">
            {{ example.title }}
          </option>
        </select>
      </label>
    </section>

    <section class="playground-layout" :class="{ 'is-query': isQueryScenario }">
      <aside class="playground-input-column">
        <article class="playground-card">
          <div class="playground-card-head">
            <div>
              <p class="playground-section-label">{{ isQueryScenario ? 'Query' : 'Options' }}</p>
              <strong>{{ isQueryScenario ? 'Editable request input' : 'Scenario configuration' }}</strong>
            </div>
          </div>

          <textarea
            v-if="isQueryScenario"
            v-model="state.query"
            class="playground-textarea"
            placeholder="Enter your GraphQL query here..."
          />

          <div v-else-if="state.scenarioId === 'model-to-schema'" class="playground-control-stack">
            <label class="playground-toggle-card">
              <input v-model="state.generate.includeOrders" type="checkbox">
              <span>
                <strong>Include orders</strong>
                <small>Add the `orders` association to the generated schema.</small>
              </span>
            </label>

            <label class="playground-toggle-card">
              <input v-model="state.generate.includeAddress" type="checkbox">
              <span>
                <strong>Include address</strong>
                <small>Expose the `address` field in the generated type.</small>
              </span>
            </label>

            <label class="playground-toggle-card">
              <input v-model="state.generate.showTypeSummary" type="checkbox">
              <span>
                <strong>Return type summary</strong>
                <small>Print the generated type map alongside the SDL output.</small>
              </span>
            </label>
          </div>

          <div v-else class="playground-control-stack">
            <label class="playground-field">
              <span class="playground-field-label">Directive mode</span>
              <select v-model="state.directiveMode" class="playground-select">
                <option value="named">Named directive</option>
                <option value="anonymous">Anonymous runtime middleware</option>
              </select>
            </label>

            <p class="playground-help-text">
              Compare schema output when middleware is represented as a named directive versus an
              anonymous runtime behavior.
            </p>
          </div>
        </article>

        <article v-if="isQueryScenario" class="playground-card playground-card--muted">
          <p class="playground-section-label">Hint</p>
          <p class="playground-help-text">
            Query scenarios restore a curated default query when you switch examples, so it is easy
            to compare runtime output without manually rebuilding the request.
          </p>
        </article>

        <article v-if="state.directiveInfo" class="playground-card playground-card--muted">
          <p class="playground-section-label">Directive behavior</p>
          <div class="playground-meta-grid">
            <div>
              <strong>Name</strong>
              <p>{{ state.directiveInfo.name || '(anonymous middleware)' }}</p>
            </div>
            <div>
              <strong>Printed to schema</strong>
              <p>{{ state.directiveInfo.printsToSchema ? 'Yes' : 'No' }}</p>
            </div>
            <div class="playground-meta-grid-span">
              <strong>Runtime summary</strong>
              <p>{{ state.directiveInfo.runtimeBehaviorSummary }}</p>
            </div>
          </div>
        </article>
      </aside>

      <section class="playground-output-column">
        <div v-if="state.error" class="playground-error">
          {{ state.error }}
        </div>

        <div class="playground-panels">
          <article v-if="state.scenarioId === 'model-to-schema'" class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">SDL</p>
                <strong>Generated schema</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!state.sdl"
                @click="copyText(state.sdl, 'sdl')"
              >
                {{ copiedPanel === 'sdl' ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <pre class="playground-code">{{ state.sdl ?? 'Run schema generation to inspect the SDL output.' }}</pre>
          </article>

          <article v-if="state.scenarioId === 'model-to-schema'" class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">Type Summary</p>
                <strong>Generated type map</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!typeSummaryText"
                @click="copyText(typeSummaryText, 'type-summary')"
              >
                {{ copiedPanel === 'type-summary' ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <pre class="playground-code playground-code--compact">{{ typeSummaryDisplayText }}</pre>
          </article>

          <article v-if="isQueryScenario" class="playground-card playground-panel playground-panel--wide">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">Result</p>
                <strong>GraphQL response payload</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!resultJson"
                @click="copyText(resultJson, 'result')"
              >
                {{ copiedPanel === 'result' ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <pre class="playground-code">{{ resultDisplayText }}</pre>
          </article>

          <article v-if="isQueryScenario" class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">SQL</p>
                <strong>Captured Sequelize statements</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!state.sql"
                @click="copyText(state.sql, 'sql')"
              >
                {{ copiedPanel === 'sql' ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <pre class="playground-code playground-code--compact">{{ state.sql ?? 'Run the query scenario to capture SQL output.' }}</pre>
          </article>

          <article v-if="isQueryScenario" class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">Include Graph</p>
                <strong>Requested association plan</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!includeGraphText"
                @click="copyText(includeGraphText, 'include-graph')"
              >
                {{ copiedPanel === 'include-graph' ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <pre class="playground-code playground-code--compact">{{ includeGraphDisplayText }}</pre>
          </article>

          <article v-if="isQueryScenario" class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">Execution Notes</p>
                <strong>Runtime interpretation</strong>
              </div>
            </div>

            <ul class="playground-list">
              <li v-for="note in state.executionNotes" :key="note">{{ note }}</li>
              <li v-if="!state.executionNotes.length">Run a query scenario to inspect runtime notes.</li>
            </ul>
          </article>

          <article v-if="state.scenarioId === 'directive-middleware'" class="playground-card playground-panel playground-panel--wide">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">Directive SDL</p>
                <strong>Schema excerpt</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!state.sdlExcerpt"
                @click="copyText(state.sdlExcerpt, 'directive-sdl')"
              >
                {{ copiedPanel === 'directive-sdl' ? 'Copied' : 'Copy' }}
              </button>
            </div>

            <pre class="playground-code">{{ state.sdlExcerpt ?? 'Run the directive scenario to inspect the SDL excerpt.' }}</pre>
          </article>
        </div>

        <details v-if="state.diagnostics.length" class="playground-card playground-diagnostics" open>
          <summary>Diagnostics ({{ state.diagnostics.length }})</summary>
          <ul class="playground-list">
            <li v-for="(diagnostic, index) in state.diagnostics" :key="`${diagnostic.message}-${index}`">
              <strong>{{ diagnostic.level.toUpperCase() }}:</strong> {{ diagnostic.message }}
            </li>
          </ul>
        </details>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { SCENARIO_IDS, type ScenarioId } from '~/types'
import { usePlayground } from '~/composables/usePlayground'

useSeoMeta({
  title: 'Playground - graphql-gene',
  description: 'Inspect SDL, SQL, result payloads, and directive behavior with the graphql-gene playground.',
})

const scenarioTitles: Record<ScenarioId, string> = {
  'model-to-schema': 'Model to schema',
  'query-lookahead': 'Query lookahead',
  'polymorphic-blocks': 'Polymorphic blocks',
  'directive-middleware': 'Directive middleware',
}

const {
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
} = usePlayground()

const copiedPanel = ref<string | null>(null)

const scenarioExamples = computed(() =>
  state.examples.filter(example => example.scenario === state.scenarioId),
)

const activeExample = computed(() =>
  state.examples.find(example => example.id === state.exampleId && example.scenario === state.scenarioId),
)

const activeScenarioTitle = computed(() => scenarioTitles[state.scenarioId])

const isQueryScenario = computed(() =>
  state.scenarioId === 'query-lookahead' || state.scenarioId === 'polymorphic-blocks',
)

const resultJson = computed(() =>
  state.queryResult ? JSON.stringify(state.queryResult, null, 2) : '',
)

const resultDisplayText = computed(() =>
  resultJson.value || 'Run the query scenario to inspect the GraphQL response payload.',
)

const includeGraphText = computed(() =>
  state.includeGraph ? JSON.stringify(state.includeGraph, null, 2) : '',
)

const includeGraphDisplayText = computed(() =>
  includeGraphText.value || 'Run the query scenario to inspect include planning.',
)

const typeSummaryText = computed(() =>
  state.typeSummary?.length ? JSON.stringify(state.typeSummary, null, 2) : '',
)

const typeSummaryDisplayText = computed(() => {
  if (!state.generate.showTypeSummary) {
    return 'Enable "Return type summary" and rerun schema generation to inspect the type map.'
  }

  return typeSummaryText.value || 'Run schema generation to inspect the generated type map.'
})

async function copyText(text: string | null, panel: string) {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    copiedPanel.value = panel

    window.setTimeout(() => {
      if (copiedPanel.value === panel) {
        copiedPanel.value = null
      }
    }, 1600)
  }
  catch (error) {
    console.error('Copy failed', error)
  }
}

function run() {
  if (state.scenarioId === 'model-to-schema') {
    return runGenerate()
  }

  if (state.scenarioId === 'directive-middleware') {
    return runDirectives()
  }

  return runQuery()
}

const updateHash = useDebounceFn(() => {
  if (import.meta.client) {
    window.location.hash = encodeToHash()
  }
}, 300)

watch([() => state.scenarioId, () => state.exampleId], () => {
  if (import.meta.client) {
    window.location.hash = encodeToHash()
  }
})

watch(() => state.query, updateHash)

onMounted(async () => {
  $fetch('/api/health').catch(() => {})

  await loadExamples()

  const hash = window.location.hash.slice(1)
  if (hash) {
    const decoded = decodeFromHash(hash)
    if (decoded?.scenarioId) {
      await selectScenario(decoded.scenarioId as ScenarioId)
    }
    if (decoded?.exampleId) {
      await selectExample(decoded.exampleId)
    }
    if (decoded?.query) {
      state.query = decoded.query
    }
    return
  }

  const params = new URLSearchParams(window.location.search)
  const scenarioParam = params.get('scenario') as ScenarioId | null
  const exampleParam = params.get('example')

  if (scenarioParam && (SCENARIO_IDS as readonly string[]).includes(scenarioParam)) {
    await selectScenario(scenarioParam)
  }

  if (exampleParam) {
    await selectExample(exampleParam)
  }
})
</script>

<style scoped>
.playground-page {
  --playground-panel: color-mix(in srgb, var(--panel, #171d2f) 92%, transparent);
  --playground-panel-soft: color-mix(in srgb, var(--panel-soft, rgba(255, 255, 255, 0.05)) 100%, transparent);
  --playground-border: var(--border, rgba(255, 255, 255, 0.08));
  --playground-border-strong: var(--border-strong, rgba(229, 53, 171, 0.24));

  min-height: 100vh;
  padding: 1.25rem;
}

.playground-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.playground-hero-copy h1 {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.playground-eyebrow,
.playground-section-label,
.playground-field-label {
  margin: 0 0 0.45rem;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.playground-lede {
  margin: 0.75rem 0 0;
  max-width: 64ch;
  color: var(--muted);
  line-height: 1.7;
}

.playground-hero-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.playground-button,
.playground-copy-button,
.playground-scenario-pill,
.playground-select,
.playground-textarea {
  font: inherit;
}

.playground-button,
.playground-copy-button,
.playground-scenario-pill {
  border-radius: 999px;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.playground-button {
  border: 1px solid var(--playground-border);
  padding: 0.72rem 1.1rem;
  cursor: pointer;
}

.playground-button--primary {
  background: var(--color-pink, #e535ab);
  border-color: transparent;
  color: #fff;
  font-weight: 700;
}

.playground-button--ghost {
  background: var(--playground-panel-soft);
  color: var(--text);
}

.playground-button:hover:not(:disabled),
.playground-copy-button:hover:not(:disabled),
.playground-scenario-pill:hover {
  transform: translateY(-1px);
}

.playground-button:disabled,
.playground-copy-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  transform: none;
}

.playground-toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--playground-border);
  border-radius: 18px;
  background: var(--playground-panel-soft);
  margin-bottom: 1.25rem;
}

.playground-scenarios {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.playground-scenario-pill {
  border: 1px solid var(--playground-border);
  background: var(--playground-panel);
  color: var(--muted);
  padding: 0.6rem 0.95rem;
  cursor: pointer;
}

.playground-scenario-pill.is-active {
  color: #fff;
  background: var(--color-pink, #e535ab);
  border-color: transparent;
}

.playground-field {
  display: flex;
  flex-direction: column;
  min-width: min(20rem, 100%);
}

.playground-select {
  min-height: 2.8rem;
  border: 1px solid var(--playground-border);
  border-radius: 12px;
  background: var(--playground-panel);
  color: var(--text);
  padding: 0.65rem 0.85rem;
}

.playground-layout {
  display: grid;
  grid-template-columns: minmax(18rem, 26rem) minmax(0, 1fr);
  gap: 1.25rem;
}

.playground-input-column,
.playground-output-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playground-card {
  border: 1px solid var(--playground-border);
  border-radius: 18px;
  background: var(--playground-panel);
  box-shadow: var(--shadow);
}

.playground-card--muted {
  background: var(--playground-panel-soft);
}

.playground-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0;
}

.playground-card-head strong {
  display: block;
}

.playground-textarea {
  width: calc(100% - 2rem);
  min-height: 24rem;
  margin: 1rem;
  border: 1px solid var(--playground-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--playground-panel) 94%, transparent);
  color: var(--text);
  padding: 1rem;
  resize: vertical;
  font-family: var(--font-family-mono);
  font-size: 0.9rem;
  line-height: 1.7;
}

.playground-control-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
}

.playground-toggle-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border: 1px solid var(--playground-border);
  border-radius: 14px;
  background: var(--playground-panel-soft);
}

.playground-toggle-card input {
  margin-top: 0.2rem;
}

.playground-toggle-card strong {
  display: block;
  margin-bottom: 0.3rem;
}

.playground-toggle-card small,
.playground-help-text,
.playground-meta-grid p,
.playground-list {
  color: var(--muted);
}

.playground-help-text {
  margin: 0;
  line-height: 1.7;
}

.playground-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.playground-panel--wide {
  grid-column: 1 / -1;
}

.playground-copy-button {
  border: 1px solid var(--playground-border);
  background: var(--playground-panel-soft);
  color: var(--text);
  padding: 0.45rem 0.75rem;
  cursor: pointer;
}

.playground-code {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid var(--playground-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--playground-panel) 94%, transparent);
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  font-family: var(--font-family-mono);
  font-size: 0.87rem;
  line-height: 1.7;
  min-height: 14rem;
}

.playground-code--compact {
  min-height: 11rem;
}

.playground-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.playground-meta-grid strong {
  display: block;
  margin-bottom: 0.35rem;
}

.playground-meta-grid p {
  margin: 0;
  line-height: 1.6;
}

.playground-meta-grid-span {
  grid-column: 1 / -1;
}

.playground-list {
  margin: 0;
  padding: 0 1.25rem 1.15rem 2.25rem;
  line-height: 1.7;
}

.playground-error {
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--playground-border-strong);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-pink, #e535ab) 12%, transparent);
  color: var(--text);
}

.playground-diagnostics {
  margin-top: 1rem;
}

.playground-diagnostics summary {
  cursor: pointer;
  padding: 1rem;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .playground-panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .playground-page {
    padding: 1rem;
  }

  .playground-hero,
  .playground-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .playground-field {
    min-width: 100%;
  }

  .playground-meta-grid {
    grid-template-columns: 1fr;
  }

  .playground-meta-grid-span {
    grid-column: auto;
  }
}
</style>
