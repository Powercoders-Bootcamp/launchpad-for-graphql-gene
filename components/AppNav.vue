<template>
  <header class="nav-root">
    <div class="container-site nav-inner">

      <NuxtLink :to="localePath('/')" class="nav-logo">
        <img src="/images/logo.svg" width="32" height="32" alt="graphql-gene logo" />
        <span class="nav-logo-text">graphql<span class="nav-logo-accent">-gene</span></span>
      </NuxtLink>

      <div class="nav-actions">
        <nav class="nav-links">
          <NuxtLink :to="localePath('/docs')" class="nav-link">{{ t('nav.docs') }}</NuxtLink>
          <NuxtLink :to="localePath('/playground')" class="nav-link">{{ t('nav.playground') }}</NuxtLink>
        </nav>

        <div ref="localeFlyoutRef" class="nav-locale-flyout">
          <button
            type="button"
            class="nav-locale-trigger"
            aria-haspopup="true"
            :aria-expanded="isLocaleMenuOpen ? 'true' : 'false'"
            :aria-label="t('nav.language')"
            @click="toggleLocaleMenu"
          >
            <span class="nav-locale-current">{{ currentLocaleOption.shortLabel }}</span>
            <svg
              class="nav-locale-chevron"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 4.5 6 7.5 9 4.5"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <transition name="nav-flyout">
            <div
              v-if="isLocaleMenuOpen"
              class="nav-locale-menu"
              role="menu"
              :aria-label="t('nav.language')"
            >
              <button
                v-for="item in localeOptions"
                :key="item.code"
                type="button"
                class="nav-locale-option"
                :class="{ 'is-active': item.code === locale }"
                role="menuitemradio"
                :aria-checked="item.code === locale ? 'true' : 'false'"
                @click="selectLocale(item.code)"
              >
                <span class="nav-locale-option-name">{{ item.name }}</span>
              </button>
            </div>
          </transition>
        </div>

        <button
          class="nav-icon-btn nav-theme-btn"
          @click="toggleTheme?.()"
          :aria-label="t('nav.switchTheme', { mode: themeModeLabel })"
        >
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

        <a
          href="https://github.com/accesimpot/graphql-gene"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-icon-btn nav-github-btn"
          :aria-label="t('nav.github')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const toggleTheme = inject<() => void>('toggleTheme')
const theme = inject<Ref<'dark' | 'light'>>('theme')
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale, locales, t } = useI18n()
const localeFlyoutRef = ref<HTMLElement | null>(null)
const isLocaleMenuOpen = ref(false)

const localeOptions = computed(() =>
  locales.value.map((entry) => {
    if (typeof entry === 'string') {
      return {
        code: entry,
        name: entry.toUpperCase(),
        shortLabel: t(`common.locales.${entry}`),
      }
    }

    return {
      code: entry.code,
      name: entry.name || entry.code.toUpperCase(),
      shortLabel: t(`common.locales.${entry.code}`),
    }
  }),
)

const currentLocaleOption = computed(
  () =>
    localeOptions.value.find((item) => item.code === locale.value) ?? localeOptions.value[0] ?? {
      code: locale.value,
      name: locale.value.toUpperCase(),
      shortLabel: locale.value.toUpperCase(),
    },
)

const themeModeLabel = computed(() =>
  theme?.value === 'dark'
    ? t('nav.light')
    : t('nav.dark'),
)

function toggleLocaleMenu() {
  isLocaleMenuOpen.value = !isLocaleMenuOpen.value
}

function closeLocaleMenu() {
  isLocaleMenuOpen.value = false
}

async function selectLocale(nextLocale: string) {
  closeLocaleMenu()
  if (nextLocale === locale.value) {
    return
  }

  const nextPath = switchLocalePath(nextLocale)
  if (nextPath) {
    await navigateTo(nextPath)
  }
}

function handleDocumentPointerDown(event: MouseEvent) {
  const target = event.target as Node | null
  if (!isLocaleMenuOpen.value || !target) {
    return
  }

  if (localeFlyoutRef.value?.contains(target)) {
    return
  }

  closeLocaleMenu()
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeLocaleMenu()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
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
  width: 100%;
  max-width: none;
  margin-inline: 0;
  padding-inline: 60px;
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.nav-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.nav-icon-btn svg {
  width: 18px;
  height: 18px;
}

.nav-icon-btn:hover {
  color: var(--text);
  background: transparent;
}

.nav-locale-flyout {
  position: relative;
}

.nav-locale-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  position: relative;
  height: 36px;
  margin-inline: 0.75rem;
  padding: 0 0.62rem 0 0.72rem;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease,
    box-shadow 0.18s ease;
}

.nav-locale-trigger::before,
.nav-locale-trigger::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 1px;
  height: 18px;
  background: var(--border);
  transform: translateY(-50%);
  pointer-events: none;
}

.nav-locale-trigger::before {
  left: -0.75rem;
}

.nav-locale-trigger::after {
  right: -0.75rem;
}

.nav-locale-trigger:hover,
.nav-locale-trigger[aria-expanded='true'] {
  background: var(--panel-soft);
  box-shadow: none;
}

.nav-locale-trigger:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-pink) 55%, white);
  outline-offset: 2px;
}

.nav-locale-current {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
}

.nav-locale-chevron {
  color: var(--muted);
  transition: transform 0.18s ease, color 0.18s ease;
}

.nav-locale-trigger[aria-expanded='true'] .nav-locale-chevron {
  color: var(--text);
  transform: rotate(180deg);
}

.nav-locale-menu {
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  min-width: 148px;
  padding: 0.35rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg) 94%, transparent);
  box-shadow: 0 18px 36px color-mix(in srgb, black 16%, transparent);
  backdrop-filter: blur(14px);
}

.nav-locale-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.68rem 0.78rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.nav-locale-option:hover,
.nav-locale-option.is-active {
  background: var(--panel-soft);
  color: var(--text);
}

.nav-locale-option:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-pink) 55%, white);
  outline-offset: 1px;
}

.nav-locale-option-name {
  font-size: 0.84rem;
  font-weight: 600;
}

.nav-flyout-enter-active,
.nav-flyout-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: top right;
}

.nav-flyout-enter-from,
.nav-flyout-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}

@media (max-width: 640px) {
  .nav-links {
    display: none;
  }

  .nav-actions {
    margin-left: auto;
  }

  .nav-inner {
    gap: 0.75rem;
  }
}
</style>
