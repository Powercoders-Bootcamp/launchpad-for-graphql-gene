<template>
  <div class="playground-page" style="min-height: 100vh; padding: 1.5rem;">

    <!-- Scenario tabs -->
    <nav style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
      <button
        v-for="id in SCENARIO_IDS"
        :key="id"
        :style="{
          padding: '0.4rem 1rem',
          borderRadius: '8px',
          border: `1px solid ${state.scenarioId === id ? 'var(--color-pink)' : 'var(--border)'}`,
          background: state.scenarioId === id ? 'var(--color-pink)' : 'var(--panel-soft)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontFamily: 'var(--font-family-display)',
        }"
        @click="selectScenario(id)"
      >
        {{ id }}
      </button>
    </nav>

    <!-- Example switcher -->
    <select
      v-model="state.exampleId"
      style="margin-bottom: 1rem; padding: 0.4rem 0.75rem; background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 8px;"
      @change="selectExample(state.exampleId)"
    >
      <option v-for="ex in scenarioExamples" :key="ex.id" :value="ex.id">
        {{ ex.title }}
      </option>
    </select>

    <!-- Input panel -->
    <textarea
      v-model="state.query"
      :placeholder="state.scenarioId === 'model-to-schema' || state.scenarioId === 'directive-middleware'
        ? 'No query needed — just click Run.'
        : 'Enter your GraphQL query here…'"
      :disabled="state.scenarioId === 'model-to-schema' || state.scenarioId === 'directive-middleware'"
      style="width: 100%; height: 220px; background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; font-family: var(--font-family-mono); font-size: 0.875rem; resize: vertical; margin-bottom: 1rem; box-sizing: border-box; outline: none;"
    />

    <!-- Run button -->
    <button
      :disabled="state.isLoading"
      style="padding: 0.5rem 1.5rem; background: var(--color-pink); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-family: var(--font-family-display); font-weight: 600; margin-bottom: 1.5rem;"
      @click="run"
    >
      {{ state.isLoading ? 'Running…' : 'Run' }}
    </button>

    <!-- Error banner -->
    <div
      v-if="state.error"
      style="padding: 0.75rem 1rem; margin-bottom: 1rem; background: rgba(229,53,171,0.12); border: 1px solid var(--border-strong); border-radius: 8px; color: var(--text);"
    >
      {{ state.error }}
    </div>

    <!-- Output panels (pre instead of Monaco — Monaco doesn't update reactively on read-only panels) -->
    <div v-if="showSdl && sdlOutput" style="margin-bottom: 1rem;">
      <p style="color: var(--muted); font-size: 0.75rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;">
        {{ state.scenarioId === 'directive-middleware' ? 'SDL Excerpt' : 'SDL' }}
      </p>
      <pre style="background: var(--panel); color: var(--text); padding: 1.25rem; border-radius: 8px; font-family: var(--font-family-mono); font-size: 0.85rem; overflow-x: auto; white-space: pre; border: 1px solid var(--border); max-height: 400px; overflow-y: auto;">{{ sdlOutput }}</pre>
    </div>

    <div v-if="showResult && resultJson" style="margin-bottom: 1rem;">
      <p style="color: var(--muted); font-size: 0.75rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;">Result</p>
      <pre style="background: var(--panel); color: var(--text); padding: 1.25rem; border-radius: 8px; font-family: var(--font-family-mono); font-size: 0.85rem; overflow-x: auto; white-space: pre; border: 1px solid var(--border); max-height: 400px; overflow-y: auto;">{{ resultJson }}</pre>
    </div>

    <div v-if="showSql && state.sql" style="margin-bottom: 1rem;">
      <p style="color: var(--muted); font-size: 0.75rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;">SQL</p>
      <pre style="background: var(--panel); color: var(--text); padding: 1.25rem; border-radius: 8px; font-family: var(--font-family-mono); font-size: 0.85rem; overflow-x: auto; white-space: pre; border: 1px solid var(--border);">{{ state.sql }}</pre>
    </div>

    <!-- Diagnostics -->
    <ul v-if="state.diagnostics.length" style="padding: 0; list-style: none; margin-top: 1rem;">
      <li
        v-for="(d, i) in state.diagnostics"
        :key="i"
        style="padding: 0.4rem 0.75rem; font-size: 0.85rem; color: var(--muted); border-left: 2px solid var(--border-strong);"
      >
        {{ d.message }}
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { SCENARIO_IDS, type ScenarioId } from '~/types'
import { usePlayground } from '~/composables/usePlayground'
import { useEditor } from '~/composables/useEditor'

useSeoMeta({ title: 'Playground — graphql-gene' })

const { state, loadExamples, selectScenario, selectExample, runGenerate, runQuery, runDirectives, encodeToHash, decodeFromHash } = usePlayground()
const { getOptions } = useEditor()

function editorOptions(panel: Parameters<typeof getOptions>[0]) {
  return { options: getOptions(panel) }
}

const scenarioExamples = computed(() =>
  state.examples.filter(e => e.scenario === state.scenarioId),
)

// Which output panels are visible per scenario
const showSdl = computed(() =>
  state.scenarioId === 'model-to-schema' || state.scenarioId === 'directive-middleware',
)
const showResult = computed(() =>
  state.scenarioId === 'query-lookahead' || state.scenarioId === 'polymorphic-blocks',
)
const showSql = computed(() =>
  state.scenarioId === 'query-lookahead' || state.scenarioId === 'polymorphic-blocks',
)

const resultJson = computed(() =>
  state.queryResult ? JSON.stringify(state.queryResult, null, 2) : '',
)

const sdlOutput = computed(() =>
  state.scenarioId === 'directive-middleware'
    ? (state.sdlExcerpt ?? '')
    : (state.sdl ?? ''),
)

function run() {
  if (state.scenarioId === 'model-to-schema') return runGenerate()
  if (state.scenarioId === 'query-lookahead' || state.scenarioId === 'polymorphic-blocks') return runQuery()
  if (state.scenarioId === 'directive-middleware') return runDirectives()
}

// URL hash sync
const updateHash = useDebounceFn(() => {
  if (import.meta.client) window.location.hash = encodeToHash()
}, 300)

watch([() => state.scenarioId, () => state.exampleId], () => {
  if (import.meta.client) window.location.hash = encodeToHash()
})
watch(() => state.query, updateHash)

onMounted(async () => {
  // Pre-warm the serverless function
  $fetch('/api/health').catch(() => {})

  await loadExamples()

  // Restore from URL hash
  const hash = window.location.hash.slice(1)
  if (hash) {
    const decoded = decodeFromHash(hash)
    if (decoded?.scenarioId) await selectScenario(decoded.scenarioId as ScenarioId)
    if (decoded?.exampleId) await selectExample(decoded.exampleId)
    if (decoded?.query) state.query = decoded.query
    return
  }

  // Restore from query params (docs deep-link: ?scenario=X&example=Y)
  const params = new URLSearchParams(window.location.search)
  const scenarioParam = params.get('scenario') as ScenarioId | null
  const exampleParam = params.get('example')
  if (scenarioParam && (SCENARIO_IDS as readonly string[]).includes(scenarioParam)) {
    await selectScenario(scenarioParam)
  }
  if (exampleParam) await selectExample(exampleParam)
})
</script>
