<template>
  <div class="docs-callout">
    <div>
      <p class="docs-callout__title">{{ t('docs.tryInPlayground') }}</p>
      <p class="docs-callout__text">
        {{ label ?? t('docs.runExample') }}
      </p>
    </div>

    <NuxtLink :to="playgroundUrl" class="docs-callout__cta">
      {{ label ?? t('docs.openPlayground') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { ScenarioId } from '~/types'

const props = defineProps<{
  scenario: ScenarioId
  example?: string
  label?: string
}>()
const localePath = useLocalePath()
const { t } = useI18n()

const playgroundUrl = computed(() => {
  const params = new URLSearchParams({ scenario: props.scenario })
  if (props.example) params.set('example', props.example)
  return localePath(`/playground?${params}`)
})
</script>

<style scoped>
.docs-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border-strong);
  border-radius: 16px;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  box-shadow: 0 14px 32px color-mix(in srgb, var(--text) 6%, transparent);
}

.docs-callout__title {
  margin: 0;
  color: var(--text);
  font-weight: 600;
}

.docs-callout__text {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.docs-callout__cta {
  flex-shrink: 0;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  background: var(--color-pink);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 720px) {
  .docs-callout {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
