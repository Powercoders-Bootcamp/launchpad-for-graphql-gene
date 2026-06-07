<template>
  <div>

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-mark" aria-hidden="true">
        <img src="/images/logo.svg" alt="" width="360" height="360">
      </div>

      <div class="container-site hero-inner">

        <div class="hero-text">
          <div class="hero-badge">TypeScript &middot; Sequelize &middot; GraphQL</div>
          <h1 class="hero-title">
            The ORM-Native<br>
            <span class="hero-title-accent">GraphQL Generator</span>
          </h1>
          <p class="hero-desc">
            Stop writing resolvers by hand. graphql-gene reads your Sequelize models
            and generates a complete, production-ready GraphQL schema — with smart
            query lookahead built in.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/playground" class="btn-primary">Try the Playground</NuxtLink>
            <NuxtLink to="/docs" class="btn-ghost">Read the Docs &rarr;</NuxtLink>
          </div>
          <div class="hero-npm">
            <code class="npm-cmd">npm install graphql-gene</code>
          </div>
        </div>

        <div class="hero-code-wrap">
          <div class="code-window">
            <div class="code-window-bar">
              <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
              <span class="code-window-label">schema.ts</span>
            </div>
            <pre class="code-body"><code v-html="heroCodeTs" /></pre>
          </div>
          <div class="code-window code-window-output">
            <div class="code-window-bar">
              <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
              <span class="code-window-label">generated SDL</span>
            </div>
            <pre class="code-body"><code v-html="heroCodeSdl" /></pre>
          </div>
        </div>

      </div>
    </section>

    <!-- ─── Features ─────────────────────────────────────────────── -->
    <section class="features">
      <div class="container-site">
        <h2 class="section-title">Everything you need, nothing you don't</h2>
        <p class="section-sub">graphql-gene handles the schema so you can focus on product logic.</p>
        <div class="features-grid">

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <h3 class="feature-title">ORM-Native</h3>
            <p class="feature-desc">Define your Sequelize models once. graphql-gene generates types, queries, and mutations automatically — no hand-rolled resolvers.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 class="feature-title">Query Lookahead</h3>
            <p class="feature-desc">Your resolvers know exactly which relations the query needs. Sequelize builds optimized JOINs automatically — zero N+1 problems.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 class="feature-title">Directive Middleware</h3>
            <p class="feature-desc">Attach runtime behavior to any field with a decorator. Auth, validation, and rate-limiting as first-class schema citizens.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <h3 class="feature-title">TypeScript First</h3>
            <p class="feature-desc">Full type safety from model definition to resolver. Your IDE knows your schema before the server starts.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/>
                <path d="M22.54 6.38a15 15 0 0 1 0 11.24M1.46 17.62a15 15 0 0 1 0-11.24"/>
              </svg>
            </div>
            <h3 class="feature-title">Plugin Ecosystem</h3>
            <p class="feature-desc">Drop in <code class="inline-code">@graphql-gene/plugin-sequelize</code> and get Sequelize support out of the box. More adapters on the way.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h3 class="feature-title">Interactive Playground</h3>
            <p class="feature-desc">Try every scenario live — schema generation, query execution, SQL capture, and directive middleware — right in your browser.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── Code showcase ─────────────────────────────────────────── -->
    <section class="showcase">
      <div class="container-site">
        <h2 class="section-title">See it in action</h2>
        <p class="section-sub">From Sequelize model to a working GraphQL API — no boilerplate, no drift.</p>
        <div class="showcase-grid">

          <div class="showcase-panel">
            <div class="showcase-panel-label">Your model</div>
            <div class="code-window">
              <div class="code-window-bar">
                <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
                <span class="code-window-label">models/user.ts</span>
              </div>
              <pre class="code-body"><code v-html="showcaseModel" /></pre>
            </div>
          </div>

          <div class="showcase-arrow">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            <span>graphql-gene</span>
          </div>

          <div class="showcase-panel">
            <div class="showcase-panel-label">Generated schema</div>
            <div class="code-window">
              <div class="code-window-bar">
                <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
                <span class="code-window-label">schema.graphql</span>
              </div>
              <pre class="code-body"><code v-html="showcaseSdl" /></pre>
            </div>
          </div>

        </div>
        <div class="showcase-cta">
          <NuxtLink to="/playground" class="btn-primary">Run this in the Playground</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─── Get started ───────────────────────────────────────────── -->
    <section class="get-started">
      <div class="container-site get-started-inner">
        <h2 class="get-started-title">Ready to ship your GraphQL API?</h2>
        <p class="get-started-sub">Drop graphql-gene into your existing Sequelize project and generate a production-ready schema in minutes.</p>
        <div class="get-started-actions">
          <NuxtLink to="/playground" class="btn-primary btn-lg">Open Playground</NuxtLink>
          <NuxtLink to="/docs" class="btn-outline btn-lg">Read the Docs</NuxtLink>
        </div>
        <div class="get-started-npm">
          <code class="npm-cmd">npm install graphql-gene @graphql-gene/plugin-sequelize</code>
        </div>
      </div>
    </section>

    <AppFooter />

  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'graphql-gene — ORM-native GraphQL generation',
  description: 'Generate production-ready GraphQL schemas from your Sequelize models. Smart query lookahead, directive middleware, and full TypeScript support.',
})

