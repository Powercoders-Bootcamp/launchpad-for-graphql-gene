<template>
  <main class="playground-page">
    <header class="playground-hero">
      <div class="playground-hero-copy">
        <h1>{{ activeScenarioTitle }}</h1>
        <p class="playground-lede">
          {{ activeExample?.description ?? t('playground.defaultLead') }}
        </p>
      </div>

      <div class="playground-hero-actions">
        <button
          v-if="isQueryScenario"
          class="playground-button playground-button--ghost"
          type="button"
          @click="resetQueryToDefault"
        >
          {{ t('playground.resetQuery') }}
        </button>

        <button
          class="playground-button playground-button--secondary"
          type="button"
          :disabled="state.isLoading"
          @click="run"
        >
          {{ state.isLoading ? t('playground.refreshing') : t('playground.refreshNow') }}
        </button>
      </div>
    </header>

    <section class="playground-toolbar-shell">
      <div class="playground-toolbar">
        <nav class="playground-scenarios" :aria-label="t('playground.scenariosAria')">
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
          <select
            v-model="state.exampleId"
            class="playground-select"
            :aria-label="t('playground.exampleAria')"
            @change="selectExample(state.exampleId)"
          >
            <option v-for="example in scenarioExamples" :key="example.id" :value="example.id">
              {{ example.title }}
            </option>
          </select>
        </label>
      </div>

      <div class="playground-overview">
        <div class="playground-overview-copy">
          <h2>{{ activeScenarioOverview.title }}</h2>
          <p>
            {{ activeScenarioOverview.description }}
          </p>
          <div v-if="isQueryScenario" class="playground-overview-note">
            <span class="playground-overview-note-label">{{ t('playground.executionNotes') }}</span>
            <p>{{ executionNotesSummary }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="playground-layout">
      <aside ref="inputColumnRef" class="playground-column playground-column--input">
        <article ref="inputCardRef" class="playground-card playground-card--editor">
          <div class="playground-card-head">
            <div>
              <p class="playground-section-label">{{ isQueryScenario ? t('playground.panels.query') : t('playground.panels.options') }}</p>
              <strong>{{ isQueryScenario ? t('playground.panels.editableRequestInput') : t('playground.panels.scenarioConfiguration') }}</strong>
            </div>
          </div>

          <textarea
            v-if="isQueryScenario"
            v-model="state.query"
            class="playground-textarea"
            :placeholder="t('playground.placeholder')"
          />

          <div v-else-if="state.scenarioId === 'model-to-schema'" class="playground-control-stack">
            <label class="playground-toggle-card">
              <input v-model="state.generate.includeOrders" type="checkbox">
              <span>
                <strong>{{ t('playground.toggles.includeOrdersTitle') }}</strong>
                <small>{{ t('playground.toggles.includeOrdersDescription') }}</small>
              </span>
            </label>

            <label class="playground-toggle-card">
              <input v-model="state.generate.includeAddress" type="checkbox">
              <span>
                <strong>{{ t('playground.toggles.includeAddressTitle') }}</strong>
                <small>{{ t('playground.toggles.includeAddressDescription') }}</small>
              </span>
            </label>

            <label class="playground-toggle-card">
              <input v-model="state.generate.showTypeSummary" type="checkbox">
              <span>
                <strong>{{ t('playground.toggles.showTypeSummaryTitle') }}</strong>
                <small>{{ t('playground.toggles.showTypeSummaryDescription') }}</small>
              </span>
            </label>
          </div>

          <div v-else class="playground-control-stack">
            <label class="playground-field">
              <select v-model="state.directiveMode" class="playground-select" :aria-label="t('playground.directiveModeAria')">
                <option value="named">{{ t('playground.directiveModes.named') }}</option>
                <option value="anonymous">{{ t('playground.directiveModes.anonymous') }}</option>
              </select>
            </label>

            <p class="playground-help-text">
              {{ t('playground.directiveHelp') }}
            </p>
          </div>
        </article>

      </aside>

      <section ref="primaryColumnRef" class="playground-column playground-column--primary">
        <div v-if="state.error" class="playground-error">
          {{ state.error }}
        </div>

        <article v-if="state.scenarioId === 'model-to-schema'" ref="primaryPanelRef" class="playground-card playground-panel">
          <div class="playground-card-head">
            <div>
              <p class="playground-section-label">{{ t('playground.panels.sdl') }}</p>
              <strong>{{ t('playground.panels.generatedSchema') }}</strong>
            </div>

            <button
              class="playground-copy-button"
              type="button"
              :disabled="!state.sdl"
              @click="copyText(state.sdl, 'sdl')"
            >
              {{ copiedPanel === 'sdl' ? t('playground.copied') : t('playground.copy') }}
            </button>
          </div>

          <pre class="playground-code playground-code--primary"><code v-html="sdlDisplayHtml" /></pre>
        </article>

        <article v-if="isQueryScenario" ref="primaryPanelRef" class="playground-card playground-panel">
          <div class="playground-card-head">
            <div>
              <p class="playground-section-label">{{ t('playground.panels.result') }}</p>
              <strong>{{ t('playground.panels.responsePayload') }}</strong>
            </div>

            <button
              class="playground-copy-button"
              type="button"
              :disabled="!resultJson"
              @click="copyText(resultJson, 'result')"
            >
              {{ copiedPanel === 'result' ? t('playground.copied') : t('playground.copy') }}
            </button>
          </div>

          <pre class="playground-code playground-code--primary"><code v-html="resultDisplayHtml" /></pre>
        </article>

        <article v-if="state.scenarioId === 'directive-middleware'" ref="primaryPanelRef" class="playground-card playground-panel">
          <div class="playground-card-head">
            <div>
              <p class="playground-section-label">{{ t('playground.panels.directiveSdl') }}</p>
              <strong>{{ t('playground.panels.schemaExcerpt') }}</strong>
            </div>

            <button
              class="playground-copy-button"
              type="button"
              :disabled="!state.sdlExcerpt"
              @click="copyText(state.sdlExcerpt, 'directive-sdl')"
            >
              {{ copiedPanel === 'directive-sdl' ? t('playground.copied') : t('playground.copy') }}
            </button>
          </div>

          <pre class="playground-code playground-code--primary"><code v-html="directiveSdlDisplayHtml" /></pre>
        </article>
      </section>

      <aside ref="secondaryColumnRef" class="playground-column playground-column--secondary">
        <article
          v-if="state.scenarioId === 'model-to-schema'"
          ref="secondaryPanelRef"
          class="playground-card playground-panel"
        >
          <div class="playground-card-head">
            <div>
              <p class="playground-section-label">{{ t('playground.panels.typeSummary') }}</p>
              <strong>{{ t('playground.panels.generatedTypeMap') }}</strong>
            </div>

            <button
              class="playground-copy-button"
              type="button"
              :disabled="!typeSummaryText"
              @click="copyText(typeSummaryText, 'type-summary')"
            >
              {{ copiedPanel === 'type-summary' ? t('playground.copied') : t('playground.copy') }}
            </button>
          </div>

          <pre class="playground-code playground-code--secondary"><code v-html="typeSummaryDisplayHtml" /></pre>
        </article>

        <template v-if="isQueryScenario">
          <article ref="secondaryPanelRef" class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">{{ t('playground.panels.sql') }}</p>
                <strong>{{ t('playground.panels.capturedSql') }}</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!state.sql"
                @click="copyText(state.sql, 'sql')"
              >
                {{ copiedPanel === 'sql' ? t('playground.copied') : t('playground.copy') }}
              </button>
            </div>

            <pre class="playground-code playground-code--secondary"><code v-html="sqlDisplayHtml" /></pre>
          </article>

          <article class="playground-card playground-panel">
            <div class="playground-card-head">
              <div>
                <p class="playground-section-label">{{ t('playground.panels.includeGraph') }}</p>
                <strong>{{ t('playground.panels.associationPlan') }}</strong>
              </div>

              <button
                class="playground-copy-button"
                type="button"
                :disabled="!includeGraphText"
                @click="copyText(includeGraphText, 'include-graph')"
              >
                {{ copiedPanel === 'include-graph' ? t('playground.copied') : t('playground.copy') }}
              </button>
            </div>

            <pre class="playground-code playground-code--secondary"><code v-html="includeGraphDisplayHtml" /></pre>
          </article>

        </template>

        <details v-if="state.diagnostics.length" class="playground-card playground-diagnostics" open>
          <summary>{{ t('playground.panels.diagnostics') }} ({{ state.diagnostics.length }})</summary>
          <ul class="playground-list">
            <li v-for="(diagnostic, index) in state.diagnostics" :key="`${diagnostic.message}-${index}`">
              <strong>{{ diagnostic.level.toUpperCase() }}:</strong> {{ diagnostic.message }}
            </li>
          </ul>
        </details>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { SCENARIO_IDS, type ScenarioId } from '~/types'
import { usePlayground } from '~/composables/usePlayground'

const { t } = useI18n()

useSeoMeta({
  title: () => t('playground.seo.title'),
  description: () => t('playground.seo.description'),
})

const scenarioTitles = computed<Record<ScenarioId, string>>(() => ({
  'model-to-schema': t('playground.scenarioTitles.model-to-schema'),
  'query-lookahead': t('playground.scenarioTitles.query-lookahead'),
  'polymorphic-blocks': t('playground.scenarioTitles.polymorphic-blocks'),
  'directive-middleware': t('playground.scenarioTitles.directive-middleware'),
}))

const scenarioOverviewMap = computed<Record<ScenarioId, {
  title: string
  description: string
}>>(() => ({
  'model-to-schema': {
    title: t('playground.scenarioOverview.model-to-schema.title'),
    description: t('playground.scenarioOverview.model-to-schema.description'),
  },
  'query-lookahead': {
    title: t('playground.scenarioOverview.query-lookahead.title'),
    description: t('playground.scenarioOverview.query-lookahead.description'),
  },
  'polymorphic-blocks': {
    title: t('playground.scenarioOverview.polymorphic-blocks.title'),
    description: t('playground.scenarioOverview.polymorphic-blocks.description'),
  },
  'directive-middleware': {
    title: t('playground.scenarioOverview.directive-middleware.title'),
    description: t('playground.scenarioOverview.directive-middleware.description'),
  },
}))

const {
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
} = usePlayground()

const copiedPanel = ref<string | null>(null)
const isHydrated = ref(false)
const inputColumnRef = ref<HTMLElement | null>(null)
const primaryColumnRef = ref<HTMLElement | null>(null)
const secondaryColumnRef = ref<HTMLElement | null>(null)
const inputCardRef = ref<HTMLElement | null>(null)
const primaryPanelRef = ref<HTMLElement | null>(null)
const secondaryPanelRef = ref<HTMLElement | null>(null)

const scenarioExamples = computed(() =>
  state.examples
    .filter(example => example.scenario === state.scenarioId)
    .map(example => ({
      ...example,
      title: t(`playground.examples.${example.id}.title`),
      description: t(`playground.examples.${example.id}.description`),
    })),
)

const activeExample = computed(() =>
  state.examples.find(example => example.id === state.exampleId && example.scenario === state.scenarioId),
)

const activeScenarioTitle = computed(() => scenarioTitles.value[state.scenarioId])

const activeScenarioOverview = computed(() => scenarioOverviewMap.value[state.scenarioId])

const isQueryScenario = computed(() =>
  state.scenarioId === 'query-lookahead' || state.scenarioId === 'polymorphic-blocks',
)

const executionNotesSummary = computed(() => {
  if (!isQueryScenario.value) {
    return ''
  }

  return state.executionNotes.length
    ? state.executionNotes.join(' ')
    : t('playground.executionFallback')
})

const resultJson = computed(() =>
  state.queryResult ? JSON.stringify(state.queryResult, null, 2) : '',
)

const includeGraphText = computed(() =>
  state.includeGraph ? JSON.stringify(state.includeGraph, null, 2) : '',
)

const typeSummaryText = computed(() =>
  state.typeSummary?.length ? JSON.stringify(state.typeSummary, null, 2) : '',
)

type CodeLanguage = 'graphql' | 'json' | 'sql' | 'plain'

function escapeCodeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function highlightGraphql(value: string) {
  return value.replace(
    /(#.*$)|(@[A-Za-z_][\w-]*)|\b(type|input|interface|enum|scalar|union|directive|schema|extend|implements|on|query|mutation|subscription)\b|\b(ID|String|Int|Float|Boolean|Query|Mutation|Subscription)\b/gm,
    (match, comment, directive, keyword, typeName) => {
      if (comment) return `<span class="tok-comment">${comment}</span>`
      if (directive) return `<span class="tok-fn">${directive}</span>`
      if (keyword) return `<span class="tok-keyword">${keyword}</span>`
      if (typeName) return `<span class="tok-type">${typeName}</span>`
      return match
    },
  )
}

function highlightJson(value: string) {
  return value.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, stringToken, isKey, booleanToken, nullToken, numberToken) => {
      if (stringToken) {
        const tokenClass = isKey ? 'tok-type' : 'tok-string'
        const suffix = isKey ? isKey : ''
        return `<span class="${tokenClass}">${stringToken}</span>${suffix}`
      }

      if (booleanToken) {
        return `<span class="tok-keyword">${booleanToken}</span>`
      }

      if (nullToken) {
        return `<span class="tok-comment">${nullToken}</span>`
      }

      if (numberToken) {
        return `<span class="tok-fn">${numberToken}</span>`
      }

      return match
    },
  )
}

