<template>
  <aside v-if="flatLinks.length" class="docs-on-this-page">
    <div class="docs-on-this-page__inner" :class="{ 'docs-on-this-page__inner--sticky': sticky }">
      <p class="docs-on-this-page__eyebrow">On This Page</p>

      <nav aria-label="On this page">
        <a
          v-for="link in flatLinks"
          :key="`${link.id}-${link.depth}`"
          :href="`#${link.id}`"
          class="docs-on-this-page__link"
          :style="{ '--depth': String(Math.max(link.depth - 2, 0)) }"
        >
          {{ link.text }}
        </a>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TocLink {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

const props = defineProps<{
  links?: TocLink[]
  sticky?: boolean
}>()

const sticky = computed(() => props.sticky ?? true)

const flatLinks = computed(() => flattenLinks(props.links ?? []))

function flattenLinks(links: TocLink[]) {
  return links.flatMap(link => [
    {
      id: link.id,
      depth: link.depth,
      text: link.text,
    },
    ...flattenLinks(link.children ?? []),
  ])
}
</script>

<style scoped>
.docs-on-this-page {
  min-width: 0;
}

.docs-on-this-page__inner {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  box-shadow: 0 12px 34px color-mix(in srgb, var(--text) 6%, transparent);
}

.docs-on-this-page__inner--sticky {
  position: sticky;
  top: 5.4rem;
}

.docs-on-this-page__eyebrow {
  margin: 0 0 0.9rem;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.docs-on-this-page nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.docs-on-this-page__link {
  display: block;
  padding: 0.5rem 0.65rem 0.5rem calc(0.65rem + (var(--depth) * 0.85rem));
  border-radius: 10px;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.45;
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.docs-on-this-page__link:hover {
  color: var(--text);
  background: var(--card-hover);
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .docs-on-this-page__inner {
    position: static;
  }
}
</style>
