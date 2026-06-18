<template>
  <div class="docs-layout">
    <DocsSidebar
      home-path="/mcp"
      nav-slug-prefix="/mcp"
      labels-key-prefix="mcp"
      section-label-key-prefix="mcp.sections"
      :sections="mcpDocsConfig.sections"
    />

    <main class="docs-main">
      <div class="docs-main-shell">
        <section class="mcp-overview">
          <div class="mcp-hero">
            <p class="mcp-hero__eyebrow">{{ t('mcp.landing.eyebrow') }}</p>
            <h1 class="mcp-hero__title">{{ t('mcp.landing.title') }}</h1>
            <p class="mcp-hero__description">{{ t('mcp.landing.description') }}</p>

            <div class="mcp-hero__actions">
              <NuxtLink :to="localePath('/mcp/setup')" class="btn-primary">
                {{ t('mcp.landing.primaryCta') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/docs')" class="btn-secondary">
                {{ t('mcp.landing.secondaryCta') }}
              </NuxtLink>
            </div>
          </div>

          <section class="mcp-highlights">
            <div class="mcp-section-head">
              <h2>{{ t('mcp.landing.highlightsTitle') }}</h2>
              <p>{{ t('mcp.landing.highlightsDescription') }}</p>
            </div>

            <div class="mcp-highlights__grid">
              <article v-for="highlight in highlights" :key="highlight.title" class="mcp-highlight">
                <div class="mcp-highlight__icon">{{ highlight.icon }}</div>
                <h3>{{ highlight.title }}</h3>
                <p>{{ highlight.description }}</p>
              </article>
            </div>
          </section>

          <section class="mcp-cards">
            <div class="mcp-section-head">
              <h2>{{ t('mcp.landing.cardsTitle') }}</h2>
              <p>{{ t('mcp.landing.cardsDescription') }}</p>
            </div>

            <div class="mcp-cards__grid">
              <NuxtLink v-for="card in cards" :key="card.title" :to="localePath(card.to)" class="mcp-card">
                <span class="mcp-card__label">{{ card.label }}</span>
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
              </NuxtLink>
            </div>
          </section>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mcpDocsConfig } from '~/content/graphql-gene/mcp.config'

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('mcp.seo.title'),
  description: () => t('mcp.seo.description'),
})

const highlights = computed(() => [
  {
    icon: '01',
    title: t('mcp.landing.highlightOneTitle'),
    description: t('mcp.landing.highlightOneDescription'),
  },
  {
    icon: '02',
    title: t('mcp.landing.highlightTwoTitle'),
    description: t('mcp.landing.highlightTwoDescription'),
  },
  {
    icon: '03',
    title: t('mcp.landing.highlightThreeTitle'),
    description: t('mcp.landing.highlightThreeDescription'),
  },
])

const cards = computed(() => [
  {
    label: t('mcp.sections.guides.title'),
    title: t('mcp.landing.setupTitle'),
    description: t('mcp.landing.setupDescription'),
    to: '/mcp/setup',
  },
  {
    label: t('mcp.sections.guides.title'),
    title: t('mcp.landing.deploymentTitle'),
    description: t('mcp.landing.deploymentDescription'),
    to: '/mcp/deployment',
  },
  {
    label: t('mcp.sections.reference.title'),
    title: t('mcp.landing.versionTitle'),
    description: t('mcp.landing.versionDescription'),
    to: '/mcp/version-contract',
  },
])
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
  padding: 1.5rem 0 4rem;
}

.docs-main-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.mcp-overview {
  padding: 1rem 2.5rem 0;
}

.mcp-hero,
.mcp-highlights,
.mcp-cards {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  box-shadow: 0 14px 36px color-mix(in srgb, var(--text) 6%, transparent);
}

.mcp-hero {
  margin-bottom: 1.5rem;
  padding: 2rem;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--color-pink) 12%, transparent) 0, transparent 38%),
    color-mix(in srgb, var(--panel) 96%, transparent);
}

.mcp-hero__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--color-pink);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mcp-hero__title {
  margin: 0 0 0.9rem;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.mcp-hero__description {
  max-width: 48rem;
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.75;
}

.mcp-hero__actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 1.4rem;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
}

.btn-primary {
  background: var(--color-pink);
  color: #fff;
}

.btn-secondary {
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--panel) 90%, transparent);
  color: var(--text);
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-1px);
}

.mcp-highlights,
.mcp-cards {
  padding: 1.5rem;
}

.mcp-highlights {
  margin-bottom: 1.5rem;
}

.mcp-section-head {
  margin-bottom: 1.1rem;
}

.mcp-section-head h2 {
  margin: 0 0 0.45rem;
  font-size: 1.1rem;
}

.mcp-section-head p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.mcp-highlights__grid,
.mcp-cards__grid {
  display: grid;
  gap: 1rem;
}

.mcp-highlights__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mcp-highlight,
.mcp-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--panel-soft) 88%, transparent);
}

.mcp-highlight {
  padding: 1.2rem;
}

.mcp-highlight__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.85rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-pink) 10%, transparent);
  color: var(--color-pink);
  font-size: 0.76rem;
  font-weight: 700;
}

.mcp-highlight h3,
.mcp-card h3 {
  margin: 0 0 0.45rem;
  font-size: 0.98rem;
}

.mcp-highlight p,
.mcp-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.mcp-cards__grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mcp-card {
  padding: 1.25rem;
  color: inherit;
  text-decoration: none;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.mcp-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-pink) 36%, var(--border));
  box-shadow: 0 18px 36px color-mix(in srgb, var(--color-pink) 10%, transparent);
}

.mcp-card__label {
  display: inline-block;
  margin-bottom: 0.65rem;
  color: var(--color-pink);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 960px) {
  .mcp-highlights__grid,
  .mcp-cards__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .docs-main {
    padding-bottom: 3rem;
  }

  .mcp-overview {
    padding-inline: 1.25rem;
  }

  .mcp-hero,
  .mcp-highlights,
  .mcp-cards {
    padding: 1.25rem;
  }
}
</style>
