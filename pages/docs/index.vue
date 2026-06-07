<template>
  <div class="docs-layout">
    <DocsSidebar />
    <main class="docs-main">
      <div class="docs-main-shell">
        <section class="docs-overview">
          <div class="blob blob-1" aria-hidden="true" />
          <div class="blob blob-2" aria-hidden="true" />

          <div class="docs-hero">
            <h1 class="docs-hero__title animate-fade-up" style="--delay: 0ms">
              <span class="title-animated">graphql-gene</span>
            </h1>
            <p class="docs-hero__subtitle animate-fade-up" style="--delay: 80ms">
              {{ typedText }}<span v-if="!typingDone" class="type-cursor">|</span>
            </p>
            <div class="docs-hero__actions animate-fade-up" style="--delay: 160ms">
              <NuxtLink to="/docs/concepts/getting-started" class="btn-primary">
                Get Started <span class="btn-arrow">-></span>
              </NuxtLink>
              <NuxtLink to="/playground" class="btn-secondary">Try Playground</NuxtLink>
            </div>
          </div>

          <div ref="featuresRef" class="docs-features" :class="{ 'features-visible': featuresVisible }">
            <div v-for="(feature, index) in features" :key="feature.title" class="docs-feature" :style="`--i: ${index}`">
              <div class="docs-feature__icon">{{ feature.icon }}</div>
              <h3 class="docs-feature__title">{{ feature.title }}</h3>
              <p class="docs-feature__desc">{{ feature.desc }}</p>
            </div>
          </div>

          <div ref="snippetRef" class="docs-snippet" :class="{ 'snippet-visible': snippetVisible }">
            <div class="docs-snippet__header">
              <div class="snippet-dots">
                <span class="dot dot-red" />
                <span class="dot dot-yellow" />
                <span class="dot dot-green" />
              </div>
              <span class="docs-snippet__label">Quick setup</span>
              <span class="docs-snippet__file">schema.ts</span>
            </div>
            <pre class="docs-snippet__code"><span class="tok-keyword">import</span> { generateSchema } <span class="tok-keyword">from</span> <span class="tok-string">'graphql-gene'</span>
<span class="tok-keyword">import</span> { pluginSequelize } <span class="tok-keyword">from</span> <span class="tok-string">'@graphql-gene/plugin-sequelize'</span>
<span class="tok-keyword">import</span> * <span class="tok-keyword">as</span> graphqlTypes <span class="tok-keyword">from</span> <span class="tok-string">'../models/graphqlTypes'</span>

<span class="tok-keyword">const</span> { schema } = <span class="tok-fn">generateSchema</span>({
  plugins: [<span class="tok-fn">pluginSequelize</span>()],
  types: graphqlTypes,
})<span class="cursor-blink">|</span></pre>
          </div>

          <div ref="sectionsRef" class="docs-sections" :class="{ 'sections-visible': sectionsVisible }">
            <NuxtLink
              v-for="(section, index) in sections"
              :key="section.title"
              :to="section.to"
              class="docs-section-card"
              :style="`--i: ${index}`"
            >
              <div class="docs-section-card__icon">{{ section.icon }}</div>
              <div class="docs-section-card__body">
                <h3 class="docs-section-card__title">{{ section.title }}</h3>
                <p class="docs-section-card__desc">{{ section.desc }}</p>
              </div>
              <span class="card-arrow">-></span>
            </NuxtLink>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

useSeoMeta({
  title: 'Documentation - graphql-gene',
  description: 'Official documentation for graphql-gene - generate executable GraphQL schemas from your ORM models.',
})

const features = [
  { icon: 'Fast', title: 'Performant', desc: 'Query lookahead avoids loading associations the client never requested. No wasted database work.' },
  { icon: 'Safe', title: 'Type-safe', desc: 'Resolver arguments and return types are deeply inferred from your models. One source of truth.' },
  { icon: 'Flex', title: 'Extensible', desc: 'The plugin system supports any Node.js ORM. Add directives, aliases, and custom resolvers with ease.' },
]

const sections = [
  { icon: '01', title: 'Concepts', desc: 'Mental models, architecture, and how graphql-gene works under the hood.', to: '/docs/concepts/getting-started' },
  { icon: '02', title: 'Guides', desc: 'Schema design, directives, and polymorphic blocks through focused how-to pages.', to: '/docs/guides/schema-design' },
  { icon: '03', title: 'Reference', desc: 'Plugin API, configuration options, and exact lookup-style documentation.', to: '/docs/reference/writing-a-plugin' },
]

const fullText = 'Generate an executable GraphQL schema automatically from your ORM models. Define your types once - GraphQL and TypeScript stay in sync.'
const typedText = ref('')
const typingDone = ref(false)

onMounted(() => {
  let index = 0

  setTimeout(function type() {
    if (index < fullText.length) {
      typedText.value += fullText[index++]
      setTimeout(type, 20)
    }
    else {
      typingDone.value = true
    }
  }, 500)
})

const featuresRef = ref<HTMLElement | null>(null)
const snippetRef = ref<HTMLElement | null>(null)
const sectionsRef = ref<HTMLElement | null>(null)
const featuresVisible = ref(false)
const snippetVisible = ref(false)
const sectionsVisible = ref(false)

useIntersectionObserver(featuresRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    featuresVisible.value = true
  }
}, { threshold: 0.1 })

