<template>
  <div class="docs-search">
    <label class="docs-search__label" for="docs-search-input">Search docs</label>

    <input
      id="docs-search-input"
      v-model.trim="query"
      class="docs-search__input"
      type="search"
      placeholder="Search docs"
      autocomplete="off"
    >

    <div v-if="query.length >= 2" class="docs-search__results">
      <NuxtLink
        v-for="result in limitedResults"
        :key="result.slug"
        :to="result.slug"
        class="docs-search__result"
      >
        <strong>{{ result.sidebarLabel || result.title }}</strong>
        <span>{{ result.description }}</span>
      </NuxtLink>

      <p v-if="!limitedResults.length" class="docs-search__empty">
        No results for "{{ query }}".
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface SearchPage {
  title: string
  description: string
  summary?: string
  slug: string
  sidebarLabel?: string
  section?: string
  category?: string
}

const query = ref('')

const { data: pages } = await useAsyncData('docs-search-pages', async () => {
  const docs = await queryCollection('docs').all()

  return docs.map((page) => ({
    title: String(page.title ?? ''),
    description: String(page.description ?? ''),
    summary: typeof page.summary === 'string' ? page.summary : undefined,
    slug: String(page.slug ?? page._path ?? ''),
    sidebarLabel: typeof page.sidebarLabel === 'string' ? page.sidebarLabel : undefined,
    section: typeof page.section === 'string' ? page.section : undefined,
    category: typeof page.category === 'string' ? page.category : undefined,
  })) as SearchPage[]
})

const filteredResults = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (needle.length < 2) {
    return []
  }

  return (pages.value ?? [])
    .map((page) => ({
      ...page,
      score: scorePage(page, needle),
    }))
    .filter(page => page.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
})

const limitedResults = computed(() => filteredResults.value.slice(0, 8))

function scorePage(page: SearchPage, needle: string) {
  let score = 0

  const title = page.title.toLowerCase()
  const sidebarLabel = page.sidebarLabel?.toLowerCase() ?? ''
  const description = page.description.toLowerCase()
  const summary = page.summary?.toLowerCase() ?? ''
  const section = page.section?.toLowerCase() ?? ''
  const category = page.category?.toLowerCase() ?? ''
  const slug = page.slug.toLowerCase()

  if (title.includes(needle)) score += 6
  if (sidebarLabel.includes(needle)) score += 5
  if (description.includes(needle)) score += 3
  if (summary.includes(needle)) score += 2
  if (section.includes(needle)) score += 1
  if (category.includes(needle)) score += 1
  if (slug.includes(needle)) score += 1

  return score
}
</script>

<style scoped>
.docs-search {
  position: relative;
  margin-bottom: 0.9rem;
}

.docs-search__label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.docs-search__input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--input-bg);
  color: var(--text);
  padding: 0.7rem 0.85rem;
  font: inherit;
  box-shadow: 0 8px 22px color-mix(in srgb, var(--text) 5%, transparent);
}

.docs-search__input:focus {
  outline: none;
  border-color: rgba(229, 53, 171, 0.45);
  box-shadow: 0 0 0 3px rgba(229, 53, 171, 0.08);
}

.docs-search__results {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.docs-search__result {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 6%, transparent);
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.docs-search__result strong {
  color: var(--text);
  font-size: 0.86rem;
}

.docs-search__result span,
.docs-search__empty {
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.docs-search__result:hover {
  border-color: rgba(229, 53, 171, 0.35);
  background: var(--card-hover);
  transform: translateY(-1px);
  box-shadow: 0 14px 32px color-mix(in srgb, var(--color-pink) 12%, transparent);
}

.docs-search__empty {
  margin: 0;
  padding: 0.35rem 0.1rem 0;
}
</style>
