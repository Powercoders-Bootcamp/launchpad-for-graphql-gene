import type { KnowledgeCatalog, KnowledgeKind } from '../contracts'

export interface McpResourceDescriptor {
  uri: string
  name: string
  description: string
  mimeType: 'application/json' | 'text/plain'
}

export interface McpResourceDocument {
  uri: string
  mimeType: 'application/json' | 'text/plain'
  text: string
}

export interface McpPromptArgument {
  name: string
  description: string
  required: boolean
}

export interface McpPromptDescriptor {
  name: string
  description: string
  arguments: McpPromptArgument[]
}

export interface McpRenderedPrompt {
  name: string
  description: string
  text: string
}

export interface McpToolDescriptor {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface SearchKnowledgeToolInput {
  query: string
  kind?: KnowledgeKind
  section?: string
  scenario?: string
  limit?: number
}

export interface ExplainGraphqlGeneFeatureInput {
  feature: string
}

export interface RecommendIntegrationPathInput {
  goal: string
}

export interface KnowledgeMcpManifest {
  server: {
    name: string
    version: string
  }
  resources: McpResourceDescriptor[]
  prompts: McpPromptDescriptor[]
  tools: McpToolDescriptor[]
}

export interface McpDomainContext {
  catalog: KnowledgeCatalog
  serverVersion?: string
}
