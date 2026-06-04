<template>
  <article class="docs-article">
    <header class="docs-article__header">
      <span
        v-if="status && status !== 'stable'"
        class="docs-article__badge"
      >{{ status }}</span>
      <h1 class="docs-article__title">{{ title }}</h1>
      <a
        v-if="editUrl"
        :href="editUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="docs-article__edit"
      >Edit on GitHub ↗</a>
    </header>

    <div class="docs-article__body">
      <ContentRenderer v-if="page" :value="page" />
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  page: Record<string, unknown>
  status?: string
  editUrl?: string
}>()
</script>

<style scoped>
.docs-article {
  max-width: 720px;
  padding: 2rem 2.5rem;
  width: 100%;
}

.docs-article__header {
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.docs-article__badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--panel-soft);
  color: var(--muted-strong);
  border: 1px solid var(--border);
  margin-bottom: 0.75rem;
}

.docs-article__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.docs-article__edit {
  font-size: 0.8rem;
  color: var(--muted);
  text-decoration: none;
}

.docs-article__edit:hover {
  color: var(--fg);
}

.docs-article__body {
  line-height: 1.7;
  color: var(--fg);
}
</style>
