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

const projectSummarySchema = z.object({
  packageManager: z.string().optional(),
  runtime: z.string().optional(),
  language: z.string().optional(),
  serverStack: z.string().optional(),
  orm: z.string().optional(),
  currentGraphqlSetup: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  targetOutcome: z.string().optional(),
  graphqlGeneVersion: z.string().optional(),
}).optional()

const issueReportSchema = z.object({
  userGoal: z.string().optional(),
  symptom: z.string().optional(),
  context: z.string().optional(),
  tried: z.array(z.string()).optional(),
  environment: z.string().optional(),
  graphqlGeneVersion: z.string().optional(),
}).optional()

const executionModeSchema = z.enum(['canonical', 'adapted', 'simulated'])

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
              kind: z.enum(['doc', 'example', 'plugin', 'recipe', 'troubleshooting']).optional(),
              section: z.string().optional(),
              scenario: z.string().optional(),
              limit: z.number().int().min(1).max(25).optional(),
              targetVersion: z.string().optional(),
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
              question: z.object({
                feature: z.string().optional(),
                desiredDepth: z.enum(['brief', 'standard', 'deep']).optional(),
                currentContext: z.string().optional(),
                targetVersion: z.string().optional(),
              }).optional(),
              targetVersion: z.string().optional(),
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
              project: projectSummarySchema,
              targetVersion: z.string().optional(),
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
              project: projectSummarySchema,
              targetVersion: z.string().optional(),
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
              project: projectSummarySchema,
              targetVersion: z.string().optional(),
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
              issue: issueReportSchema,
              project: projectSummarySchema,
              targetVersion: z.string().optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'inspect_playground_scenario':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              scenario: z.string().min(2),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'validate_playground_scenario':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              scenario: z.string().min(2),
              exampleId: z.string().optional(),
              editableFields: z.array(z.string()).optional(),
              docsSlugs: z.array(z.string()).optional(),
              outputPanels: z.array(z.string()).optional(),
              executionMode: executionModeSchema.optional(),
              declaresAdaptedRuntime: z.boolean().optional(),
              hasFixture: z.boolean().optional(),
              hasApiValidation: z.boolean().optional(),
              hasTests: z.boolean().optional(),
              usesHardcodedOutput: z.boolean().optional(),
              sourcePath: z.string().optional(),
              runtimeSourcePath: z.string().optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'plan_playground_scenario':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              scenario: z.string().min(2),
              goal: z.string().optional(),
              exampleId: z.string().optional(),
              executionMode: executionModeSchema.optional(),
              editableFields: z.array(z.string()).optional(),
              outputPanels: z.array(z.string()).optional(),
              upstreamSourcePath: z.string().optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'compare_playground_with_canonical':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              scenario: z.string().min(2),
              exampleId: z.string().optional(),
              observedExecutionMode: executionModeSchema.optional(),
              observedSourceType: z.string().optional(),
              observedBehaviorSummary: z.string().optional(),
            },
          },
          async (input) => toToolResult(invokeKnowledgeMcpTool(context, tool.name, input as Record<string, unknown>)),
        )
        break

      case 'list_playground_parity_gates':
        server.registerTool(
          tool.name,
          {
            title: tool.name,
            description: tool.description,
            inputSchema: {
              scenario: z.string().optional(),
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
    structuredContent: isStructuredContent(payload)
      ? payload
      : { value: payload },
  }
}

function toResourceName(uri: string) {
  return uri
    .replace(/:\/\//g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
}

function isStructuredContent(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
