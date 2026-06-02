import tailwindcss from '@tailwindcss/vite'

const REQUIRED_FRONTMATTER = ['title', 'description', 'section', 'order', 'slug'] as const
const KNOWN_SECTIONS = ['concepts', 'guides', 'reference', 'examples', 'tutorials'] as const
const KNOWN_STATUSES = ['stable', 'experimental', 'planned', 'deprecated'] as const
const KNOWN_PLAYGROUND_SCENARIOS = ['model-to-schema', 'query-lookahead', 'polymorphic-blocks', 'directive-middleware'] as const

// Collects slugs across all doc files during build for uniqueness check
const _docsSlugs = new Map<string, string>() // slug → _path

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/content',
    'nuxt-monaco-editor',
  ],

  content: {
    sources: {
      graphqlGeneDocs: {
        driver: 'fs',
        base: './content/graphql-gene/docs',
        prefix: '/docs',
      },
    },
    highlight: {
      theme: {
        dark: 'github-dark',
        light: 'github-light',
      },
      langs: ['typescript', 'graphql', 'sql', 'bash', 'json', 'yaml'],
    },
  },

  monacoEditor: {
    locale: 'en',
    componentName: {
      codeEditor: 'MonacoEditor',
      diffEditor: 'MonacoDiffEditor',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  hooks: {
    async 'content:file:afterParse'(file) {
      if (!file._path?.startsWith('/docs')) return

      const path = file._path as string
      const errors: string[] = []
      const warns: string[] = []

      // Required fields — fail build if missing
      for (const field of REQUIRED_FRONTMATTER) {
        if (!file[field] && file[field] !== 0) {
          errors.push(`[${path}] Missing required frontmatter field: "${field}"`)
        }
      }

      // Section must be in known list — fail build if unknown
      if (file.section && !KNOWN_SECTIONS.includes(file.section as typeof KNOWN_SECTIONS[number])) {
        errors.push(`[${path}] Unknown section "${file.section}". Known: ${KNOWN_SECTIONS.join(', ')}`)
      }

      // Slug uniqueness — fail build if duplicate
      if (file.slug) {
        const existing = _docsSlugs.get(file.slug as string)
        if (existing) {
          errors.push(`[${path}] Duplicate slug "${file.slug}" (already used by ${existing})`)
        }
        else {
          _docsSlugs.set(file.slug as string, path)
        }
      }

      // Soft warnings — warn only, do not fail
      if (!file.summary) warns.push(`[${path}] Missing optional "summary" field`)
      if (!file.status) warns.push(`[${path}] Missing optional "status" field (defaults to stable)`)
      if (file.status && !KNOWN_STATUSES.includes(file.status as typeof KNOWN_STATUSES[number])) {
        warns.push(`[${path}] Unknown status "${file.status}". Known: ${KNOWN_STATUSES.join(', ')}`)
      }
      if (file.playgroundScenario && !KNOWN_PLAYGROUND_SCENARIOS.includes(file.playgroundScenario as typeof KNOWN_PLAYGROUND_SCENARIOS[number])) {
        warns.push(`[${path}] Unknown playgroundScenario "${file.playgroundScenario}"`)
      }

      for (const msg of warns) console.warn('\x1b[33m[docs-val]\x1b[0m', msg)
      if (errors.length) throw new Error(`\n[docs-val] Frontmatter validation failed:\n${errors.join('\n')}`)
    },
  },
})
