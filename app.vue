<template>
  <div class="site-shell">
    <div class="site-bg" aria-hidden="true" />
    <AppNav />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

const theme = useCookie<'dark' | 'light'>('graphql-gene-theme', {
  default: () => 'dark',
})

async function applyTheme(nextTheme: 'dark' | 'light') {
  theme.value = nextTheme
  await nextTick()
}

async function toggleTheme() {
  const nextTheme = theme.value === 'dark' ? 'light' : 'dark'

  if (!import.meta.client || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await applyTheme(nextTheme)
    return
  }

  const startViewTransition = document.startViewTransition?.bind(document)
  if (!startViewTransition) {
    await applyTheme(nextTheme)
    return
  }

  await startViewTransition(() => applyTheme(nextTheme)).finished
}

useHead(() => ({
  htmlAttrs: {
    'data-theme': theme.value,
  },
}))

provide('toggleTheme', toggleTheme)
provide('theme', theme)
</script>
