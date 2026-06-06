<template>
  <div class="docs-layout">
    <DocsSidebar />
    <main class="docs-main">

      <!-- Ambient background blobs -->
      <div class="blob blob-1" aria-hidden="true" />
      <div class="blob blob-2" aria-hidden="true" />

      <!-- Hero -->
      <div class="docs-hero">
        <div class="docs-hero__badge animate-fade-up" style="--delay: 0ms">
          <span class="badge-dot" />
          Documentation
        </div>
        <h1 class="docs-hero__title animate-fade-up" style="--delay: 80ms">
          <span class="title-animated">graphql-gene</span>
        </h1>
        <p class="docs-hero__subtitle animate-fade-up" style="--delay: 160ms">
          {{ typedText }}<span v-if="!typingDone" class="type-cursor">|</span>
        </p>
        <div class="docs-hero__actions animate-fade-up" style="--delay: 240ms">
          <NuxtLink to="/docs/concepts/getting-started" class="btn-primary">
            Get Started <span class="btn-arrow">→</span>
          </NuxtLink>
          <NuxtLink to="/playground" class="btn-secondary">Try Playground</NuxtLink>
        </div>
      </div>

      <!-- Features -->
      <div ref="featuresRef" class="docs-features" :class="{ 'features-visible': featuresVisible }">
        <div v-for="(f, i) in features" :key="f.title" class="docs-feature" :style="`--i: ${i}`">
          <div class="docs-feature__icon">{{ f.icon }}</div>
          <h3 class="docs-feature__title">{{ f.title }}</h3>
          <p class="docs-feature__desc">{{ f.desc }}</p>
        </div>
      </div>

      <!-- Code snippet -->
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
})<span class="cursor-blink">▋</span></pre>
      </div>

      <!-- Section cards -->
      <div ref="sectionsRef" class="docs-sections" :class="{ 'sections-visible': sectionsVisible }">
        <NuxtLink
          v-for="(s, i) in sections"
          :key="s.title"
          :to="s.to"
          class="docs-section-card"
          :style="`--i: ${i}`"
        >
          <div class="docs-section-card__icon">{{ s.icon }}</div>
          <div class="docs-section-card__body">
            <h3 class="docs-section-card__title">{{ s.title }}</h3>
            <p class="docs-section-card__desc">{{ s.desc }}</p>
          </div>
          <span class="card-arrow">→</span>
        </NuxtLink>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

useSeoMeta({
  title: 'Documentation — graphql-gene',
  description: 'Official documentation for graphql-gene — generate executable GraphQL schemas from your ORM models.',
})

const features = [
  { icon: '⚡️', title: 'Performant', desc: 'Query lookahead avoids loading associations the client never requested. No wasted DB queries.' },
  { icon: '🔒', title: 'Type-safe', desc: 'Resolver arguments and return types are deeply inferred from your models. One source of truth.' },
  { icon: '🧩', title: 'Extensible', desc: 'Plugin system supports any Node.js ORM. Add directives, aliases, and custom resolvers with ease.' },
]

const sections = [
  { icon: '📖', title: 'Concepts', desc: 'Mental models, architecture, and how graphql-gene works under the hood.', to: '/docs/concepts/getting-started' },
  { icon: '🛠', title: 'Guides', desc: 'Schema design, directives, polymorphic blocks — focused how-to pages.', to: '/docs/guides/schema-design' },
  { icon: '📐', title: 'Reference', desc: 'Plugin API, configuration options, and exact lookup-style documentation.', to: '/docs/reference/writing-a-plugin' },
]

// ── Typewriter ────────────────────────────────────────────────────
const fullText = 'Generate an executable GraphQL schema automatically from your ORM models. Define your types once — GraphQL and TypeScript stay in sync.'
const typedText = ref('')
const typingDone = ref(false)

onMounted(() => {
  let i = 0
  setTimeout(function type() {
    if (i < fullText.length) {
      typedText.value += fullText[i++]
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
  if (isIntersecting) featuresVisible.value = true
}, { threshold: 0.1 })
useIntersectionObserver(snippetRef, ([{ isIntersecting }]) => {
  if (isIntersecting) snippetVisible.value = true
}, { threshold: 0.1 })
useIntersectionObserver(sectionsRef, ([{ isIntersecting }]) => {
  if (isIntersecting) sectionsVisible.value = true
}, { threshold: 0.1 })
</script>

<style scoped>
/* ── Docs light theme ────────────────────────────────────────────── */
.docs-layout {
  --bg:      #ffffff;
  --bg-soft: #f6f6f6;
  --border:  #e8e8e8;
  --text:    #1a1a2e;
  --muted:   #7a8596;
  --pink:    #e535ab;

  display: flex;
  min-height: 100vh;
  background: #ffffff;
  color: var(--text);
  font-family: "Space Grotesk", -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
}

.docs-main {
  flex: 1;
  min-width: 0;
  padding: 3rem 3.5rem;
  max-width: 860px;
  position: relative;
  z-index: 1;
}

/* ── Ambient blobs ───────────────────────────────────────────────── */
.blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  animation: drift 14s ease-in-out infinite alternate;
}
.blob-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(229,53,171,0.08) 0%, transparent 70%);
  top: -80px; right: 80px;
}
.blob-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(100,120,255,0.06) 0%, transparent 70%);
  bottom: 80px; right: 40px;
  animation-delay: -7s;
}
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(20px, 28px) scale(1.08); }
}

