import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type {
  AuditedPackageCapability,
  PackageCapabilityEvidence,
  PackageCapabilityParityStatus,
  PackageParityAudit,
} from '../contracts'

const GRAPHQL_GENE_PACKAGE = 'graphql-gene'
const SEQUELIZE_PLUGIN_PACKAGE = '@graphql-gene/plugin-sequelize'
const POLYMORPHIC_EXPORT_WARNING = 'The docs describe a @Polymorphic pattern, but the installed @graphql-gene/plugin-sequelize export surface did not confirm a public "Polymorphic" export. Verify upstream/package parity before presenting it as a directly importable API.'

interface BuildPackageParityAuditOptions {
  workspaceRoot: string
}

interface PackageJsonLike {
  version?: string
  dependencies?: Record<string, string>
}

interface CapabilityPublicApiSpec {
  symbol: string
  sourcePath: string
  match?: RegExp
}

interface CapabilitySpec {
  capabilityId: string
  title: string
  summary: string
  packageNames: string[]
  docsPaths: string[]
  relatedTaskIds: string[]
  paritySensitive: boolean
  publicApis: CapabilityPublicApiSpec[]
  missingStatus?: Extract<PackageCapabilityParityStatus, 'conceptual-pattern' | 'unresolved'>
  warningWhenMissing?: string
}

