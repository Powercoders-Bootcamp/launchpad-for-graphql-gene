<template>
  <div>

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="hero">
      <div class="container-site hero-inner">

        <div class="hero-text">
          <h1 class="hero-title">
            {{ ti('home.hero.titleLead') }}<br>
            <span class="hero-title-accent">{{ ti('home.hero.titleAccent') }}</span>
          </h1>
          <p class="hero-desc">
            graphql-gene is ORM-native and generator-first. It reads your Sequelize models
            and generates a complete, production-ready GraphQL schema — with smart
            query lookahead built in.
          </p>
          <p class="hero-proof">
            The differentiator is not polymorphism alone. It is automatic schema generation
            from the real model layer instead of hand-assembling a generic schema builder.
          </p>
          <div class="hero-actions">
            <NuxtLink :to="localePath('/playground')" class="btn-primary">{{ ti('home.hero.primaryCta') }}</NuxtLink>
            <NuxtLink :to="localePath('/docs')" class="btn-ghost">{{ ti('home.hero.secondaryCta') }}</NuxtLink>
            <div class="hero-npm">
              <code class="npm-cmd">{{ ti('home.hero.install') }}</code>
            </div>
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
    <section class="mcp-strip">
      <div class="container-site">
        <div class="mcp-strip-card">
          <div class="mcp-strip-copy">
            <p class="mcp-strip-eyebrow">For coding agents and IDE workflows</p>
            <h2 class="mcp-strip-title">GraphQL Gene now ships with a developer MCP server.</h2>
            <p class="mcp-strip-desc">
              Give Claude Desktop, Cursor, and other MCP clients source-backed GraphQL Gene guidance for an
              ORM-native, generator-first workflow: docs search, plugin strategy, integration planning, and issue
              diagnosis.
            </p>
          </div>
          <div class="mcp-strip-meta">
            <div class="mcp-strip-command-list">
              <code class="npm-cmd">npm run mcp:print-config</code>
              <code class="npm-cmd">npm run mcp:doctor</code>
            </div>
            <div class="mcp-strip-actions">
              <NuxtLink :to="mcpSetupPath" class="btn-primary">MCP setup guide</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container-site">
        <h2 class="section-title">{{ ti('home.features.title') }}</h2>
        <p class="section-sub">{{ ti('home.features.subtitle') }}</p>
        <div class="features-grid">

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ ti('home.features.ormNativeTitle') }}</h3>
            <p class="feature-desc">Define your Sequelize models once. graphql-gene generates types, queries, and mutations automatically — no hand-rolled resolvers.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ ti('home.features.lookaheadTitle') }}</h3>
            <p class="feature-desc">Your resolvers know exactly which relations the query needs. Sequelize builds optimized JOINs automatically — zero N+1 problems.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ ti('home.features.directivesTitle') }}</h3>
            <p class="feature-desc">Attach runtime behavior to any field with a decorator. Auth, validation, and rate-limiting as first-class schema citizens.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ ti('home.features.typesTitle') }}</h3>
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
            <h3 class="feature-title">{{ ti('home.features.pluginsTitle') }}</h3>
            <p class="feature-desc">Drop in <code class="inline-code">@graphql-gene/plugin-sequelize</code> and get Sequelize support out of the box. More adapters on the way.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h3 class="feature-title">Developer MCP Server</h3>
            <p class="feature-desc">Connect Claude Desktop, Cursor, and other MCP clients to source-backed GraphQL Gene tools for docs search, plugin strategy, integration planning, and issue diagnosis.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── Code showcase ─────────────────────────────────────────── -->
    <section class="showcase">
      <div class="container-site">
        <h2 class="section-title">{{ ti('home.showcase.title') }}</h2>
        <p class="section-sub section-sub--showcase">{{ ti('home.showcase.subtitle') }}</p>
        <p class="section-sub">From Sequelize model to a working GraphQL API — no boilerplate, no drift.</p>
        <div class="showcase-grid">

          <div class="showcase-panel">
            <div class="showcase-panel-label">{{ ti('home.showcase.queryLabel') }}</div>
            <div class="code-window">
              <div class="code-window-bar">
                <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
                <span class="code-window-label">page-blocks.query.graphql</span>
              </div>
              <pre class="code-body"><code v-html="showcaseQuery" /></pre>
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
            <div class="showcase-panel-label">{{ ti('home.showcase.resultLabel') }}</div>
            <div class="code-window">
              <div class="code-window-bar">
                <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
                <span class="code-window-label">response.json</span>
              </div>
              <pre class="code-body"><code v-html="showcaseResult" /></pre>
            </div>
          </div>

        </div>
        <div class="showcase-cta">
          <NuxtLink :to="polymorphicPlaygroundPath" class="btn-primary">{{ ti('home.showcase.cta') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─── Get started ───────────────────────────────────────────── -->
    <section class="get-started">
      <div class="container-site get-started-inner">
        <h2 class="get-started-title">{{ ti('home.getStarted.title') }}</h2>
        <p class="get-started-sub">{{ ti('home.getStarted.subtitle') }}</p>
        <div class="get-started-actions">
          <NuxtLink :to="localePath('/playground')" class="btn-primary btn-lg">{{ ti('home.getStarted.primaryCta') }}</NuxtLink>
          <NuxtLink :to="localePath('/docs')" class="btn-outline btn-lg">{{ ti('home.getStarted.secondaryCta') }}</NuxtLink>
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
const { t: ti } = useI18n()
const localePath = useLocalePath()
const polymorphicPlaygroundPath = `${localePath('/playground')}?scenario=polymorphic-blocks&example=page-blocks-basic`
const mcpSetupPath = localePath('/docs/guides/mcp-server-setup')
useSeoMeta({
  title: 'graphql-gene — ORM-native GraphQL generation',
  description: 'Generate production-ready GraphQL schemas from your Sequelize models with an ORM-native, generator-first workflow. Smart query lookahead, directive middleware, and full TypeScript support.',
})

useSeoMeta({
  title: () => ti('home.seo.title'),
  description: () => ti('home.seo.description'),
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

const showcaseQuery = [
  `${k('query')} ${t('PagePolymorphicBlocks')}($path: ${t('String!')}) {`,
  `  pageByPath(`,
  `    where: { path: { eq: $path } }`,
  `  ) {`,
  `    id`,
  `    path`,
  `    blocks {`,
  `      id`,
  `      __typename`,
  ``,
  `      ... ${k('on')} ${t('HeroBlock')} {`,
  `        title`,
  `        subtitle`,
  `      }`,
  ``,
  `      ... ${k('on')} ${t('TextBlock')} {`,
  `        body`,
  `      }`,
  `    }`,
  `  }`,
  `}`,
].join('\n')

const showcaseResult = [
  `{`,
  `  ${s('"data"')}: {`,
  `    ${s('"pageByPath"')}: {`,
  `      ${s('"id"')}: 1,`,
  `      ${s('"path"')}: ${s('"/__polymorphic_demo_page__"')},`,
  `      ${s('"blocks"')}: [`,
  `        {`,
  `          ${s('"id"')}: 101,`,
  `          ${s('"__typename"')}: ${s('"HeroBlock"')},`,
  `          ${s('"title"')}: ${s('"Hello"')},`,
  `          ${s('"subtitle"')}: ${s('"Polymorphic demo hero"')}`,
  `        },`,
  `        {`,
  `          ${s('"id"')}: 102,`,
  `          ${s('"__typename"')}: ${s('"TextBlock"')},`,
  `          ${s('"body"')}: ${s('"Plain text body."')}`,
  `        }`,
  `      ]`,
  `    }`,
  `  }`,
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

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  position: relative;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 46rem;
}

.hero-title {
  font-size: clamp(3.15rem, 7vw, 4.75rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 1rem;
}

.hero-title-accent {
  background: linear-gradient(135deg, var(--color-pink) 0%, var(--color-violet) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  line-height: 1.5;
  color: var(--muted);
  margin: 0 0 0.9rem;
  max-width: 40rem;
}

.hero-proof {
  margin: 0 0 2rem;
  max-width: 38rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--muted-strong);
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-npm {
  display: inline-flex;
  align-items: center;
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
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: min(100%, 68rem);
  align-items: stretch;
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

.mcp-strip {
  padding: 0 0 5rem;
}

.mcp-strip-card {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(18rem, 0.95fr);
  gap: 1.5rem;
  align-items: center;
  padding: 1.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-site-lg);
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--color-pink) 14%, transparent) 0, transparent 42%),
    linear-gradient(180deg, color-mix(in srgb, var(--panel) 90%, var(--panel-soft) 10%) 0%, var(--panel-soft) 100%);
  box-shadow: 0 20px 50px color-mix(in srgb, var(--color-pink) 8%, transparent);
}

.mcp-strip-copy {
  max-width: 42rem;
}

.mcp-strip-eyebrow {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-pink);
}

.mcp-strip-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.45rem, 2.2vw, 2rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text);
}

