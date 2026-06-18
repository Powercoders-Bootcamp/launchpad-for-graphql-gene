import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { buildUpstreamAuditSnapshot } from '../audit/upstream-audit'
import { buildKnowledgeCatalog } from '../compiler/build-catalog'
import type { BuildKnowledgeCatalogOptions, KnowledgeCatalog } from '../contracts'
import {
  getSitePluginKnowledge,
  getSiteRecipeKnowledge,
  getSiteTroubleshootingKnowledge,
} from './curated-knowledge'
import { siteDocsConfig } from './docs-config'
import { getSitePlaygroundExamples } from './playground-examples'
import { buildSiteKnowledgeProvenance } from './provenance'

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

const siteKnowledgeCatalogCache = new Map<string, {
  fingerprint: string
  catalog: KnowledgeCatalog
}>()

export function buildSiteKnowledgeCatalog(options: BuildSiteKnowledgeCatalogOptions) {
  const provenanceOverrides = buildSiteKnowledgeProvenance({
    workspaceRoot: options.workspaceRoot,
  })
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
    provenanceOverrides,
  }

  const catalog = buildKnowledgeCatalog(resolvedOptions)

  return {
    ...catalog,
    audit: buildUpstreamAuditSnapshot({
      workspaceRoot: resolvedOptions.workspaceRoot,
      sourceRepo: resolvedOptions.sourceRepo ?? 'graphql-gene-site',
      sourceRef: resolvedOptions.sourceRef ?? 'workspace',
      versionRange: resolvedOptions.versionRange,
      auditMetadata: provenanceOverrides.audit,
      catalog,
    }),
  } satisfies KnowledgeCatalog
}

export function buildCachedSiteKnowledgeCatalog(options: BuildSiteKnowledgeCatalogOptions) {
  const cacheKey = buildSiteKnowledgeCacheKey(options)
  const fingerprint = buildSiteKnowledgeFingerprint(options)
  const cached = siteKnowledgeCatalogCache.get(cacheKey)

  if (cached?.fingerprint === fingerprint) {
    return cached.catalog
  }

  const catalog = buildSiteKnowledgeCatalog(options)
  siteKnowledgeCatalogCache.set(cacheKey, { fingerprint, catalog })
  return catalog
}

export function clearSiteKnowledgeCatalogCache() {
  siteKnowledgeCatalogCache.clear()
}

function buildSiteKnowledgeCacheKey(options: BuildSiteKnowledgeCatalogOptions) {
  return JSON.stringify({
    workspaceRoot: resolve(options.workspaceRoot),
    sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
    sourceRef: options.sourceRef ?? 'workspace',
    versionRange: options.versionRange ?? null,
    docsRootRelativePath: options.docsRootRelativePath ?? SITE_DOCS_ROOT_RELATIVE_PATH,
    exampleCatalogSourcePath: options.exampleCatalogSourcePath ?? SITE_EXAMPLE_CATALOG_SOURCE_PATH,
    exampleRuntimeSourcePath: options.exampleRuntimeSourcePath ?? SITE_EXAMPLE_RUNTIME_SOURCE_PATH,
  })
}

function buildSiteKnowledgeFingerprint(options: BuildSiteKnowledgeCatalogOptions) {
  const docsRoot = resolve(options.workspaceRoot, options.docsRootRelativePath ?? SITE_DOCS_ROOT_RELATIVE_PATH)
  const docsFingerprint = fingerprintMarkdownDirectory(docsRoot)

  return JSON.stringify({
    docsFingerprint,
    packageFingerprint: fingerprintFile(resolve(options.workspaceRoot, 'package.json')),
    graphqlGenePackageFingerprint: fingerprintFile(resolve(options.workspaceRoot, 'node_modules/graphql-gene/package.json')),
    sequelizePluginPackageFingerprint: fingerprintFile(resolve(options.workspaceRoot, 'node_modules/@graphql-gene/plugin-sequelize/package.json')),
    pluginCount: getSitePluginKnowledge().length,
    recipeCount: getSiteRecipeKnowledge().length,
    troubleshootingCount: getSiteTroubleshootingKnowledge().length,
    exampleCount: getSitePlaygroundExamples().length,
  })
}

function fingerprintMarkdownDirectory(rootDir: string) {
  if (!existsSync(rootDir)) {
    return 'missing'
  }

  return collectMarkdownFingerprints(rootDir)
    .sort((left, right) => left.localeCompare(right))
    .join('|')
}

function fingerprintFile(filePath: string) {
  if (!existsSync(filePath)) {
    return 'missing'
  }

  const stats = statSync(filePath)
  return `${stats.size}:${Math.trunc(stats.mtimeMs)}`
}

function collectMarkdownFingerprints(rootDir: string, currentDir = rootDir): string[] {
  const fingerprints: string[] = []

  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const absolutePath = join(currentDir, entry.name)

    if (entry.isDirectory()) {
      fingerprints.push(...collectMarkdownFingerprints(rootDir, absolutePath))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue
    }

    const stats = statSync(absolutePath)
    const relativePath = absolutePath.slice(rootDir.length + 1).replace(/\\/g, '/')
    fingerprints.push(`${relativePath}:${stats.size}:${Math.trunc(stats.mtimeMs)}`)
  }

  return fingerprints
}
