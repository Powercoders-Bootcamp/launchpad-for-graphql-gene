<template>
  <aside class="docs-sidebar">
    <nav>
      <ClientOnly>
        <DocsSearch />
      </ClientOnly>

      <NuxtLink to="/docs" class="docs-sidebar__label">
        <svg class="docs-sidebar__home-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
        Documentation
      </NuxtLink>

      <!-- Tree root line -->
      <div class="tree-root">
        <template v-for="(section, si) in nav" :key="section.id">
          <div v-if="section.groups.some(g => g.pages.length > 0)" class="tree-section">

            <!-- Section node -->
            <div class="tree-section__head">
              <div class="tree-node tree-node--section">
                <span class="tree-node__icon" v-html="sectionIcons[section.id] ?? sectionIcons.default" />
              </div>
              <span class="tree-section__title">{{ section.title }}</span>
            </div>

            <!-- Section children -->
            <div class="tree-children" :class="{ 'tree-children--last': si === nav.length - 1 }">
              <template v-for="group in section.groups" :key="group.category ?? '_root'">

                <!-- Category sub-label -->
                <div v-if="group.category" class="tree-category">
                  <span class="tree-category__label">{{ group.category }}</span>
                </div>

                <!-- Pages -->
                <div
                  v-for="(page, pi) in group.pages"
                  :key="page._path"
                  class="tree-item"
                  :class="{ 'tree-item--last': pi === group.pages.length - 1 }"
                >
                  <div class="tree-item__connector">
                    <div class="tree-item__dot" :class="{ 'tree-item__dot--active': route.path === (page.slug ?? page._path) }" />
                  </div>
                  <NuxtLink
                    :to="page.slug ?? page._path"
                    class="tree-item__link"
                    :class="{ 'tree-item__link--active': route.path === (page.slug ?? page._path) }"
                  >
                    {{ page.sidebarLabel ?? page.title }}
                    <span
                      v-if="page.status && page.status !== 'stable'"
                      class="tree-item__badge"
                    >{{ page.status }}</span>
                  </NuxtLink>
                </div>

              </template>
            </div>

          </div>
        </template>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const nav = await useDocsNav()

const sectionIcons: Record<string, string> = {
  concepts: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>`,
  guides: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  reference: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  tutorials: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
}
</script>

<style scoped>
/* ── Shell ───────────────────────────────────────────────────────── */
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
  background: var(--bg-soft);
}

/* ── Home link ───────────────────────────────────────────────────── */
.docs-sidebar__label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--muted);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 1.75rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease;
}
.docs-sidebar__label:hover { color: var(--color-pink); }
.docs-sidebar__home-icon {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.docs-sidebar__label:hover .docs-sidebar__home-icon {
  transform: scale(1.2) translateY(-1px);
  color: var(--color-pink);
}

/* ── Tree root ───────────────────────────────────────────────────── */
.tree-root {
  position: relative;
  padding-left: 0.25rem;
}

/* ── Section ─────────────────────────────────────────────────────── */
.tree-section {
  margin-bottom: 1.5rem;
}

.tree-section__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tree-node--section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(229,53,171,0.12) 0%, rgba(124,58,237,0.08) 100%);
  border: 1px solid rgba(229,53,171,0.2);
  color: var(--color-pink);
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.tree-section__head:hover .tree-node--section {
  background: linear-gradient(135deg, rgba(229,53,171,0.2) 0%, rgba(124,58,237,0.14) 100%);
  border-color: rgba(229,53,171,0.4);
  transform: scale(1.08);
}
.tree-node__icon { display: flex; align-items: center; }

.tree-section__title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Children container with vertical tree line ──────────────────── */
.tree-children {
  position: relative;
  padding-left: 1.1rem;
  margin-left: 0.72rem;
  border-left: 2px solid #d0d5dd;
  padding-bottom: 0.25rem;
}
.tree-children--last {
  border-left-color: transparent;
}

/* ── Category label ──────────────────────────────────────────────── */
.tree-category {
  position: relative;
  padding: 0.5rem 0 0.25rem 0.5rem;
}
.tree-category::before {
  content: "";
  position: absolute;
  left: -1.1rem;
  top: 50%;
  width: 0.7rem;
  height: 2px;
  background: #d0d5dd;
}
.tree-category__label {
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5a6478;
  font-weight: 600;
}

/* ── Tree item ───────────────────────────────────────────────────── */
.tree-item {
  display: flex;
  align-items: center;
  position: relative;
}

/* Horizontal branch line */
.tree-item__connector {
  position: relative;
  display: flex;
  align-items: center;
  width: 1.1rem;
  flex-shrink: 0;
  margin-left: -1.1rem;
}
.tree-item__connector::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  background: #d0d5dd;
  transition: background 0.2s;
}
.tree-item:hover .tree-item__connector::before,
.tree-item:has(.tree-item__link--active) .tree-item__connector::before {
  background: rgba(229, 53, 171, 0.4);
}

/* Node dot */
.tree-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #b0b8c4;
  background: #ffffff;
  flex-shrink: 0;
  margin-left: auto;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
  z-index: 1;
}
.tree-item:hover .tree-item__dot {
  border-color: rgba(229, 53, 171, 0.6);
  transform: scale(1.3);
}
.tree-item__dot--active {
  border-color: var(--color-pink);
  background: var(--color-pink);
  box-shadow: 0 0 6px rgba(229, 53, 171, 0.5);
  transform: scale(1.2);
}

/* ── Page link ───────────────────────────────────────────────────── */
.tree-item__link {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #2c3e50;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, padding-left 0.15s;
  margin-left: 0.25rem;
}
.tree-item__link:hover {
  background: rgba(229, 53, 171, 0.07);
  color: var(--text);
  padding-left: 0.85rem;
}
.tree-item__link--active {
  background: linear-gradient(90deg, rgba(229,53,171,0.13) 0%, rgba(124,58,237,0.06) 100%);
  color: var(--text);
  font-weight: 600;
  padding-left: 0.85rem;
  box-shadow: inset 0 0 0 1px rgba(229,53,171,0.12);
}

/* ── Status badge ────────────────────────────────────────────────── */
.tree-item__badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: rgba(229, 53, 171, 0.12);
  color: var(--color-pink);
  border: 1px solid rgba(229, 53, 171, 0.25);
  margin-left: auto;
}
</style>
