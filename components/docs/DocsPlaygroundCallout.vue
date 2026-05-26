<template>
  <div
    style="
      margin: 2rem 0;
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--border-strong);
      border-radius: 16px;
      background: var(--panel-soft);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    "
  >
    <div>
      <p style="margin: 0; font-weight: 600; color: var(--text);">Try it in the Playground</p>
      <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: var(--muted);">
        {{ label ?? 'Run this example interactively.' }}
      </p>
    </div>
    <NuxtLink
      :to="playgroundUrl"
      style="
        flex-shrink: 0;
        padding: 0.5rem 1.25rem;
        background: var(--color-pink);
        color: #fff;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.875rem;
      "
    >
      {{ label ?? 'Try in Playground' }}
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

const playgroundUrl = computed(() => {
  const params = new URLSearchParams({ scenario: props.scenario })
  if (props.example) params.set('example', props.example)
  return `/playground?${params}`
})
</script>
