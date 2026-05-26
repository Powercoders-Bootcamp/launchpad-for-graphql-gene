<template>
  <div class="docs-layout" style="display: flex; min-height: 100vh;">
    <DocsSidebar />
    <main style="flex: 1; padding: 2rem;">
      <!-- TODO: implement full docs article layout (Phase 4) -->
      <ContentRenderer v-if="page" :value="page" />
      <p v-else style="color: var(--muted)">Page not found.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(
  `docs-${route.path}`,
  () => queryContent(route.path).findOne(),
)

useSeoMeta({
  title: () => page.value?.title ?? 'Docs',
  description: () => page.value?.description ?? '',
})
</script>
