import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { BuildSiteKnowledgeCatalogOptions } from './catalog'
import type { KnowledgeProvenanceOverrides } from '../contracts'

const UPSTREAM_REPO = 'https://github.com/accesimpot/graphql-gene'
const SITE_REPO = 'graphql-gene-site'

interface PackageJsonLike {
  version?: string
}

export function buildSiteKnowledgeProvenance(
  options: Pick<BuildSiteKnowledgeCatalogOptions, 'workspaceRoot'>,
): KnowledgeProvenanceOverrides {
  const graphqlGeneVersion = readPackageVersion(
    resolve(options.workspaceRoot, 'node_modules/graphql-gene/package.json'),
  ) ?? 'unknown'
  const pluginSequelizeVersion = readPackageVersion(
    resolve(options.workspaceRoot, 'node_modules/@graphql-gene/plugin-sequelize/package.json'),
  ) ?? 'unknown'
  const coreRef = `graphql-gene@${graphqlGeneVersion}`
  const pluginRef = `@graphql-gene/plugin-sequelize@${pluginSequelizeVersion}`

  return {
    audit: {
      upstreamRepo: UPSTREAM_REPO,
      auditedRef: `${coreRef}; ${pluginRef}`,
      auditor: 'codex',
    },
    docsBySlug: {
      '/docs/concepts/getting-started': upstreamDoc('README.md#quick-setup', coreRef, 'package-readme'),
      '/docs/guides/schema-design': upstreamDoc('README.md#query-filtering', coreRef, 'package-readme'),
      '/docs/guides/directives': upstreamDoc('README.md#define-directives', coreRef, 'package-readme'),
      '/docs/guides/polymorphic-blocks': upstreamDoc('docs/polymorphic-blocks.md', coreRef, 'canonical-doc'),
      '/docs/reference/writing-a-plugin': upstreamDoc('docs/plugins/writing-a-plugin.md', coreRef, 'canonical-doc'),
      '/mcp/setup': localOnly(),
      '/mcp/deployment': localOnly(),
      '/mcp/version-contract': localOnly(),
    },
    examplesByKey: {
      'model-to-schema:user-orders-basic': upstreamDoc('README.md#quick-setup', coreRef, 'package-readme'),
      'query-lookahead:me-with-orders': upstreamDoc('README.md#query-filtering', coreRef, 'package-readme'),
      'polymorphic-blocks:page-blocks-basic': upstreamDoc('docs/polymorphic-blocks.md', coreRef, 'canonical-doc'),
      'directive-middleware:user-auth-directive': upstreamDoc('README.md#example-user-authentication-directive', coreRef, 'package-readme'),
      'schema-inspection:generate-schema-artifacts': upstreamDoc('README.md#allow-inspecting-the-generated-schema', coreRef, 'package-readme'),
      'generated-query:products-filters-order-pagination': upstreamDoc('README.md#query-filtering', coreRef, 'package-readme'),
      'custom-mutation:register-prospect': upstreamDoc('README.md#define-queriesmutations-inside-your-model', coreRef, 'package-readme'),
      'custom-plugin:sequelize-reference-study': upstreamDoc('docs/plugins/writing-a-plugin.md', coreRef, 'canonical-doc'),
    },
    pluginsById: {
      sequelize: packageDerived('packages/plugin-sequelize/README.md', pluginRef, 'package-readme'),
      'custom-plugin': upstreamDoc('docs/plugins/writing-a-plugin.md', coreRef, 'canonical-doc'),
    },
    recipesById: {
      'sequelize-bootstrap': upstreamDoc('README.md#quick-setup', coreRef, 'package-readme'),
      'inspect-generated-schema-artifacts': upstreamDoc('README.md#allow-inspecting-the-generated-schema', coreRef, 'package-readme'),
      'add-generated-query-fields': upstreamDoc('README.md#default-resolver', coreRef, 'package-readme'),
      'generated-filters-order-pagination': upstreamDoc('README.md#query-filtering', coreRef, 'package-readme'),
      'query-lookahead-shape': upstreamDoc('README.md#query-filtering', coreRef, 'package-readme'),
      'custom-query-or-mutation': upstreamDoc('README.md#define-queriesmutations-inside-your-model', coreRef, 'package-readme'),
      'cache-friendly-mutation-payloads': siteLocalDoc('content/graphql-gene/docs/schema-design.md'),
      'directive-middleware-auth': upstreamDoc('README.md#define-directives', coreRef, 'package-readme'),
      'polymorphic-content-blocks': upstreamDoc('docs/polymorphic-blocks.md', coreRef, 'canonical-doc'),
      'custom-plugin-evaluation': upstreamDoc('docs/plugins/writing-a-plugin.md', coreRef, 'canonical-doc'),
      'write-minimal-custom-plugin': upstreamDoc('docs/plugins/writing-a-plugin.md', coreRef, 'canonical-doc'),
    },
    troubleshootingById: {
      'missing-types-in-generated-schema': upstreamDoc('README.md#export-all-models-from-one-file', coreRef, 'package-readme'),
      'directive-not-printed-in-sdl': upstreamDoc('README.md#define-directives', coreRef, 'package-readme'),
      'wrong-plugin-path-for-orm': upstreamDoc('docs/plugins/writing-a-plugin.md', coreRef, 'canonical-doc'),
      'lookahead-behavior-does-not-match-expectation': upstreamDoc('README.md#query-filtering', coreRef, 'package-readme'),
      'playground-runtime-differs-from-upstream-guidance': {
        provenanceStatus: 'local-only',
        upstreamSourcePath: 'content/graphql-gene/docs/mcp-server-setup.md',
        upstreamSourceRepo: SITE_REPO,
        upstreamSourceRef: 'workspace',
        upstreamSourceType: 'canonical-doc',
      },
    },
  }
}

function upstreamDoc(
  upstreamSourcePath: string,
  upstreamSourceRef: string,
  upstreamSourceType: 'canonical-doc' | 'package-readme',
) {
  return {
    provenanceStatus: 'upstream-projected' as const,
    upstreamSourcePath,
    upstreamSourceRepo: UPSTREAM_REPO,
    upstreamSourceRef,
    upstreamSourceType,
  }
}

function packageDerived(
  upstreamSourcePath: string,
  upstreamSourceRef: string,
  upstreamSourceType: 'package-readme' | 'package-metadata',
) {
  return {
    provenanceStatus: 'package-derived' as const,
    upstreamSourcePath,
    upstreamSourceRepo: UPSTREAM_REPO,
    upstreamSourceRef,
    upstreamSourceType,
  }
}

function localOnly() {
  return {
    provenanceStatus: 'local-only' as const,
    upstreamSourcePath: undefined,
    upstreamSourceRepo: undefined,
    upstreamSourceRef: undefined,
    upstreamSourceType: undefined,
  }
}

function siteLocalDoc(upstreamSourcePath: string) {
  return {
    provenanceStatus: 'local-only' as const,
    upstreamSourcePath,
    upstreamSourceRepo: SITE_REPO,
    upstreamSourceRef: 'workspace',
    upstreamSourceType: 'canonical-doc' as const,
  }
}

function readPackageVersion(filePath: string) {
  if (!existsSync(filePath)) {
    return null
  }

  try {
    const packageJson = JSON.parse(readFileSync(filePath, 'utf8')) as PackageJsonLike
    return packageJson.version ?? null
  }
  catch {
    return null
  }
}