const k = (s: string) => `<span class="t-k">${s}</span>`
const t = (s: string) => `<span class="t-t">${s}</span>`
const s = (s: string) => `<span class="t-s">${s}</span>`
const c = (s: string) => `<span class="t-c">${s}</span>`

const heroCodeTs = [
  `${k('import')} { buildSchema } ${k('from')} ${s("'graphql-gene'")}`,
  `${k('import')} { sequelizePlugin } ${k('from')} ${s("'@graphql-gene/plugin-sequelize'")}`,
  `${k('import')} { ${t('User')}, ${t('Order')} } ${k('from')} ${s("'./models'")}`,
  ``,
  `${c('// One call — full schema generated')}`,
  `${k('export const')} schema = buildSchema({`,
  `  models: [${t('User')}, ${t('Order')}],`,
  `  plugins: [sequelizePlugin()],`,
  `})`,
].join('\n')

const heroCodeSdl = [
  `${k('type')} ${t('User')} {`,
  `  id: ${t('ID!')}`,
  `  email: ${t('String!')}`,
  `  name: ${t('String!')}`,
  `  orders: [${t('Order!')}]`,
  `}`,
  ``,
  `${k('type')} ${t('Query')} {`,
  `  users: [${t('User!')}]!`,
  `  user(id: ${t('ID!')}): ${t('User')}`,
  `}`,
].join('\n')

const showcaseModel = [
  `${k('import')} { Model, DataTypes } ${k('from')} ${s("'sequelize'")}`,
  ``,
  `${k('class')} ${t('User')} ${k('extends')} ${t('Model')} {`,
  `  ${k('declare')} id: ${t('number')}`,
  `  ${k('declare')} email: ${t('string')}`,
  `  ${k('declare')} name: ${t('string')}`,
  `  ${k('declare')} orders: ${t('Order')}[]`,
  `}`,
  ``,
  `${t('User')}.init({`,
  `  id: { ${k('type')}: DataTypes.${t('INTEGER')}, primaryKey: ${k('true')} },`,
  `  email: { ${k('type')}: DataTypes.${t('STRING')} },`,
  `  name: { ${k('type')}: DataTypes.${t('STRING')} },`,
  `}, { sequelize })`,
  ``,
  `${t('User')}.hasMany(${t('Order')}, { as: ${s("'orders'")} })`,
].join('\n')

const showcaseSdl = [
  `${k('type')} ${t('User')} {`,
  `  id: ${t('ID!')}`,
  `  email: ${t('String!')}`,
  `  name: ${t('String!')}`,
  `  orders: [${t('Order!')}]`,
  `}`,
  ``,
  `${k('type')} ${t('Order')} {`,
  `  id: ${t('ID!')}`,
  `  status: ${t('String!')}`,
  `  total: ${t('Float!')}`,
  `  user: ${t('User')}`,
  `}`,
  ``,
  `${k('type')} ${t('Query')} {`,
  `  users: [${t('User!')}]!`,
  `  user(id: ${t('ID!')}): ${t('User')}`,
  `  orders: [${t('Order!')}]!`,
  `}`,
].join('\n')
</script>

<style scoped>
/* ─── Hero ──────────────────────────────────────────────────────── */
.hero {
  position: relative;
  padding: 6rem 0 5rem;
  overflow: clip;
}

.hero-mark {
  position: absolute;
  left: max(-1rem, 2vw);
  top: 0.5rem;
  opacity: 0.08;
  pointer-events: none;
  transform: rotate(-14deg);
}

.hero-mark img {
  display: block;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: color-mix(in srgb, var(--color-pink) 8%, transparent);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-pink);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 1.25rem;
}

