<template>
  <div class="site-shell">
    <div class="site-bg" aria-hidden="true" />
    <AppNav />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const theme = useCookie<'dark' | 'light'>('graphql-gene-theme', {
  default: () => 'dark',
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

useHead(() => ({
  htmlAttrs: {
    'data-theme': theme.value,
  },
}))

provide('toggleTheme', toggleTheme)
provide('theme', theme)
</script>
