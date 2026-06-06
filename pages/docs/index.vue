<template>
  <div class="docs-layout">
    <DocsSidebar />
    <main class="docs-main">

      <!-- Hero -->
      <div class="docs-hero">
        <div class="docs-hero__badge">Documentation</div>
        <h1 class="docs-hero__title">graphql-gene</h1>
        <p class="docs-hero__subtitle">
          Generate an executable GraphQL schema automatically from your ORM models.
          Define your types once — GraphQL and TypeScript stay in sync.
        </p>
        <div class="docs-hero__actions">
          <NuxtLink to="/docs/concepts/getting-started" class="btn-primary">Get Started →</NuxtLink>
          <NuxtLink to="/playground" class="btn-secondary">Try Playground</NuxtLink>
        </div>
      </div>

      <!-- Features -->
      <div class="docs-features">
        <div class="docs-feature">
          <div class="docs-feature__icon">⚡️</div>
          <h3 class="docs-feature__title">Performant</h3>
          <p class="docs-feature__desc">Query lookahead avoids loading associations the client never requested. No wasted DB queries.</p>
        </div>
        <div class="docs-feature">
          <div class="docs-feature__icon">🔒</div>
          <h3 class="docs-feature__title">Type-safe</h3>
          <p class="docs-feature__desc">Resolver arguments and return types are deeply inferred from your models. One source of truth.</p>
        </div>
        <div class="docs-feature">
          <div class="docs-feature__icon">🧩</div>
          <h3 class="docs-feature__title">Extensible</h3>
          <p class="docs-feature__desc">Plugin system supports any Node.js ORM. Add directives, aliases, and custom resolvers with ease.</p>
        </div>
      </div>

      <!-- Code snippet -->
      <div class="docs-snippet">
        <div class="docs-snippet__header">
          <span class="docs-snippet__label">Quick setup</span>
          <span class="docs-snippet__file">schema.ts</span>
        </div>
        <pre class="docs-snippet__code"><span class="tok-keyword">import</span> { generateSchema } <span class="tok-keyword">from</span> <span class="tok-string">'graphql-gene'</span>
<span class="tok-keyword">import</span> { pluginSequelize } <span class="tok-keyword">from</span> <span class="tok-string">'@graphql-gene/plugin-sequelize'</span>
<span class="tok-keyword">import</span> * <span class="tok-keyword">as</span> graphqlTypes <span class="tok-keyword">from</span> <span class="tok-string">'../models/graphqlTypes'</span>

<span class="tok-keyword">const</span> { schema } = <span class="tok-fn">generateSchema</span>({
  plugins: [<span class="tok-fn">pluginSequelize</span>()],
  types: graphqlTypes,
})</pre>
      </div>

      <!-- Section links -->
      <div class="docs-sections">
        <NuxtLink to="/docs/concepts/getting-started" class="docs-section-card">
          <div class="docs-section-card__icon">📖</div>
          <div>
            <h3 class="docs-section-card__title">Concepts</h3>
            <p class="docs-section-card__desc">Mental models, architecture, and how graphql-gene works under the hood.</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/docs/guides/schema-design" class="docs-section-card">
          <div class="docs-section-card__icon">🛠</div>
          <div>
            <h3 class="docs-section-card__title">Guides</h3>
            <p class="docs-section-card__desc">Schema design, directives, polymorphic blocks — focused how-to pages.</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/docs/reference/writing-a-plugin" class="docs-section-card">
          <div class="docs-section-card__icon">📐</div>
          <div>
            <h3 class="docs-section-card__title">Reference</h3>
            <p class="docs-section-card__desc">Plugin API, configuration options, and exact lookup-style documentation.</p>
          </div>
        </NuxtLink>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Documentation — graphql-gene',
  description: 'Official documentation for graphql-gene — generate executable GraphQL schemas from your ORM models.',
})
</script>

<style scoped>
/* ── Docs light theme (same as [...slug].vue) ────────────────────── */
.docs-layout {
  --bg:           #ffffff;
  --bg-soft:      #f6f6f6;
  --panel-soft:   rgba(0, 0, 0, 0.04);
  --border:       #e2e2e2;
  --text:         #2c3e50;
  --muted:        #7a8596;
  --muted-strong: #4a5568;

  display: flex;
  min-height: 100vh;
  background: #ffffff;
  color: var(--text);
  font-family: "Space Grotesk", -apple-system, sans-serif;
}

.docs-main {
  flex: 1;
  min-width: 0;
  padding: 3rem 3.5rem;
  max-width: 860px;
}

/* ── Hero ─────────────────────────────────────────────────────────── */
.docs-hero {
  margin-bottom: 3rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
}

.docs-hero__badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-pink);
  background: rgba(229, 53, 171, 0.08);
  border: 1px solid rgba(229, 53, 171, 0.2);
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  margin-bottom: 1rem;
}

.docs-hero__title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 1rem;
  line-height: 1.15;
}

.docs-hero__subtitle {
  font-size: 1.1rem;
  color: var(--muted);
  line-height: 1.7;
  max-width: 560px;
  margin: 0 0 1.75rem;
}

.docs-hero__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  padding: 0.6rem 1.4rem;
  background: var(--color-pink);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.88; }

.btn-secondary {
  display: inline-block;
  padding: 0.6rem 1.4rem;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: border-color 0.15s, background 0.15s;
}
.btn-secondary:hover {
  border-color: var(--color-pink);
  background: rgba(229, 53, 171, 0.04);
}

/* ── Features ─────────────────────────────────────────────────────── */
.docs-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.docs-feature {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-soft);
}

.docs-feature__icon {
  font-size: 1.4rem;
  margin-bottom: 0.6rem;
}

.docs-feature__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.4rem;
}

.docs-feature__desc {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

/* ── Code snippet ─────────────────────────────────────────────────── */
.docs-snippet {
  margin-bottom: 2.5rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.docs-snippet__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
}

.docs-snippet__label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.docs-snippet__file {
  font-size: 0.78rem;
  color: var(--muted);
  font-family: "IBM Plex Mono", monospace;
}

.docs-snippet__code {
  margin: 0;
  padding: 1.25rem 1.5rem;
  background: #1e2433;
  color: #e2e8f0;
  font-family: "IBM Plex Mono", Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  overflow-x: auto;
}

.tok-keyword { color: #c792ea; }
.tok-string  { color: #c3e88d; }
.tok-fn      { color: #82aaff; }

/* ── Section cards ────────────────────────────────────────────────── */
.docs-sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.docs-section-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}

.docs-section-card:hover {
  border-color: var(--color-pink);
  background: rgba(229, 53, 171, 0.03);
  transform: translateX(3px);
}

.docs-section-card__icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.docs-section-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.25rem;
}

.docs-section-card__desc {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .docs-main { padding: 1.5rem; }
  .docs-features { grid-template-columns: 1fr; }
  .docs-hero__title { font-size: 1.8rem; }
}
</style>
