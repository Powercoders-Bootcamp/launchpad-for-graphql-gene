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
      >Edit on GitHub</a>
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
  max-width: 100%;
  width: 100%;
  padding: 2rem 2.5rem;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--panel) 97%, transparent);
  box-shadow: 0 14px 36px color-mix(in srgb, var(--text) 6%, transparent);
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
  color: var(--text);
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.docs-article__edit {
  font-size: 0.8rem;
  color: var(--muted);
  text-decoration: none;
}

.docs-article__edit:hover {
  color: var(--text);
}

.docs-article__body {
  line-height: 1.7;
  color: var(--text);
}

.docs-article__body :deep(p),
.docs-article__body :deep(li),
.docs-article__body :deep(td),
.docs-article__body :deep(th) {
  color: var(--muted-strong);
}

.docs-article__body :deep(h1),
.docs-article__body :deep(h2),
.docs-article__body :deep(h3),
.docs-article__body :deep(h4) {
  color: var(--text);
  font-weight: 600;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 5.6rem;
}

.docs-article__body :deep(h1) { font-size: 1.5rem; }
.docs-article__body :deep(h2) { font-size: 1.25rem; }
.docs-article__body :deep(h3) { font-size: 1.1rem; }

.docs-article__body :deep(a) {
  color: var(--color-pink);
  text-decoration: underline;
}

.docs-article__body :deep(h1 a),
.docs-article__body :deep(h2 a),
.docs-article__body :deep(h3 a),
.docs-article__body :deep(h4 a) {
  color: inherit;
  text-decoration: none;
}

.docs-article__body :deep(.prose-code-block) {
  margin-inline: 0;
}

.docs-article__body :deep(hr) {
  border-color: var(--border);
  margin: 2rem 0;
}

.docs-article__body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.25rem 0;
  font-size: 0.9rem;
}

.docs-article__body :deep(th),
.docs-article__body :deep(td) {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
}

.docs-article__body :deep(th) {
  font-weight: 600;
  background: var(--panel-soft);
}

.docs-article__body :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 0.9rem 1rem;
  border-left: 3px solid var(--color-pink);
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  color: var(--muted-strong);
}

.docs-article__body :deep(ul),
.docs-article__body :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.docs-article__body :deep(li) {
  margin: 0.3rem 0;
}

@media (max-width: 720px) {
  .docs-article {
    padding: 1.25rem;
  }
}
</style>