.hero-title-accent {
  background: linear-gradient(135deg, var(--color-pink) 0%, var(--color-violet) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--muted);
  margin: 0 0 2rem;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.hero-npm {
  margin-top: 0.5rem;
}

.npm-cmd {
  font-family: var(--font-family-mono);
  font-size: 0.82rem;
  color: var(--muted);
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
}

.hero-code-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ─── Buttons ───────────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--color-pink);
  color: #fff;
  text-decoration: none;
  transition: opacity 0.15s, transform 0.15s;
}

.btn-primary:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1rem;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s;
}

.btn-ghost:hover {
  color: var(--text);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid var(--border-strong);
  color: var(--color-pink);
  text-decoration: none;
  transition: background 0.15s, transform 0.15s;
}

.btn-outline:hover {
  background: color-mix(in srgb, var(--color-pink) 8%, transparent);
  transform: translateY(-1px);
}

.btn-lg {
  padding: 0.8rem 1.75rem;
  font-size: 1rem;
}

/* ─── Code window ───────────────────────────────────────────────── */
.code-window {
  background: linear-gradient(180deg, var(--code-shell) 0%, var(--code-bg) 100%);
  border: 1px solid var(--code-border);
  border-radius: var(--radius-site-lg);
  overflow: hidden;
  box-shadow: var(--code-shadow);
}

.code-window-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--code-border);
  background: color-mix(in srgb, var(--code-shell) 92%, #fff 8%);
}

.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-r { background: #ff5f57; }
.dot-y { background: #febc2e; }
.dot-g { background: #28c840; }

.code-window-label {
  margin-left: 0.5rem;
  font-family: var(--font-family-mono);
  font-size: 0.75rem;
  color: var(--code-muted);
}

.code-body {
  margin: 0;
  padding: 1.25rem 1.4rem;
  font-family: var(--font-family-mono);
  font-size: 0.82rem;
  line-height: 1.75;
  color: var(--code-text);
  background: transparent;
  overflow-x: auto;
}

:deep(.t-k) { color: var(--code-keyword); }
:deep(.t-t) { color: var(--code-type); }
:deep(.t-s) { color: var(--code-string); }
:deep(.t-c) { color: var(--code-comment); font-style: italic; }

/* ─── Features ──────────────────────────────────────────────────── */
.features {
  padding: 5rem 0;
  border-top: 1px solid var(--border);
}

.section-title {
  font-size: clamp(1.6rem, 2.5vw, 2.1rem);
  font-weight: 700;
  color: var(--text);
  text-align: center;
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
}

.section-sub {
  text-align: center;
  font-size: 1rem;
  color: var(--muted);
  margin: 0 0 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  padding: 1.75rem;
  border-radius: var(--radius-site-md);
  border: 1px solid var(--border);
  background: var(--panel-soft);
  transition: border-color 0.2s, transform 0.2s;
}

.feature-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-pink) 10%, transparent);
  border: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-pink);
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
}

.feature-desc {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--muted);
  margin: 0;
}

.inline-code {
  font-family: var(--font-family-mono);
  font-size: 0.8em;
  color: var(--muted-strong);
  background: color-mix(in srgb, var(--panel-soft) 88%, var(--bg-elevated) 12%);
  border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
  padding: 0.14em 0.45em;
  border-radius: 999px;
}

/* ─── Showcase ──────────────────────────────────────────────────── */
.showcase {
  padding: 5rem 0;
  border-top: 1px solid var(--border);
}

.showcase-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
}

.showcase-panel-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}

.showcase-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-pink);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.showcase-cta {
  text-align: center;
  margin-top: 2.5rem;
}

/* ─── Get started ───────────────────────────────────────────────── */
.get-started {
  padding: 5rem 0;
  border-top: 1px solid var(--border);
}

.get-started-inner {
  text-align: center;
  max-width: 620px;
  margin-inline: auto;
}

.get-started-title {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}

.get-started-sub {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted);
  margin: 0 0 2rem;
}

.get-started-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.get-started-npm {
  display: flex;
  justify-content: center;
}

/* ─── Responsive ────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .hero-mark {
    left: -4rem;
    top: -1rem;
    opacity: 0.05;
  }

  .hero-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .hero-code-wrap { order: -1; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .showcase-grid { grid-template-columns: 1fr; }
  .showcase-arrow {
    flex-direction: row;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
  .hero { padding: 3.5rem 0 3rem; }
}
</style>
