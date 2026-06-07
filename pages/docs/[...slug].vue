<template>
  <div class="docs-layout">
    <DocsSidebar />

    <main class="docs-main">
      <div class="docs-main-shell">
        <DocsArticle
          v-if="page"
          :page="page"
          :title="String(page.title ?? '')"
          :status="typeof page.status === 'string' ? page.status : undefined"
          :edit-url="editUrl"
        />
        <p v-else class="docs-not-found">{{ t('docs.notFound') }}</p>

        <aside class="docs-main-rail">
          <DocsOnThisPage :links="tocLinks" :sticky="false" />
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DocsTocLink {
  id: string
  depth: number
  text: string
  children?: DocsTocLink[]
}

interface DocsPageRecord {
  title?: string
  description?: string
  status?: string
  _id?: string
  body?: {
    toc?: {
      links?: DocsTocLink[]
    }
  }
}

const route = useRoute()
const { t } = useI18n()
const { stripLocalePrefix } = useLocaleRouting()
const canonicalPath = computed(() => stripLocalePrefix(route.path))
const { data: page } = await useAsyncData(
  `docs-${route.path}`,
  () => queryCollection('docs').where('slug', '=', canonicalPath.value).first() as Promise<DocsPageRecord | null>,
)

const tocLinks = computed(() => page.value?.body?.toc?.links ?? [])

const editUrl = computed(() => {
  const sourceId = page.value?._id
  if (!sourceId) {
    const slug = canonicalPath.value.split('/').filter(Boolean).at(-1)
    return slug
      ? `https://github.com/accesimpot/graphql-gene/blob/main/docs/${slug}.md`
      : undefined
  }

  const sourcePath = sourceId.replace(/^docs\/graphql-gene\//, '')
  return `https://github.com/accesimpot/graphql-gene/blob/main/${sourcePath}`
})

useSeoMeta({
  title: () => page.value?.title ?? t('docs.home'),
  description: () => page.value?.description ?? '',
})
</script>

<style scoped>
.docs-layout {
  display: flex;
  min-height: 100vh;
  padding-inline: 60px;
  background: transparent;
  color: var(--text);
  font-family: "Space Grotesk", -apple-system, sans-serif;
  box-sizing: border-box;
}

.docs-main {
  flex: 1;
  min-width: 0;
  padding: 2.5rem 0 4rem;
  background: transparent;
}

.docs-main-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 2rem;
  align-items: start;
  max-width: 1180px;
  margin: 0 auto;
}

.docs-main-rail {
  position: sticky;
  top: 5.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.docs-not-found {
  color: var(--muted);
  padding: 2rem;
}

@media (max-width: 1024px) {
  .docs-main-shell {
    grid-template-columns: 1fr;
  }

  .docs-main-rail {
    position: static;
  }
}

@media (max-width: 720px) {
  .docs-main {
    padding: 1.5rem 0 3rem;
  }
}
</style>