function highlightSql(value: string) {
  return value.replace(
    /(--.*$)|('(?:''|[^'])*')|\b(SELECT|FROM|WHERE|LEFT|RIGHT|INNER|OUTER|JOIN|ON|AS|AND|OR|IN|NOT|NULL|IS|ORDER|BY|GROUP|LIMIT|OFFSET|DESC|ASC|INSERT|INTO|VALUES|UPDATE|SET|DELETE|DISTINCT)\b|(-?\d+(?:\.\d+)?)/gim,
    (match, comment, stringToken, keyword, numberToken) => {
      if (comment) return `<span class="tok-comment">${comment}</span>`
      if (stringToken) return `<span class="tok-string">${stringToken}</span>`
      if (keyword) return `<span class="tok-keyword">${keyword}</span>`
      if (numberToken) return `<span class="tok-fn">${numberToken}</span>`
      return match
    },
  )
}

function highlightCode(value: string, language: CodeLanguage) {
  const escaped = escapeCodeHtml(value)

  if (language === 'plain') {
    return escaped
  }

  if (language === 'graphql') {
    return highlightGraphql(escaped)
  }

  if (language === 'json') {
    return highlightJson(escaped)
  }

  return highlightSql(escaped)
}

function renderPanelCode(value: string | null | undefined, placeholder: string, language: Exclude<CodeLanguage, 'plain'>) {
  if (!value?.trim()) {
    return highlightCode(placeholder, 'plain')
  }

  return highlightCode(value, language)
}

