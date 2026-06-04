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
/* ── Docs light theme — Vue v2-inspired ──────────────────────────── */
.docs-layout {
  /* Override global dark variables within this page */
  --bg:           #ffffff;
  --bg-soft:      #f6f6f6;
  --panel-soft:   rgba(0, 0, 0, 0.04);
  --border:       #e2e2e2;
  --border-strong:rgba(229, 53, 171, 0.35);
  --text:         #2c3e50;
  --muted:        #7a8596;
  --muted-strong: #4a5568;
  --shadow:       0 2px 12px rgba(0, 0, 0, 0.08);

  display: flex;
  min-height: 100vh;

  /* White background covers the dark body gradient */
  background: #ffffff;
  color: var(--text);
  font-family: "Space Grotesk", -apple-system, sans-serif;
}

.docs-main {
  flex: 1;
  min-width: 0;
  max-width: 860px;
  padding: 2.5rem 3rem;
  background: #ffffff;
}

.docs-not-found {
  color: var(--muted);
  padding: 2rem;
}
</style>
