<template>
  <div class="docs-layout">
    <DocsSidebar />

    <main class="docs-main">
      <template v-if="page">
        <DocsPlaygroundCallout
          v-if="page.playgroundScenario"
          :scenario="page.playgroundScenario"
          class="docs-main__callout"
        />
        <DocsArticle
          :title="page.title"
          :page="page"
          :status="page.status"
          :edit-url="editUrl"
        />
      </template>
      <p v-else class="docs-main__not-found">
        Page not found.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { ScenarioId } from '~/types'

const route = useRoute()

const { data: page } = await useAsyncData(
  `docs-${route.path}`,
  () => queryContent(route.path).findOne(),
)

const editUrl = computed(() => {
  if (!page.value) return undefined
  const slug = page.value.slug as string | undefined
  if (!slug) return undefined
  const file = slug.replace('/docs/', '') + '.md'
  return `https://github.com/accesimpot/graphql-gene/blob/main/packages/docs/docs/${file}`
})

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
  min-width: 0;
}

.docs-main__callout {
  max-width: 720px;
  margin: 2rem 2.5rem 0;
}

.docs-main__not-found {
  padding: 2rem 2.5rem;
  color: var(--muted);
}
</style>
