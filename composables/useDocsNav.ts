import { docsConfig } from '~/content/graphql-gene/docs.config'
import type { DocsSection, DocsSectionId } from '~/types'

interface NavPage {
  title: string
  slug: string
  section: DocsSectionId
  category?: string
  order: number
  status?: string
  sidebarLabel?: string
  path: string
}

interface NavGroup {
  category?: string
  pages: NavPage[]
}

export interface NavSection {
  id: DocsSectionId
  title: string
  order: number
  groups: NavGroup[]
}

interface UseDocsNavOptions {
  sections?: DocsSection[]
  slugPrefix?: string
  sectionLabelKeyPrefix?: string
}

function buildGroups(pages: NavPage[]): NavGroup[] {
  const grouped = new Map<string | undefined, NavPage[]>()
  for (const page of pages) {
    const key = page.category ?? undefined
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(page)
  }
  for (const group of grouped.values()) {
    group.sort((a, b) => a.order - b.order)
  }
  return [...grouped.entries()].map(([category, pages]) => ({ category, pages }))
}

export async function useDocsNav(options: UseDocsNavOptions = {}): Promise<NavSection[]> {
  const { t, te } = useI18n()
  const sections = options.sections ?? docsConfig.sections
  const slugPrefix = options.slugPrefix ?? '/docs'
  const sectionLabelKeyPrefix = options.sectionLabelKeyPrefix ?? 'docs.sections'
  const pages = ((await queryCollection('docs').all()) as unknown as NavPage[])
    .filter(page => page.slug.startsWith(slugPrefix))

  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      ...section,
      title: te(`${sectionLabelKeyPrefix}.${section.id}.title`) ? t(`${sectionLabelKeyPrefix}.${section.id}.title`) : section.title,
      groups: buildGroups(pages.filter(p => p.section === section.id)),
    }))
}
