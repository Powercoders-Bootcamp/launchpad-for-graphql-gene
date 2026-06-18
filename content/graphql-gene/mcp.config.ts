import type { DocsConfig } from '~/types'

export const mcpDocsConfig: DocsConfig = {
  docsRoot: 'mcp',
  sections: [
    {
      id: 'guides',
      title: 'Guides',
      order: 1,
      description: 'Setup, transport, and deployment guidance for the GraphQL Gene MCP server.',
    },
    {
      id: 'reference',
      title: 'Reference',
      order: 2,
      description: 'Operational rules, version alignment, and audit-aware MCP contract details.',
    },
  ],
}
