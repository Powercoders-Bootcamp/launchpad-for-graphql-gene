<template>
  <footer class="footer-root">
    <div class="container-site footer-inner">
      <section class="footer-brand">
        <div class="footer-logo">
          <img src="/images/logo.svg" width="28" height="28" alt="graphql-gene logo" />
          <span class="footer-logo-text">graphql<span class="footer-logo-accent">-gene</span></span>
        </div>

        <p class="footer-tagline">
          ORM-native GraphQL generation for TypeScript teams that want schema output, query
          execution, and SQL behavior to stay visible in one place.
        </p>
      </section>

      <div class="footer-links">
        <div class="footer-col">
          <p class="footer-col-title">Product</p>
          <NuxtLink to="/playground" class="footer-link">Live Playground</NuxtLink>
          <NuxtLink to="/docs" class="footer-link">Documentation</NuxtLink>
          <NuxtLink to="/docs/guides/schema-design" class="footer-link">Schema Design</NuxtLink>
        </div>

        <div class="footer-col">
          <p class="footer-col-title">Scenarios</p>
          <NuxtLink to="/playground?scenario=model-to-schema" class="footer-link">Model to schema</NuxtLink>
          <NuxtLink to="/playground?scenario=query-lookahead" class="footer-link">Query lookahead</NuxtLink>
          <NuxtLink to="/playground?scenario=directive-middleware" class="footer-link">Directive middleware</NuxtLink>
        </div>

        <div class="footer-col">
          <p class="footer-col-title">Resources</p>
          <a href="https://github.com/accesimpot/graphql-gene" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
          <a href="https://www.npmjs.com/package/graphql-gene" target="_blank" rel="noopener noreferrer" class="footer-link">npm</a>
          <a href="https://github.com/accesimpot/graphql-gene/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="footer-link">MIT License</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>Built with Nuxt. Playground execution uses graphql-gene, Sequelize, and SQLite.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-root {
  border-top: 1px solid var(--border);
  margin-top: 6rem;
}

.footer-inner {
  display: grid;
  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
  align-items: flex-start;
  gap: 2rem 3rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 320px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-logo-text {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
}

.footer-logo-accent {
  color: var(--color-pink);
}

.footer-tagline {
  font-size: 0.92rem;
  color: var(--muted);
  line-height: 1.7;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-top: 0.15rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 12rem;
}

.footer-col-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted-strong);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.25rem;
}

.footer-link {
  font-size: 0.9rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s ease, transform 0.15s ease;
}

.footer-link:hover {
  color: var(--color-pink);
  transform: translateX(2px);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--muted);
}

@media (max-width: 720px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-links {
    gap: 2rem;
  }

  .footer-col {
    min-width: 0;
  }
}
</style>
