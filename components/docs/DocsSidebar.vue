<template>
  <aside class="docs-sidebar">
    <nav>
      <ClientOnly>
        <DocsSearch />
      </ClientOnly>

      <p class="docs-sidebar__label">Documentation</p>

      <template v-for="section in nav" :key="section.id">
        <div
          v-if="section.groups.some(g => g.pages.length > 0)"
          class="docs-sidebar__section"
        >
          <p class="docs-sidebar__section-title">{{ section.title }}</p>

          <template v-for="group in section.groups" :key="group.category ?? '_root'">
            <p v-if="group.category" class="docs-sidebar__category">
              {{ group.category }}
            </p>

            <ul class="docs-sidebar__list">
              <li v-for="page in group.pages" :key="page._path">
                <NuxtLink
                  :to="page.slug ?? page._path"
                  class="docs-sidebar__link"
                  :class="{ 'docs-sidebar__link--active': route.path === (page.slug ?? page._path) }"
                >
                  {{ page.sidebarLabel ?? page.title }}
                  <span
                    v-if="page.status && page.status !== 'stable'"
                    class="docs-sidebar__badge"
                  >{{ page.status }}</span>
                </NuxtLink>
              </li>
            </ul>
          </template>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const nav = await useDocsNav()
</script>

<style scoped>
.docs-sidebar {
  width: 260px;
  flex-shrink: 0;
  padding: 2rem 1rem;
  border-right: 1px solid var(--border);
  min-height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  max-height: 100vh;
}

.docs-sidebar__label {
  color: var(--muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.25rem;
  font-weight: 600;
}

.docs-sidebar__section {
  margin-bottom: 1.5rem;
}

.docs-sidebar__section-title {
  color: var(--fg);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  padding: 0 0.5rem;
}

.docs-sidebar__category {
  color: var(--muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.5rem 0;
  margin-top: 0.5rem;
}

.docs-sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.docs-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--muted-strong);
  text-decoration: none;
  transition: background 0.1s, color 0.1s;
}

.docs-sidebar__link:hover {
  background: var(--panel-soft);
  color: var(--fg);
}

.docs-sidebar__link--active {
  background: var(--panel-soft);
  color: var(--fg);
  font-weight: 500;
}

.docs-sidebar__badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: var(--panel-soft);
  color: var(--muted-strong);
  border: 1px solid var(--border);
  margin-left: auto;
}
</style>
