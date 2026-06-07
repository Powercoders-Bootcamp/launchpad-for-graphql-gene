<template>
  <footer class="footer-root">
    <div class="container-site footer-inner">
      <section class="footer-brand">
        <div class="footer-logo">
          <img src="/images/logo.svg" width="28" height="28" alt="graphql-gene logo" />
          <span class="footer-logo-text">graphql<span class="footer-logo-accent">-gene</span></span>
        </div>

        <p class="footer-tagline">
          {{ t('footer.tagline') }}
        </p>
      </section>

      <div class="footer-links">
        <div class="footer-col">
          <p class="footer-col-title">{{ t('footer.product') }}</p>
          <NuxtLink :to="localePath('/playground')" class="footer-link">{{ t('footer.livePlayground') }}</NuxtLink>
          <NuxtLink :to="localePath('/docs')" class="footer-link">{{ t('footer.documentation') }}</NuxtLink>
          <NuxtLink :to="localePath('/docs/guides/schema-design')" class="footer-link">{{ t('footer.schemaDesign') }}</NuxtLink>
        </div>

        <div class="footer-col">
          <p class="footer-col-title">{{ t('footer.scenarios') }}</p>
          <NuxtLink :to="localePath({ path: '/playground', query: { scenario: 'model-to-schema' } })" class="footer-link">{{ t('footer.modelToSchema') }}</NuxtLink>
          <NuxtLink :to="localePath({ path: '/playground', query: { scenario: 'query-lookahead' } })" class="footer-link">{{ t('footer.queryLookahead') }}</NuxtLink>
          <NuxtLink :to="localePath({ path: '/playground', query: { scenario: 'directive-middleware' } })" class="footer-link">{{ t('footer.directiveMiddleware') }}</NuxtLink>
        </div>

        <div class="footer-col">
          <p class="footer-col-title">{{ t('footer.resources') }}</p>
          <a href="https://github.com/accesimpot/graphql-gene" target="_blank" rel="noopener noreferrer" class="footer-link">{{ t('footer.github') }}</a>
          <a href="https://www.npmjs.com/package/graphql-gene" target="_blank" rel="noopener noreferrer" class="footer-link">{{ t('footer.npm') }}</a>
          <a href="https://github.com/accesimpot/graphql-gene/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="footer-link">{{ t('footer.license') }}</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>{{ t('footer.builtWith') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<style scoped>
.footer-root {
  border-top: 1px solid var(--border);
  margin-top: 6rem;
}

.footer-inner {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  align-items: flex-start;
  gap: 2rem 2.5rem;
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2.25rem;
  align-items: flex-start;
  padding-top: 0.15rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
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

@media (max-width: 980px) {
  .footer-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
