<template>
  <div class="prose-code-block">
    <div class="prose-code-block__bar">
      <div class="prose-code-block__dots" aria-hidden="true">
        <span class="prose-code-block__dot prose-code-block__dot--red" />
        <span class="prose-code-block__dot prose-code-block__dot--yellow" />
        <span class="prose-code-block__dot prose-code-block__dot--green" />
      </div>

      <div class="prose-code-block__meta">
        <span class="prose-code-block__label">{{ displayLabel }}</span>
        <span v-if="displayLanguage" class="prose-code-block__lang">{{ displayLanguage }}</span>
      </div>

      <button
        class="prose-code-block__copy"
        type="button"
        :disabled="!code"
        @click="copyCode"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>

    <pre class="prose-code-block__body" v-bind="attrs"><slot /></pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  meta?: string | null
}>()

const copied = ref(false)
const attrs = useAttrs()

const displayLabel = computed(() => {
  if (props.filename) return props.filename
  if (props.meta) return props.meta
  if (props.language) return `${props.language}.snippet`
  return 'code'
})

const displayLanguage = computed(() => props.language?.toUpperCase() ?? '')

async function copyCode() {
  if (!props.code || !import.meta.client) {
    return
  }

  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true

    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  }
  catch (error) {
    console.error('Failed to copy code block', error)
  }
}
</script>

<style>
.prose-code-block {
  margin: 1.4rem 0;
  border: 1px solid var(--code-border);
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--code-shell) 0%, var(--code-bg) 100%);
  box-shadow: var(--code-shadow);
}

.prose-code-block__bar {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--code-border);
  background: color-mix(in srgb, var(--code-shell) 92%, #fff 8%);
}

.prose-code-block__dots {
  display: inline-flex;
  gap: 0.35rem;
}

.prose-code-block__dot {
  width: 0.68rem;
  height: 0.68rem;
  border-radius: 999px;
}

.prose-code-block__dot--red {
  background: #ff5f57;
}

.prose-code-block__dot--yellow {
  background: #febc2e;
}

.prose-code-block__dot--green {
  background: #28c840;
}

.prose-code-block__meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  margin-right: auto;
}

.prose-code-block__label {
  color: var(--code-text);
  font-family: var(--font-family-mono);
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prose-code-block__lang {
  color: var(--code-muted);
  font-family: var(--font-family-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.prose-code-block__copy {
  border: 1px solid color-mix(in srgb, var(--code-border) 92%, #fff 8%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--code-bg) 86%, #fff 14%);
  color: var(--code-text);
  padding: 0.42rem 0.8rem;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.prose-code-block__copy:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.prose-code-block__copy:hover:not(:disabled) {
  background: color-mix(in srgb, var(--code-bg) 72%, #fff 28%);
}

.prose-code-block__body {
  margin: 0;
  padding: 1.15rem 1.3rem 1.3rem;
  background: transparent;
  overflow-x: auto;
}

.prose-code-block__body code {
  display: block;
  min-width: max-content;
  font-family: var(--font-family-mono);
  font-size: 0.88rem;
  line-height: 1.8;
  color: var(--code-text);
}

.prose-code-block__body.shiki {
  color: var(--code-text);
  background: transparent !important;
}

.prose-code-block__body.shiki code {
  color: inherit;
}

.prose-code-block__body.shiki .line {
  display: block;
}

.prose-code-block__body.shiki span {
  background: transparent !important;
  color: var(--shiki-dark, var(--shiki-default, var(--code-text))) !important;
  font-style: var(--shiki-dark-font-style, var(--shiki-default-font-style, normal)) !important;
  font-weight: var(--shiki-dark-font-weight, var(--shiki-default-font-weight, 400)) !important;
  text-decoration: var(--shiki-dark-text-decoration, var(--shiki-default-text-decoration, none)) !important;
}
</style>