.mcp-strip-desc {
  margin: 0;
  font-size: 0.97rem;
  line-height: 1.7;
  color: var(--muted);
}

.mcp-strip-meta {
  display: grid;
  gap: 1rem;
  justify-items: start;
}

.mcp-strip-command-list {
  display: grid;
  gap: 0.65rem;
}

.mcp-strip-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

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

.showcase .section-sub:not(.section-sub--showcase) {
  display: none;
}

.showcase .code-body {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  overflow-x: hidden;
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
  .hero-inner {
    gap: 3rem;
  }
  .hero-code-wrap {
    grid-template-columns: 1fr;
  }
  .mcp-strip-card {
    grid-template-columns: 1fr;
  }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .showcase-grid { grid-template-columns: 1fr; }
  .showcase-arrow {
    flex-direction: column;
    margin: 0 auto;
  }
  .showcase-arrow svg {
    transform: rotate(90deg);
  }
}

@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
  .hero { padding: 3.5rem 0 3rem; }
  .mcp-strip {
    padding-bottom: 3.5rem;
  }
  .mcp-strip-card {
    padding: 1.25rem;
  }
  .hero-title {
    font-size: clamp(2.7rem, 14vw, 3.4rem);
  }
  .hero-desc {
    font-size: 1.05rem;
    line-height: 1.65;
  }
}
</style>
