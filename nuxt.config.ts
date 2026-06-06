import tailwindcss from '@tailwindcss/vite'
import { docsConfig } from './content/graphql-gene/docs.config'
import { validateDocsFrontmatter } from './server/utils/docs-validation'

const docsValidation = validateDocsFrontmatter({
  docsDir: './content/graphql-gene/docs',
  docsConfig,
})

const docsCodeTheme = {
  name: 'graphql-gene-code',
  type: 'dark' as const,
  fg: '#e9eefc',
  bg: '#0d1323',
  colors: {
    'editor.background': '#0d1323',
    'editor.foreground': '#e9eefc',
    'editor.lineHighlightBackground': '#11192d',
    'editor.selectionBackground': '#2a3553',
    'editorLineNumber.foreground': '#66769a',
  },
  tokenColors: [
    {
      scope: ['comment', 'comment.block', 'comment.line', 'punctuation.definition.comment'],
      settings: { foreground: '#7f8fb1', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'keyword.control', 'keyword.operator', 'storage', 'storage.modifier', 'storage.type'],
      settings: { foreground: '#c4b5fd' },
    },
    {
      scope: ['string', 'string.quoted', 'string.template', 'constant.other.symbol', 'markup.inline.raw.string'],
      settings: { foreground: '#8df4c1' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'variable.function', 'meta.function-call', 'entity.name.method'],
      settings: { foreground: '#7dd3fc' },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'support.type',
        'support.class',
        'support.type.primitive',
        'constant.numeric',
        'constant.language',
        'constant.character.escape',
      ],
      settings: { foreground: '#f9a8d4' },
    },
    {
      scope: [
        'variable.parameter',
        'meta.object-literal.key',
        'entity.other.attribute-name',
        'support.variable.property',
        'variable.object.property',
        'entity.name.field',
      ],
      settings: { foreground: '#f9a8d4' },
    },
    {
      scope: ['punctuation', 'meta.brace', 'meta.delimiter'],
      settings: { foreground: '#98a7c8' },
    },
    {
      scope: ['variable', 'source', 'text'],
      settings: { foreground: '#e9eefc' },
    },
  ],
}

for (const warning of docsValidation.warnings) {
  console.warn('\x1b[33m[docs-val]\x1b[0m', warning)
}

if (docsValidation.errors.length) {
  throw new Error(`\n[docs-val] Frontmatter validation failed:\n${docsValidation.errors.join('\n')}`)
}

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  nitro: process.platform === 'win32'
    ? {
        externals: {
          // Avoid a Windows-specific readlink failure from node-externals tracing.
          trace: false,
        },
      }
    : undefined,

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
        default: docsCodeTheme,
        dark: docsCodeTheme,
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

  mdc: {
    highlight: {
      theme: {
        default: docsCodeTheme,
        dark: docsCodeTheme,
      },
      langs: ['typescript', 'graphql', 'sql', 'bash', 'json', 'yaml'],
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