const CAPABILITY_SPECS: CapabilitySpec[] = [
  {
    capabilityId: 'schema-generation',
    title: 'Schema generation outputs',
    summary: 'The installed graphql-gene package confirms generateSchema plus printable schema outputs for executable-schema workflows.',
    packageNames: [GRAPHQL_GENE_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/getting-started.md',
    ],
    relatedTaskIds: [
      'bootstrap-sequelize-project',
      'generate-executable-schema',
      'inspect-generated-schema',
      'combine-with-graphql-codegen',
      'migrate-from-handwritten-schema',
    ],
    paritySensitive: false,
    publicApis: [
      publicApi('generateSchema', 'node_modules/graphql-gene/dist/schema.d.ts'),
      publicApi('schemaString', 'node_modules/graphql-gene/dist/schema.d.ts'),
      publicApi('schemaHtml', 'node_modules/graphql-gene/dist/schema.d.ts'),
    ],
  },
  {
    capabilityId: 'sequelize-plugin-entrypoint',
    title: 'Sequelize plugin entrypoint',
    summary: 'The documented Sequelize adoption path is confirmed by the installed pluginSequelize export.',
    packageNames: [SEQUELIZE_PLUGIN_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/getting-started.md',
      'content/graphql-gene/docs/writing-a-plugin.md',
    ],
    relatedTaskIds: [
      'choose-plugin-strategy',
      'bootstrap-sequelize-project',
    ],
    paritySensitive: false,
    publicApis: [
      publicApi('pluginSequelize', 'node_modules/@graphql-gene/plugin-sequelize/dist/index.d.ts'),
    ],
  },
  {
    capabilityId: 'typescript-type-mapping',
    title: 'TypeScript mapping utilities',
    summary: 'The public GraphQL Gene type surface confirms reusable TypeScript mapping utilities for project-facing schema modules.',
    packageNames: [GRAPHQL_GENE_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/getting-started.md',
    ],
    relatedTaskIds: [
      'create-canonical-types-module',
      'setup-typescript-augmentation',
      'combine-with-graphql-codegen',
    ],
    paritySensitive: false,
    publicApis: [
      publicApi('GeneTypesToTypescript', 'node_modules/graphql-gene/dist/types/graphqlToTypescript.d.ts'),
    ],
  },
  {
    capabilityId: 'gene-config-aliases',
    title: 'geneConfig aliases and field controls',
    summary: 'The public Gene config surface confirms alias, include, exclude, and directive-aware configuration for model exposure control.',
    packageNames: [GRAPHQL_GENE_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/schema-design.md',
    ],
    relatedTaskIds: [
      'configure-scalars-and-datatype-map',
      'control-field-exposure',
      'model-auth-scopes-with-aliases',
    ],
    paritySensitive: false,
    publicApis: [
      publicApi('defineGraphqlGeneConfig', 'node_modules/graphql-gene/dist/defineConfig.d.ts'),
      publicApi('aliases', 'node_modules/graphql-gene/dist/defineConfig.d.ts', /\baliases\?:/),
    ],
  },
  {
    capabilityId: 'extend-types',
    title: 'Schema extension helpers',
    summary: 'The installed package confirms extendTypes for Query and Mutation augmentation on top of generated schema output.',
    packageNames: [GRAPHQL_GENE_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/getting-started.md',
      'content/graphql-gene/docs/polymorphic-blocks.md',
    ],
    relatedTaskIds: [
      'add-generated-query-fields',
      'add-custom-query-or-mutation',
      'generate-executable-schema',
    ],
    paritySensitive: false,
    publicApis: [
      publicApi('extendTypes', 'node_modules/graphql-gene/dist/utils/extend.d.ts'),
    ],
  },
  {
    capabilityId: 'directive-middleware',
    title: 'Directive middleware surface',
    summary: 'The installed graphql-gene package confirms the directive middleware types and helpers described in the docs.',
    packageNames: [GRAPHQL_GENE_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/directives.md',
    ],
    relatedTaskIds: [
      'attach-directive-middleware',
      'decide-directive-sdl-visibility',
    ],
    paritySensitive: true,
    publicApis: [
      publicApi('defineDirective', 'node_modules/graphql-gene/dist/defineConfig.d.ts'),
      publicApi('GeneDirectiveConfig', 'node_modules/graphql-gene/dist/defineConfig.d.ts'),
      publicApi('defineGraphqlGeneConfig', 'node_modules/graphql-gene/dist/defineConfig.d.ts'),
    ],
  },
  {
    capabilityId: 'lookahead-helpers',
    title: 'Lookahead include helpers',
    summary: 'The installed Sequelize plugin confirms public helpers for selection-set-driven include planning.',
    packageNames: [SEQUELIZE_PLUGIN_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/schema-design.md',
    ],
    relatedTaskIds: [
      'optimize-lookahead-loading',
    ],
    paritySensitive: true,
    publicApis: [
      publicApi('getQueryInclude', 'node_modules/@graphql-gene/plugin-sequelize/dist/utils/public.d.ts'),
      publicApi('getQueryIncludeOf', 'node_modules/@graphql-gene/plugin-sequelize/dist/utils/public.d.ts'),
    ],
  },
  {
    capabilityId: 'plugin-authoring',
    title: 'Plugin authoring types',
    summary: 'The public GraphQL Gene type surface confirms typed plugin authoring, and the installed Sequelize plugin remains the reference entrypoint.',
    packageNames: [GRAPHQL_GENE_PACKAGE, SEQUELIZE_PLUGIN_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/writing-a-plugin.md',
    ],
    relatedTaskIds: [
      'choose-plugin-strategy',
      'write-custom-plugin',
    ],
    paritySensitive: true,
    publicApis: [
      publicApi('GenePlugin', 'node_modules/graphql-gene/dist/types/plugin.d.ts'),
      publicApi('pluginSequelize', 'node_modules/@graphql-gene/plugin-sequelize/dist/index.d.ts'),
    ],
  },
  {
    capabilityId: 'polymorphic-blocks',
    title: 'Polymorphic block modeling',
    summary: 'The docs describe a polymorphic content-block pattern, but agents must distinguish that pattern from a confirmed public decorator export.',
    packageNames: [SEQUELIZE_PLUGIN_PACKAGE],
    docsPaths: [
      'content/graphql-gene/docs/polymorphic-blocks.md',
      'content/graphql-gene/docs/directives.md',
    ],
    relatedTaskIds: [
      'model-polymorphic-content-blocks',
    ],
    paritySensitive: true,
    publicApis: [
      publicApi('Polymorphic', 'node_modules/@graphql-gene/plugin-sequelize/dist/index.d.ts'),
    ],
    missingStatus: 'conceptual-pattern',
    warningWhenMissing: POLYMORPHIC_EXPORT_WARNING,
  },
]

export function buildPackageParityAudit(
  options: BuildPackageParityAuditOptions,
): PackageParityAudit {
  const workspacePackage = readJson(resolve(options.workspaceRoot, 'package.json')) as PackageJsonLike | null
  const graphqlGenePackage = readJson(
    resolve(options.workspaceRoot, 'node_modules/graphql-gene/package.json'),
  ) as PackageJsonLike | null
  const sequelizePluginPackage = readJson(
    resolve(options.workspaceRoot, 'node_modules/@graphql-gene/plugin-sequelize/package.json'),
  ) as PackageJsonLike | null

  const capabilities = CAPABILITY_SPECS.map(spec => auditCapability(options.workspaceRoot, spec))
  const byStatus = createParityStatusCounts(capabilities)

  return {
    metadata: {
      auditDate: new Date().toISOString(),
      workspaceGraphqlGeneRange: workspacePackage?.dependencies?.[GRAPHQL_GENE_PACKAGE] ?? null,
      workspacePluginSequelizeRange: workspacePackage?.dependencies?.[SEQUELIZE_PLUGIN_PACKAGE] ?? null,
      installedGraphqlGeneVersion: graphqlGenePackage?.version ?? null,
      installedPluginSequelizeVersion: sequelizePluginPackage?.version ?? null,
    },
    capabilities,
    summary: {
      total: capabilities.length,
      paritySensitive: capabilities.filter(capability => capability.paritySensitive).length,
      unresolved: capabilities.filter(capability => isUnresolvedPackageCapabilityStatus(capability.status)).length,
      warningCount: capabilities.filter(capability => capability.warnings.length > 0).length,
      byStatus,
    },
  }
}

