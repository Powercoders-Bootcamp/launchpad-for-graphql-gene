import { listKnowledgeMcpPrompts } from './prompts'
import { listKnowledgeMcpResources } from './resources'
import { listKnowledgeMcpTools } from './tools'
import type { KnowledgeMcpManifest } from './contracts'

export function createKnowledgeMcpManifest(serverVersion = '0.1.0'): KnowledgeMcpManifest {
  return {
    server: {
      name: 'graphql-gene-mcp',
      version: serverVersion,
    },
    resources: listKnowledgeMcpResources(),
    prompts: listKnowledgeMcpPrompts(),
    tools: listKnowledgeMcpTools(),
  }
}
