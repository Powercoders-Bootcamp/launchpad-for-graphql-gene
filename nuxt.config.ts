import tailwindcss from '@tailwindcss/vite'

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
})
