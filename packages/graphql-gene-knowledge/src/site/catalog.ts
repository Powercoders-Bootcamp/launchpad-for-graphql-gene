import { resolve } from 'node:path'
import { buildKnowledgeCatalog } from '../compiler/build-catalog'
import type { BuildKnowledgeCatalogOptions } from '../contracts'
import {
  getSitePluginKnowledge,
  getSiteRecipeKnowledge,
  getSiteTroubleshootingKnowledge,
} from './curated-knowledge'
import { siteDocsConfig } from './docs-config'
import { getSitePlaygroundExamples } from './playground-examples'

export const SITE_DOCS_ROOT_RELATIVE_PATH = 'content/graphql-gene/docs'
export const SITE_EXAMPLE_CATALOG_SOURCE_PATH = 'server/utils/playground/registry.ts'
export const SITE_EXAMPLE_RUNTIME_SOURCE_PATH = 'server/utils/playground/engine.ts'

export interface BuildSiteKnowledgeCatalogOptions {
  workspaceRoot: string
  sourceRepo?: string
  sourceRef?: string
  versionRange?: string
  docsRootRelativePath?: string
  exampleCatalogSourcePath?: string
  exampleRuntimeSourcePath?: string
}

export function buildSiteKnowledgeCatalog(options: BuildSiteKnowledgeCatalogOptions) {
  const resolvedOptions: BuildKnowledgeCatalogOptions = {
    workspaceRoot: options.workspaceRoot,
    docsRoot: resolve(options.workspaceRoot, options.docsRootRelativePath ?? SITE_DOCS_ROOT_RELATIVE_PATH),
    docsConfig: siteDocsConfig,
    examples: getSitePlaygroundExamples(),
    plugins: getSitePluginKnowledge(),
    recipes: getSiteRecipeKnowledge(),
    troubleshooting: getSiteTroubleshootingKnowledge(),
    sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
    sourceRef: options.sourceRef ?? 'workspace',
    versionRange: options.versionRange,
    exampleCatalogSourcePath: options.exampleCatalogSourcePath ?? SITE_EXAMPLE_CATALOG_SOURCE_PATH,
    exampleRuntimeSourcePath: options.exampleRuntimeSourcePath ?? SITE_EXAMPLE_RUNTIME_SOURCE_PATH,
  }

  return buildKnowledgeCatalog(resolvedOptions)
}
