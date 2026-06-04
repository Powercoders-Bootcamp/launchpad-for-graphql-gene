<template>
  <div class="docs-layout">
    <DocsSidebar />
    <main class="docs-main">
      <DocsArticle v-if="page" :page="page" :title="page.title" :status="page.status" />
      <p v-else class="docs-not-found">Page not found.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(
  `docs-${route.path}`,
  () => queryCollection('docs').where('slug', '=', route.path).first(),
)

useSeoMeta({
  title: () => page.value?.title ?? 'Docs',
  description: () => page.value?.description ?? '',
})
</script>

<style scoped>
.docs-layout {
  display: flex;
  min-height: 100vh;
}

.docs-main {
  flex: 1;
  padding: 2rem;
  min-width: 0;
  max-width: 800px;
}

.docs-not-found {
  color: var(--muted);
}
</style>
