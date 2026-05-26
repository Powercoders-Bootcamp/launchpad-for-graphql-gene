import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { DocsConfig } from '~/types'

let _config: DocsConfig | null = null

export function getDocsConfig(): DocsConfig {
  if (_config) return _config

  const configPath = resolve('content/graphql-gene/docs.config.ts')

  try {
    // In production: import and evaluate the compiled config
    // For now: return a safe default that matches the expected shape
    // TODO: replace with proper dynamic import when submodule/docs are present
    _config = {
      docsRoot: 'docs',
      sections: [
        { id: 'concepts',  title: 'Concepts',   order: 1 },
        { id: 'guides',    title: 'Guides',      order: 2 },
        { id: 'reference', title: 'Reference',   order: 3 },
        { id: 'examples',  title: 'Examples',    order: 4 },
        { id: 'tutorials', title: 'Tutorials',   order: 5 },
      ],
    }
  }
  catch {
    _config = { docsRoot: 'docs', sections: [] }
  }

  return _config
}
