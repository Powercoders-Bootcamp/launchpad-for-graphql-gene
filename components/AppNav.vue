<template>
  <header class="nav-root">
    <div class="container-site nav-inner">

      <NuxtLink to="/" class="nav-logo">
        <img src="/images/logo.svg" width="32" height="32" alt="graphql-gene logo" />
        <span class="nav-logo-text">graphql<span class="nav-logo-accent">-gene</span></span>
      </NuxtLink>

      <nav class="nav-links">
        <NuxtLink to="/playground" class="nav-link">Playground</NuxtLink>
        <NuxtLink to="/docs" class="nav-link">Docs</NuxtLink>
        <a
          href="https://github.com/accesimpot/graphql-gene"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link nav-link-icon"
          aria-label="GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </nav>

      <button class="nav-theme-btn" @click="toggleTheme?.()" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`">
        <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

    </div>
  </header>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'

const toggleTheme = inject<() => void>('toggleTheme')
const theme = inject<Ref<'dark' | 'light'>>('theme')
</script>

<style scoped>
.nav-root {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
}

.nav-inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 2rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  flex-shrink: 0;
}

.nav-logo-text {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
  letter-spacing: -0.01em;
}

.nav-logo-accent {
  color: var(--color-pink);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover {
  color: var(--text);
  background: var(--panel-soft);
}

.nav-link-icon {
  gap: 0.35rem;
}

.nav-theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel-soft);
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}

.nav-theme-btn:hover {
  color: var(--text);
  background: var(--panel);
}

@media (max-width: 640px) {
  .nav-links {
    display: none;
  }
}
</style>