const sdlDisplayHtml = computed(() =>
  renderPanelCode(state.sdl, 'Adjust the model options to generate live SDL here.', 'graphql'),
)

const resultDisplayHtml = computed(() =>
  renderPanelCode(resultJson.value, 'Edit the query on the left to inspect the GraphQL response payload.', 'json'),
)

const directiveSdlDisplayHtml = computed(() =>
  renderPanelCode(state.sdlExcerpt, 'Toggle the directive mode to inspect the printed schema excerpt.', 'graphql'),
)

const typeSummaryDisplayHtml = computed(() =>
  renderPanelCode(
    state.generate.showTypeSummary ? typeSummaryText.value : '',
    'Enable "Return type summary" to inspect the generated type map.',
    'json',
  ),
)

const sqlDisplayHtml = computed(() =>
  renderPanelCode(state.sql, 'Edit the query to inspect the generated SQL.', 'sql'),
)

const includeGraphDisplayHtml = computed(() =>
  renderPanelCode(includeGraphText.value, 'Edit the query on the left to inspect include planning.', 'json'),
)

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

function replaceHash() {
  if (!import.meta.client || !isHydrated.value) {
    return
  }

  const nextHash = `#${encodeToHash()}`
  if (window.location.hash === nextHash) {
    return
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`
  window.history.replaceState(window.history.state, '', nextUrl)
}

const updateHash = useDebounceFn(() => {
  replaceHash()
}, 300)

const scheduleAutoRun = useDebounceFn(() => {
  if (!isHydrated.value || !state.exampleId) {
    return
  }

  void run()
}, 450)

function scheduleLiveRun() {
  if (!isHydrated.value || !state.exampleId) {
    return
  }

  markDirty()
  scheduleAutoRun()
}

function resetBalancedPanelHeights() {
  for (const element of [inputCardRef.value, primaryPanelRef.value, secondaryPanelRef.value]) {
    element?.style.removeProperty('min-height')
  }
}

async function balanceQueryColumns() {
  if (!import.meta.client) {
    return
  }

  resetBalancedPanelHeights()
  await nextTick()
  await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))

  if (!isHydrated.value || !isQueryScenario.value || window.innerWidth <= 1180) {
    return
  }

  const columns = [
    { column: inputColumnRef.value, target: inputCardRef.value },
    { column: primaryColumnRef.value, target: primaryPanelRef.value },
    { column: secondaryColumnRef.value, target: secondaryPanelRef.value },
  ].filter((entry): entry is { column: HTMLElement, target: HTMLElement } => Boolean(entry.column && entry.target))

  if (columns.length < 3) {
    return
  }

  const tallestColumnHeight = Math.max(...columns.map(({ column }) => column.getBoundingClientRect().height))

  for (const { column, target } of columns) {
    const missingHeight = tallestColumnHeight - column.getBoundingClientRect().height
    if (missingHeight <= 1) {
      continue
    }

    const nextMinHeight = target.getBoundingClientRect().height + missingHeight
    target.style.minHeight = `${Math.ceil(nextMinHeight)}px`
  }
}

const scheduleColumnBalance = useDebounceFn(() => {
  void balanceQueryColumns()
}, 40)

function handleWindowResize() {
  scheduleColumnBalance()
}

watch([() => state.scenarioId, () => state.exampleId], () => {
  replaceHash()

  scheduleLiveRun()
})

watch(() => state.query, () => {
  updateHash()

  if (isQueryScenario.value) {
    scheduleLiveRun()
  }
})

watch(
  [
    () => state.generate.includeOrders,
    () => state.generate.includeAddress,
    () => state.generate.showTypeSummary,
  ],
  () => {
    if (state.scenarioId === 'model-to-schema') {
      scheduleLiveRun()
    }
  },
)

watch(() => state.directiveMode, () => {
  if (state.scenarioId === 'directive-middleware') {
    scheduleLiveRun()
  }
})

watch(
  [
    isQueryScenario,
    () => state.scenarioId,
    () => state.exampleId,
    () => state.query,
    resultJson,
    () => state.sql,
    includeGraphText,
    () => state.diagnostics.map(diagnostic => `${diagnostic.level}:${diagnostic.message}`).join('\n'),
    () => state.isLoading,
  ],
  () => {
    scheduleColumnBalance()
  },
  { flush: 'post' },
)

onMounted(async () => {
  window.addEventListener('resize', handleWindowResize)
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
  }
  else {
    const params = new URLSearchParams(window.location.search)
    const scenarioParam = params.get('scenario') as ScenarioId | null
    const exampleParam = params.get('example')

    if (scenarioParam && (SCENARIO_IDS as readonly string[]).includes(scenarioParam)) {
      await selectScenario(scenarioParam)
    }

    if (exampleParam) {
      await selectExample(exampleParam)
    }
  }

  isHydrated.value = true

  replaceHash()

  if (state.exampleId) {
    await run()
  }

  scheduleColumnBalance()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
  resetBalancedPanelHeights()
})
</script>

<style scoped>
.playground-page {
  --playground-panel: color-mix(in srgb, var(--panel-strong, var(--panel)) 96%, transparent);
  --playground-panel-soft: color-mix(in srgb, var(--panel-soft) 100%, transparent);
  --playground-border: var(--border);
  --playground-border-strong: var(--border-strong);

  min-height: 100vh;
  padding: 1.25rem 60px;
}

.playground-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.playground-hero-copy {
  padding-top: 1.35rem;
}

.playground-hero-copy h1 {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.playground-section-label {
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
  justify-content: flex-end;
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

.playground-button--ghost,
.playground-button--secondary {
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

.playground-toolbar-shell {
  border: 1px solid var(--playground-border);
  border-radius: 18px;
  background: var(--playground-panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.playground-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
}

.playground-overview {
  padding: 1rem 1.1rem;
  border-top: 1px solid var(--playground-border);
  background: transparent;
}

.playground-overview-copy h2 {
  margin: 0 0 0.55rem;
  font-size: 1.1rem;
  line-height: 1.35;
}

.playground-overview-copy p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.playground-overview-note {
  margin-top: 0.95rem;
  padding: 0.85rem 0.95rem;
  border-left: 3px solid var(--color-pink, #e535ab);
  border-radius: 0 12px 12px 0;
  background: color-mix(in srgb, var(--color-pink, #e535ab) 7%, transparent);
}

.playground-overview-note-label {
  display: inline-block;
  margin-bottom: 0.35rem;
  color: var(--text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.playground-overview-note p {
  margin: 0;
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
  grid-template-columns: minmax(18rem, 23rem) minmax(0, 1.2fr) minmax(18rem, 0.95fr);
  gap: 1.25rem;
  align-items: start;
}

.playground-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.playground-card--editor,
.playground-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.playground-card {
  border: 1px solid var(--playground-border);
  border-radius: 18px;
  background: var(--playground-panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
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
  min-height: 34rem;
  margin: 1rem;
  border: 1px solid var(--playground-border);
  border-radius: 14px;
  background: var(--code-bg-soft);
  color: var(--code-text);
  padding: 1rem;
  resize: vertical;
  font-family: var(--font-family-mono);
  font-size: 0.9rem;
  line-height: 1.7;
  flex: 1 1 auto;
  min-height: 0;
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
.playground-list {
  color: var(--muted);
}

.playground-help-text {
  margin: 0;
  line-height: 1.7;
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
  border: 1px solid var(--code-border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--code-shell) 0%, var(--code-bg) 100%);
  color: var(--code-text);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  font-family: var(--font-family-mono);
  font-size: 0.87rem;
  line-height: 1.7;
  flex: 1 1 auto;
  min-height: 0;
}

.playground-code code {
  display: block;
  color: inherit;
}

:deep(.tok-keyword) {
  color: var(--code-keyword);
}

:deep(.tok-string) {
  color: var(--code-string);
}

:deep(.tok-fn) {
  color: var(--code-function);
}

:deep(.tok-type) {
  color: var(--code-type);
}

:deep(.tok-comment) {
  color: var(--code-comment);
  font-style: italic;
}

.playground-code--primary {
  min-height: min(58vh, 42rem);
}

.playground-code--secondary {
  min-height: 12rem;
}

.playground-list {
  margin: 0;
  padding: 0 1.25rem 1.15rem 2.25rem;
  line-height: 1.7;
}

.playground-error {
  padding: 0.9rem 1rem;
  border: 1px solid var(--playground-border-strong);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-pink, #e535ab) 12%, transparent);
  color: var(--text);
}

.playground-diagnostics summary {
  cursor: pointer;
  padding: 1rem;
  font-weight: 700;
}

@media (min-width: 1280px) {
  .playground-column--input,
  .playground-column--secondary {
    position: sticky;
    top: 5rem;
  }
}

@media (max-width: 1180px) {
  .playground-layout {
    grid-template-columns: minmax(18rem, 23rem) minmax(0, 1fr);
  }

  .playground-column--secondary {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media (max-width: 920px) {
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .playground-column--secondary {
    grid-template-columns: 1fr;
  }

  .playground-textarea,
  .playground-code--primary {
    min-height: 24rem;
  }
}

@media (max-width: 760px) {
  .playground-page {
    padding: 1rem 60px;
  }

  .playground-hero,
  .playground-toolbar,
  .playground-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .playground-field {
    min-width: 100%;
  }

}
</style>
