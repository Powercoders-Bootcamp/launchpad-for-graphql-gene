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
/* ── Sidebar shell ───────────────────────────────────────────────── */
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

/* ── Top label: "Documentation" ─────────────────────────────────── */
.docs-sidebar__label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--muted);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

/* Decorative gradient dash before the label */
.docs-sidebar__label::before {
  content: "";
  display: inline-block;
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--color-pink), var(--color-violet));
  flex-shrink: 0;
}

/* ── Section block ───────────────────────────────────────────────── */
.docs-sidebar__section {
  margin-bottom: 2rem;
}

/* ── Section title ───────────────────────────────────────────────── */
.docs-sidebar__section-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--muted-strong);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
  text-transform: uppercase;
}

/* Pink dot accent before each section title */
.docs-sidebar__section-title::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-pink);
  box-shadow: 0 0 6px rgba(229, 53, 171, 0.5);
  flex-shrink: 0;
}

/* ── Category sub-label ──────────────────────────────────────────── */
.docs-sidebar__category {
  color: var(--muted);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.75rem 0;
  margin-top: 0.75rem;
  font-weight: 600;
}

/* ── Link list ───────────────────────────────────────────────────── */
.docs-sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ── Individual link ─────────────────────────────────────────────── */
.docs-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 7px;
  font-size: 0.875rem;
  color: var(--muted-strong);
  text-decoration: none;

  /* Left border slot — invisible by default */
  border-left: 2px solid transparent;

  /* All transitions */
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    padding-left 0.18s ease;
}

/* ── Hover state ─────────────────────────────────────────────────── */
.docs-sidebar__link:hover {
  background: rgba(229, 53, 171, 0.07);
  color: var(--text);
  border-left-color: rgba(229, 53, 171, 0.45);
  padding-left: 0.9rem;
  box-shadow: inset 0 0 0 1px rgba(229, 53, 171, 0.08);
}

/* ── Active / current page ───────────────────────────────────────── */
.docs-sidebar__link--active {
  background: linear-gradient(
    90deg,
    rgba(229, 53, 171, 0.13) 0%,
    rgba(124, 58, 237, 0.06) 100%
  );
  color: var(--text);
  font-weight: 600;
  border-left-color: var(--color-pink);
  padding-left: 0.9rem;
  box-shadow:
    inset 0 0 0 1px rgba(229, 53, 171, 0.12),
    0 0 12px rgba(229, 53, 171, 0.06);
}

/* Active should not change further on hover */
.docs-sidebar__link--active:hover {
  background: linear-gradient(
    90deg,
    rgba(229, 53, 171, 0.18) 0%,
    rgba(124, 58, 237, 0.09) 100%
  );
}

/* ── Status badge ────────────────────────────────────────────────── */
.docs-sidebar__badge {
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
