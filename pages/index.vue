<template>
  <main class="container-site py-24">
    <!-- TODO: marketing homepage content -->
    <h1 class="text-4xl font-bold" style="color: var(--text)">graphql-gene</h1>
    <p style="color: var(--muted)">ORM-native GraphQL generation.</p>
    <div class="mt-8 flex gap-4">
      <NuxtLink to="/playground" class="px-6 py-3 rounded-lg font-semibold" style="background: var(--color-pink); color: #fff">
        Try Playground
      </NuxtLink>
      <NuxtLink to="/docs" style="color: var(--muted)">
        Read docs →
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'graphql-gene — ORM-native GraphQL generation',
  description: 'Generate production-ready GraphQL schemas from your ORM models.',
})
</script>
