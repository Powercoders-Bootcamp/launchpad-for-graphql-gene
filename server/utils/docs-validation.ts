import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parse } from 'yaml'
import type { DocsConfig, DocsFrontmatter, ScenarioId } from '~/types'

const REQUIRED_FIELDS: Array<keyof DocsFrontmatter> = ['title', 'description', 'section', 'order', 'slug']
const KNOWN_STATUSES = new Set<NonNullable<DocsFrontmatter['status']>>([
  'stable',
  'experimental',
  'planned',
  'deprecated',
])
const KNOWN_SCENARIOS = new Set<ScenarioId>([
  'model-to-schema',
  'query-lookahead',
  'polymorphic-blocks',
  'directive-middleware',
])

export function validateDocsFrontmatter(options: {
  docsDir: string
  docsConfig: DocsConfig
}) {
  const absoluteDocsDir = resolve(options.docsDir)

  if (!existsSync(absoluteDocsDir)) {
    return {
      warnings: [`[docs-val] Skipped because "${options.docsDir}" does not exist.`],
      errors: [] as string[],
    }
  }

  const pages = collectDocsPages(absoluteDocsDir)
  const knownSections = new Set(options.docsConfig.sections.map(section => section.id))
  const slugToFile = new Map<string, string>()
  const warnings: string[] = []
  const errors: string[] = []
  const relatedChecks: Array<{ file: string; related: string[] }> = []

  for (const page of pages) {
    const frontmatter = page.frontmatter

    for (const field of REQUIRED_FIELDS) {
      if (!frontmatter[field] && frontmatter[field] !== 0) {
        errors.push(`[${page.relativePath}] Missing required frontmatter field: "${field}"`)
      }
    }

    if (frontmatter.section && !knownSections.has(frontmatter.section)) {
      errors.push(`[${page.relativePath}] Unknown section "${frontmatter.section}".`)
    }

    if (frontmatter.status && !KNOWN_STATUSES.has(frontmatter.status)) {
      warnings.push(`[${page.relativePath}] Unknown status "${frontmatter.status}".`)
    }

    if (frontmatter.playgroundScenario && !KNOWN_SCENARIOS.has(frontmatter.playgroundScenario)) {
      warnings.push(`[${page.relativePath}] Unknown playgroundScenario "${frontmatter.playgroundScenario}".`)
    }

    if (typeof frontmatter.slug === 'string') {
      const existing = slugToFile.get(frontmatter.slug)
      if (existing && existing !== page.relativePath) {
        errors.push(`[${page.relativePath}] Duplicate slug "${frontmatter.slug}" also used by "${existing}".`)
      }
      else {
        slugToFile.set(frontmatter.slug, page.relativePath)
      }
    }

    if (!frontmatter.summary) {
      warnings.push(`[${page.relativePath}] Missing optional "summary" field.`)
    }

    if (!frontmatter.status) {
      warnings.push(`[${page.relativePath}] Missing optional "status" field (defaults to stable).`)
    }

    if (Array.isArray(frontmatter.related) && frontmatter.related.length) {
      relatedChecks.push({ file: page.relativePath, related: frontmatter.related })
    }
  }

  for (const check of relatedChecks) {
    for (const relatedSlug of check.related) {
      if (!slugToFile.has(relatedSlug)) {
        errors.push(`[${check.file}] Related slug "${relatedSlug}" does not match any docs page.`)
      }
    }
  }

  return { warnings, errors }
}

type ParsedDocsPage = {
  relativePath: string
  frontmatter: Partial<DocsFrontmatter>
}

function collectDocsPages(rootDir: string, currentDir = rootDir): ParsedDocsPage[] {
  const entries = readdirSync(currentDir, { withFileTypes: true })
  const pages: ParsedDocsPage[] = []

  for (const entry of entries) {
    const absolutePath = join(currentDir, entry.name)

    if (entry.isDirectory()) {
      pages.push(...collectDocsPages(rootDir, absolutePath))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue
    }

    const source = readFileSync(absolutePath, 'utf8')
    const relativePath = absolutePath.slice(rootDir.length + 1).replace(/\\/g, '/')

    pages.push({
      relativePath,
      frontmatter: readFrontmatter(source),
    })
  }

  return pages
}

function readFrontmatter(source: string): Partial<DocsFrontmatter> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    return {}
  }

  const parsed = parse(match[1])
  return parsed && typeof parsed === 'object'
    ? parsed as Partial<DocsFrontmatter>
    : {}
}