useIntersectionObserver(snippetRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    snippetVisible.value = true
  }
}, { threshold: 0.1 })

useIntersectionObserver(sectionsRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    sectionsVisible.value = true
  }
}, { threshold: 0.1 })
</script>

<style scoped>
.docs-layout {
  display: flex;
  min-height: 100vh;
  padding-inline: 40px;
  background: transparent;
  color: var(--text);
  font-family: "Space Grotesk", -apple-system, sans-serif;
  box-sizing: border-box;
}

.docs-main {
  flex: 1;
  min-width: 0;
  padding: 0 0 4rem;
  position: relative;
  z-index: 1;
}

.docs-main-shell {
  max-width: 980px;
  margin: 0 auto;
}

.docs-overview {
  min-width: 0;
  position: relative;
}

.blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  animation: drift 14s ease-in-out infinite alternate;
}

.blob-1 {
  top: -80px;
  right: 80px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(229, 53, 171, 0.08) 0%, transparent 70%);
}

.blob-2 {
  right: 40px;
  bottom: 80px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(100, 120, 255, 0.06) 0%, transparent 70%);
  animation-delay: -7s;
}

@keyframes drift {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(20px, 28px) scale(1.08);
  }
}

.animate-fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes fade-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.docs-hero {
  margin-bottom: 3rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
}

.docs-hero__title {
  margin: 0 0 1rem;
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -1.5px;
}

.title-animated {
  background: linear-gradient(270deg, #e535ab, #a855f7, #6366f1, #e535ab);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 4s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.docs-hero__subtitle {
  min-height: 3.5rem;
  max-width: 520px;
  margin: 0 0 1.75rem;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.75;
}

.type-cursor,
.cursor-blink {
  display: inline-block;
  color: var(--color-pink);
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.docs-hero__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.4rem;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-pink) 0%, #a855f7 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(229, 53, 171, 0.25);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(229, 53, 171, 0.35);
}

.btn-arrow {
  transition: transform 0.15s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(3px);
}

.btn-secondary {
  display: inline-block;
  padding: 0.65rem 1.4rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--panel) 94%, transparent);
  color: var(--text);
  backdrop-filter: blur(12px);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.btn-secondary:hover {
  border-color: var(--color-pink);
  background: var(--card-hover);
  transform: translateY(-1px);
}

.docs-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.docs-feature {
  padding: 1.4rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--text) 8%, transparent);
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  transition-delay: calc(var(--i) * 80ms);
}

.features-visible .docs-feature {
  opacity: 1;
  transform: translateY(0);
}

.docs-feature:hover {
  border-color: rgba(229, 53, 171, 0.3);
  box-shadow: 0 16px 40px color-mix(in srgb, var(--color-pink) 10%, transparent);
}

.docs-feature__icon {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-pink);
}

.docs-feature__title {
  margin: 0 0 0.4rem;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.docs-feature__desc {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.65;
}

.docs-snippet {
  margin-bottom: 2.5rem;
  border: 1px solid var(--code-border);
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--code-shell) 0%, var(--code-bg) 100%);
  box-shadow: var(--code-shadow);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.snippet-visible {
  opacity: 1;
  transform: translateY(0);
}

.docs-snippet__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--code-border);
  background: color-mix(in srgb, var(--code-shell) 92%, #fff 8%);
}

.snippet-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-red {
  background: #ff5f57;
}

.dot-yellow {
  background: #ffbd2e;
}

.dot-green {
  background: #28c840;
}

.docs-snippet__label {
  margin-left: auto;
  color: var(--code-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.docs-snippet__file {
  color: var(--code-muted);
  font-family: var(--font-family-mono);
  font-size: 0.78rem;
}

.docs-snippet__code {
  margin: 0;
  padding: 1.4rem 1.6rem;
  background: transparent;
  color: var(--code-text);
  overflow-x: auto;
  font-family: var(--font-family-mono);
  font-size: 0.875rem;
  line-height: 1.75;
}

.tok-keyword {
  color: var(--code-keyword);
}

.tok-string {
  color: var(--code-string);
}

.tok-fn {
  color: var(--code-function);
}

.docs-sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.docs-section-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--panel) 96%, transparent);
  color: var(--text);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 7%, transparent);
  opacity: 0;
  transform: translateX(-16px);
  text-decoration: none;
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
  transition-delay: calc(var(--i) * 70ms);
}

.sections-visible .docs-section-card {
  opacity: 1;
  transform: translateX(0);
}

.docs-section-card:hover {
  border-color: rgba(229, 53, 171, 0.35);
  background: var(--card-hover);
  box-shadow: 0 16px 38px color-mix(in srgb, var(--color-pink) 12%, transparent);
}

.docs-section-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--color-pink);
}

.docs-section-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--color-pink) 25%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-pink) 8%, transparent);
  color: var(--color-pink);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.docs-section-card__body {
  flex: 1;
}

.docs-section-card__title {
  margin: 0 0 0.2rem;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.docs-section-card__desc {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.5;
}

.card-arrow {
  flex-shrink: 0;
  color: var(--muted);
  font-size: 0.92rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

@media (max-width: 640px) {
  .docs-main {
    padding: 0 0 3rem;
  }

  .docs-features {
    grid-template-columns: 1fr;
  }

  .docs-hero__title {
    font-size: 2rem;
  }

  .blob {
    display: none;
  }
}

</style>
