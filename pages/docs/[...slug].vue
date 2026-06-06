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
  background: transparent;
  color: var(--text);
  font-family: "Space Grotesk", -apple-system, sans-serif;
}

.docs-main {
  flex: 1;
  min-width: 0;
  max-width: 860px;
  padding: 2.5rem 3rem;
  background: transparent;
}

.docs-not-found {
  color: var(--muted);
  padding: 2rem;
}

@media (max-width: 720px) {
  .docs-main {
    padding: 1.5rem;
  }
}
</style>
