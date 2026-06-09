import type { DocsConfig, DocsSection } from '~/types'
import { siteDocsConfig } from '../../packages/graphql-gene-knowledge/src/site/docs-config'

export const docsConfig: DocsConfig = {
  docsRoot: siteDocsConfig.docsRoot,
  sections: siteDocsConfig.sections.map(section => ({
    ...section,
    id: section.id as DocsSection['id'],
  })),
}
