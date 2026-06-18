import { describe, expect, it } from 'vitest'
import { createGraphqlGeneMcpServer } from '../mcp-server/src/server'
import { createKnowledgeDomainContext, createKnowledgeManifest } from '../mcp-server/src/context'

describe('mcp-server wrapper', () => {
  it('creates a domain context from the shared knowledge catalog', () => {
    const context = createKnowledgeDomainContext()

    expect(context.catalog.counts.docs).toBe(8)
    expect(context.catalog.counts.examples).toBe(4)
    expect(context.catalog.counts.plugins).toBe(2)
    expect(context.catalog.counts.recipes).toBe(5)
    expect(context.catalog.counts.troubleshooting).toBe(5)
    expect(context.catalog.audit?.coverage.docs).toBe(8)
    expect(context.serverVersion).toBeTypeOf('string')
  })

  it('creates the MCP manifest for the transport wrapper', () => {
    const manifest = createKnowledgeManifest()

    expect(manifest.server.name).toBe('graphql-gene-mcp')
    expect(manifest.resources.length).toBeGreaterThanOrEqual(7)
    expect(manifest.prompts.length).toBeGreaterThanOrEqual(2)
    expect(manifest.tools.length).toBeGreaterThanOrEqual(3)
  })

  it('instantiates the MCP server without throwing', () => {
    const server = createGraphqlGeneMcpServer()

    expect(server).toBeDefined()
  })
})