export function findPackageParityCapability(
  audit: PackageParityAudit,
  capabilityId: string,
) {
  return audit.capabilities.find(capability => capability.capabilityId === capabilityId) ?? null
}

export function isUnresolvedPackageCapabilityStatus(status: PackageCapabilityParityStatus) {
  return status === 'conceptual-pattern' || status === 'unresolved'
}

function auditCapability(
  workspaceRoot: string,
  spec: CapabilitySpec,
): AuditedPackageCapability {
  const confirmedPublicApis: string[] = []
  const missingPublicApis: string[] = []
  const evidence: PackageCapabilityEvidence[] = spec.docsPaths.map((sourcePath) => ({
    sourcePath,
    sourceType: 'canonical-doc',
    detail: `Docs currently describe the "${spec.title}" capability here.`,
  }))

  for (const api of spec.publicApis) {
    const absolutePath = resolve(workspaceRoot, api.sourcePath)
    const fileText = readText(absolutePath)
    const matcher = api.match ?? symbolMatcher(api.symbol)

    if (matcher.test(fileText)) {
      confirmedPublicApis.push(api.symbol)
      evidence.push({
        sourcePath: api.sourcePath,
        sourceType: 'package-metadata',
        detail: `Confirmed public package surface for "${api.symbol}".`,
      })
      continue
    }

    missingPublicApis.push(api.symbol)
    evidence.push({
      sourcePath: api.sourcePath,
      sourceType: 'package-metadata',
      detail: `Did not confirm a public package export or type surface for "${api.symbol}".`,
    })
  }

  const status = resolveCapabilityStatus(spec, missingPublicApis)
  const warnings = resolveCapabilityWarnings(spec, status, missingPublicApis)

  return {
    capabilityId: spec.capabilityId,
    title: spec.title,
    summary: spec.summary,
    packageNames: spec.packageNames,
    docsPaths: spec.docsPaths,
    relatedTaskIds: spec.relatedTaskIds,
    paritySensitive: spec.paritySensitive,
    status,
    confirmedPublicApis: uniqueStrings(confirmedPublicApis),
    missingPublicApis: uniqueStrings(missingPublicApis),
    warnings,
    evidence,
  }
}

function resolveCapabilityStatus(
  spec: CapabilitySpec,
  missingPublicApis: string[],
): PackageCapabilityParityStatus {
  if (missingPublicApis.length === 0) {
    return 'confirmed-public-api'
  }

  return spec.missingStatus ?? 'unresolved'
}

function resolveCapabilityWarnings(
  spec: CapabilitySpec,
  status: PackageCapabilityParityStatus,
  missingPublicApis: string[],
) {
  if (status === 'confirmed-public-api') {
    return []
  }

  if (spec.warningWhenMissing) {
    return [spec.warningWhenMissing]
  }

  if (status === 'conceptual-pattern') {
    return [
      `Treat "${spec.title}" as conceptual guidance until the installed public package surface confirms: ${missingPublicApis.join(', ')}.`,
    ]
  }

  return [
    `The installed package surface did not confirm the documented "${spec.title}" APIs: ${missingPublicApis.join(', ')}.`,
  ]
}

function publicApi(symbol: string, sourcePath: string, match?: RegExp): CapabilityPublicApiSpec {
  return {
    symbol,
    sourcePath,
    match,
  }
}

function symbolMatcher(symbol: string) {
  return new RegExp(`\\b${escapeRegExp(symbol)}\\b`)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function createParityStatusCounts(capabilities: AuditedPackageCapability[]) {
  const counts: Record<PackageCapabilityParityStatus, number> = {
    'confirmed-public-api': 0,
    'conceptual-pattern': 0,
    unresolved: 0,
  }

  for (const capability of capabilities) {
    counts[capability.status] += 1
  }

  return counts
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function readJson(filePath: string) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as unknown
  }
  catch {
    return null
  }
}

function readText(filePath: string) {
  try {
    return readFileSync(filePath, 'utf8')
  }
  catch {
    return ''
  }
}

