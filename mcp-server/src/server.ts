import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  invokeKnowledgeMcpTool,
  listKnowledgeMcpPrompts,
  listKnowledgeMcpResources,
  listKnowledgeMcpTools,
  readKnowledgeMcpResource,
  renderKnowledgeMcpPrompt,
} from '../../packages/graphql-gene-knowledge/src'
import { createKnowledgeDomainContext, createKnowledgeManifest } from './context.js'
import { formatJson } from './format.js'

export function createGraphqlGeneMcpServer() {
  const manifest = createKnowledgeManifest()
  const context = createKnowledgeDomainContext()
  const server = new McpServer({
    name: manifest.server.name,
    version: manifest.server.version,
  })

  registerResources(server, context)
  registerPrompts(server)
  registerTools(server, context)

  return server
}

export async function connectGraphqlGeneMcpServer() {
  const server = createGraphqlGeneMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  return { server, transport }
}

function registerResources(server: McpServer, context: ReturnType<typeof createKnowledgeDomainContext>) {
  for (const resource of listKnowledgeMcpResources(context)) {
    server.registerResource(
      toResourceName(resource.uri),
      resource.uri,
      {
        title: resource.name,
        description: resource.description,
      },
      async (uri) => {
        const document = readKnowledgeMcpResource(context, resource.uri)

        return {
          contents: [
            {
              uri: typeof uri === 'string' ? uri : uri.href,
              mimeType: document.mimeType,
              text: document.text,
            },
          ],
        }
      },
    )
  }
}

function registerPrompts(server: McpServer) {
  for (const prompt of listKnowledgeMcpPrompts()) {
    server.registerPrompt(
      prompt.name,
      {
        title: prompt.name,
        description: prompt.description,
        argsSchema: buildPromptArgsSchema(prompt.arguments),
      },
      (args) => {
        const rendered = renderKnowledgeMcpPrompt(prompt.name, args as Record<string, string | undefined>)

        return {
          description: rendered.description,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: rendered.text,
              },
            },
          ],
        }
      },
    )
  }
}

function registerTools(server: McpServer, context: ReturnType<typeof createKnowledgeDomainContext>) {
  for (const tool of listKnowledgeMcpTools()) {
    switch (tool.name) {
      case 'search_knowledge':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              query: z.string().min(2),
              kind: z.enum(['doc', 'example']).optional(),
              section: z.string().optional(),
              scenario: z.string().optional(),
              limit: z.number().int().min(1).max(25).optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'explain_graphql_gene_feature':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              feature: z.string().min(2),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'recommend_integration_path':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              goal: z.string().min(2),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'choose_plugin_strategy':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              orm: z.string().optional(),
              goal: z.string().optional(),
              wantsCustomPlugin: z.boolean().optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'plan_graphql_gene_integration':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              goal: z.string().min(2),
              serverStack: z.string().optional(),
              orm: z.string().optional(),
              concerns: z.array(z.string()).optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'diagnose_graphql_gene_issue':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              symptom: z.string().min(2),
              context: z.string().optional(),
              stage: z.enum(['install', 'schema', 'runtime', 'plugin', 'query', 'directive']).optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break
    }
  }
}

function buildPromptArgsSchema(argumentsList: Array<{ name: string, required: boolean }>) {
  return Object.fromEntries(
    argumentsList.map(argument => [
      argument.name,
      argument.required ? z.string().min(1) : z.string().optional(),
    ]),
  )
}

function toToolResult(payload: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: formatJson(payload),
      },
    ],
  }
}

function toResourceName(uri: string) {
  return uri
    .replace(/:\/\//g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
}
