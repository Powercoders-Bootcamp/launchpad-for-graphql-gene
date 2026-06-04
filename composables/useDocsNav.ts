import { docsConfig } from '~/content/graphql-gene/docs.config'
import type { DocsSectionId } from '~/types'

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

export async function useDocsNav(): Promise<NavSection[]> {
  const pages = (await queryCollection('docs').all()) as unknown as NavPage[]

  return [...docsConfig.sections]
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      ...section,
      groups: buildGroups(pages.filter(p => p.section === section.id)),
    }))
}
