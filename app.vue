<template>
  <div :data-theme="theme">
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

provide('toggleTheme', toggleTheme)
provide('theme', theme)
</script>