/* ── Hero fade-up ────────────────────────────────────────────────── */
.animate-fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay, 0ms);
}
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

/* ── Hero ────────────────────────────────────────────────────────── */
.docs-hero {
  margin-bottom: 3rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
}
.docs-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--pink);
  background: rgba(229, 53, 171, 0.07);
  border: 1px solid rgba(229, 53, 171, 0.18);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: 1.25rem;
}
.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--pink);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}
.docs-hero__title {
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.1;
  letter-spacing: -1.5px;
}
.title-animated {
  background: linear-gradient(
    270deg,
    #e535ab,
    #a855f7,
    #6366f1,
    #e535ab
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.docs-hero__subtitle {
  font-size: 1.05rem;
  color: var(--muted);
  line-height: 1.75;
  max-width: 520px;
  margin: 0 0 1.75rem;
  min-height: 3.5rem;
}
.type-cursor {
  display: inline-block;
  color: var(--pink);
  font-weight: 300;
  animation: blink 0.8s step-end infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.docs-hero__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.4rem;
  background: linear-gradient(135deg, var(--pink) 0%, #a855f7 100%);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(229, 53, 171, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(229, 53, 171, 0.35); }
.btn-arrow { transition: transform 0.15s ease; }
.btn-primary:hover .btn-arrow { transform: translateX(3px); }
.btn-secondary {
  display: inline-block;
  padding: 0.65rem 1.4rem;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.btn-secondary:hover {
  border-color: var(--pink);
  background: rgba(229, 53, 171, 0.04);
  transform: translateY(-1px);
}

/* ── Feature cards — staggered scroll reveal ─────────────────────── */
.docs-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}
.docs-feature {
  padding: 1.4rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1),
              transform 0.5s cubic-bezier(0.16,1,0.3,1),
              border-color 0.2s, box-shadow 0.2s;
  transition-delay: calc(var(--i) * 80ms);
}
.features-visible .docs-feature { opacity: 1; transform: translateY(0); }
.docs-feature:hover {
  border-color: rgba(229, 53, 171, 0.3);
  box-shadow: 0 4px 20px rgba(229, 53, 171, 0.08);
}
.docs-feature__icon { font-size: 1.5rem; margin-bottom: 0.75rem; }
.docs-feature__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.4rem;
  letter-spacing: -0.3px;
}
.docs-feature__desc {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.65;
  margin: 0;
}

/* ── Code snippet — slide-in + cursor blink ──────────────────────── */
.docs-snippet {
  margin-bottom: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}
.snippet-visible { opacity: 1; transform: translateY(0); }
.docs-snippet__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: #2a2d3e;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.snippet-dots { display: flex; gap: 5px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red    { background: #ff5f57; }
.dot-yellow { background: #ffbd2e; }
.dot-green  { background: #28c840; }
.docs-snippet__label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.4);
  margin-left: auto;
}
.docs-snippet__file {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  font-family: "IBM Plex Mono", monospace;
}
.docs-snippet__code {
  margin: 0;
  padding: 1.4rem 1.6rem;
  background: #1e2133;
  color: #e2e8f0;
  font-family: "IBM Plex Mono", Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.75;
  overflow-x: auto;
}
.tok-keyword { color: #c792ea; }
.tok-string  { color: #c3e88d; }
.tok-fn      { color: #82aaff; }
.cursor-blink {
  display: inline-block;
  color: var(--pink);
  animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

/* ── Section cards — slide-in from left ─────────────────────────── */
.docs-sections { display: flex; flex-direction: column; gap: 0.75rem; }
.docs-section-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text);
  opacity: 0;
  transform: translateX(-16px);
  transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1),
              transform 0.5s cubic-bezier(0.16,1,0.3,1),
              border-color 0.2s, background 0.2s, box-shadow 0.2s;
  transition-delay: calc(var(--i) * 70ms);
}
.sections-visible .docs-section-card { opacity: 1; transform: translateX(0); }
.docs-section-card:hover {
  border-color: rgba(229, 53, 171, 0.35);
  background: rgba(229, 53, 171, 0.03);
  box-shadow: 0 4px 16px rgba(229, 53, 171, 0.08);
}
.docs-section-card:hover .card-arrow { transform: translateX(4px); color: var(--pink); }
.docs-section-card__icon { font-size: 1.4rem; flex-shrink: 0; }
.docs-section-card__body { flex: 1; }
.docs-section-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.2rem;
  letter-spacing: -0.3px;
}
.docs-section-card__desc {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}
.card-arrow {
  font-size: 1rem;
  color: var(--muted);
  transition: transform 0.2s ease, color 0.2s ease;
  flex-shrink: 0;
}

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .docs-main { padding: 1.5rem; }
  .docs-features { grid-template-columns: 1fr; }
  .docs-hero__title { font-size: 2rem; }
  .blob { display: none; }
}
</style>
