import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { parse } from 'yaml'
import type {
  BuildKnowledgeCatalogOptions,
  DocKnowledgeEntry,
  DocsFrontmatterContract,
} from '../contracts'

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export interface DocKnowledgeDraft extends DocKnowledgeEntry {
  relatedSlugs: string[]
}

export function loadDocKnowledgeEntries(
  options: Pick<
    BuildKnowledgeCatalogOptions,
    'workspaceRoot' | 'docsRoot' | 'sourceRepo' | 'sourceRef' | 'versionRange'
  >,
): DocKnowledgeDraft[] {
  const absoluteDocsRoot = resolve(options.docsRoot)
  if (!existsSync(absoluteDocsRoot)) {
    return []
  }

  return collectMarkdownFiles(absoluteDocsRoot).map((file) => {
    const frontmatter = readFrontmatter(file.source)
    const body = stripFrontmatter(file.source)
    const slug = frontmatter.slug ?? `/${file.relativePath.replace(/\.md$/i, '')}`

    return {
      id: createDocId(slug),
      kind: 'doc',
      title: frontmatter.title ?? humanizeFilename(file.relativePath),
      summary: frontmatter.summary ?? frontmatter.description ?? '',
      topics: compact([
        frontmatter.section,
        frontmatter.category,
        frontmatter.playgroundScenario,
      ]),
      relatedIds: [],
      relatedSlugs: frontmatter.related ?? [],
      sourcePath: relative(options.workspaceRoot, file.absolutePath).replace(/\\/g, '/'),
      sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
      sourceRef: options.sourceRef ?? 'workspace',
      sourceType: 'canonical-doc',
      confidence: 'high',
      versionRange: options.versionRange,
      stability: frontmatter.status ?? 'stable',
      slug,
      description: frontmatter.description ?? '',
      section: frontmatter.section ?? 'reference',
      order: frontmatter.order ?? 999,
      category: frontmatter.category,
      status: frontmatter.status ?? 'stable',
      sidebarLabel: frontmatter.sidebarLabel,
      playgroundScenario: frontmatter.playgroundScenario,
      body,
    }
  })
}

export function createDocId(slug: string) {
  return `doc:${slug}`
}

function collectMarkdownFiles(rootDir: string, currentDir = rootDir): Array<{
  absolutePath: string
  relativePath: string
  source: string
}> {
  const entries = readdirSync(currentDir, { withFileTypes: true })
  const files: Array<{ absolutePath: string, relativePath: string, source: string }> = []

  for (const entry of entries) {
    const absolutePath = join(currentDir, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(rootDir, absolutePath))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue
    }

    files.push({
      absolutePath,
      relativePath: relative(rootDir, absolutePath).replace(/\\/g, '/'),
      source: readFileSync(absolutePath, 'utf8'),
    })
  }

  return files
}

function readFrontmatter(source: string): Partial<DocsFrontmatterContract> {
  const match = source.match(FRONTMATTER_PATTERN)
  if (!match) {
    return {}
  }

  const parsed = parse(match[1])
  return parsed && typeof parsed === 'object'
    ? parsed as Partial<DocsFrontmatterContract>
    : {}
}

function stripFrontmatter(source: string) {
  return source.replace(FRONTMATTER_PATTERN, '').trim()
}

function humanizeFilename(relativePath: string) {
  return relativePath
    .replace(/\.md$/i, '')
    .split('/')
    .at(-1)
    ?.split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') ?? 'Untitled'
}

function compact(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value))
}
