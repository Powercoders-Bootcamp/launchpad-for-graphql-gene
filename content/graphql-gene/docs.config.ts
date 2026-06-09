import type { DocsConfig, DocsSection } from '~/types'
import { siteDocsConfig } from '../../packages/graphql-gene-knowledge/src'

export const docsConfig: DocsConfig = {
  docsRoot: siteDocsConfig.docsRoot,
  sections: siteDocsConfig.sections.map(section => ({
    ...section,
    id: section.id as DocsSection['id'],
  })),
}
