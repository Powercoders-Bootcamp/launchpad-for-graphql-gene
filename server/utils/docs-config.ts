import type { DocsConfig } from '~/types'

const FALLBACK_CONFIG: DocsConfig = {
  docsRoot: 'docs',
  sections: [],
}

let _config: DocsConfig | null = null

export function getDocsConfig(): DocsConfig {
  if (_config) return _config

  try {
    // docsConfig is bundled by Nitro/Rollup at build time from
    // content/graphql-gene/docs.config.ts. Falls back to empty sections
    // when the docs source has not been placed yet (e.g. fresh clone).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../../content/graphql-gene/docs.config') as { docsConfig: DocsConfig }
    _config = mod.docsConfig ?? FALLBACK_CONFIG
  }
  catch {
    _config = FALLBACK_CONFIG
  }

  return _config
}
