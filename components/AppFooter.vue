<template>
  <footer class="footer-root">
    <div class="container-site footer-inner">

      <div class="footer-brand">
        <div class="footer-logo">
          <img src="/images/logo.svg" width="28" height="28" alt="graphql-gene logo" />
          <span class="footer-logo-text">graphql<span style="color: var(--color-pink)">-gene</span></span>
        </div>
        <p class="footer-tagline">ORM-native GraphQL generation for TypeScript.</p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <p class="footer-col-title">Product</p>
          <NuxtLink to="/playground" class="footer-link">Playground</NuxtLink>
          <NuxtLink to="/docs" class="footer-link">Documentation</NuxtLink>
        </div>
        <div class="footer-col">
          <p class="footer-col-title">Resources</p>
          <a href="https://github.com/accesimpot/graphql-gene" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
          <a href="https://www.npmjs.com/package/graphql-gene" target="_blank" rel="noopener noreferrer" class="footer-link">npm</a>
        </div>
      </div>

    </div>
    <div class="footer-bottom">
      <p>Released under the MIT License. Built with Nuxt.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-root {
  border-top: 1px solid var(--border);
  margin-top: 6rem;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  flex-wrap: wrap;
}

.footer-brand {
  max-width: 260px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.footer-logo-text {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
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
  font-size: 0.875rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-link:hover {
  color: var(--color-pink);
}

.footer-bottom {
  border-top: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
