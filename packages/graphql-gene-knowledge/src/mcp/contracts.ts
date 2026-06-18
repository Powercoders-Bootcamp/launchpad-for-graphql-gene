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
  targetVersion?: string
}

export interface ProjectSummary {
  packageManager?: string
  runtime?: string
  language?: string
  serverStack?: string
  orm?: string
  currentGraphqlSetup?: string
  constraints?: string[]
  targetOutcome?: string
  graphqlGeneVersion?: string
}

export interface IssueReport {
  userGoal?: string
  symptom?: string
  context?: string
  tried?: string[]
  environment?: string
  graphqlGeneVersion?: string
}

export interface FeatureQuestion {
  feature: string
  desiredDepth?: 'brief' | 'standard' | 'deep'
  currentContext?: string
  targetVersion?: string
}

export interface ExplainGraphqlGeneFeatureInput {
  feature: string
  question?: FeatureQuestion
  targetVersion?: string
}

export interface RecommendIntegrationPathInput {
  goal: string
  project?: ProjectSummary
  targetVersion?: string
}

export interface ChoosePluginStrategyInput {
  orm?: string
  goal?: string
  wantsCustomPlugin?: boolean
  project?: ProjectSummary
  targetVersion?: string
}

export interface PlanGraphqlGeneIntegrationInput {
  goal: string
  serverStack?: string
  orm?: string
  concerns?: string[]
  project?: ProjectSummary
  targetVersion?: string
}

export type DiagnoseIssueStage =
  | 'install'
  | 'schema'
  | 'runtime'
  | 'plugin'
  | 'query'
  | 'directive'

export interface DiagnoseGraphqlGeneIssueInput {
  symptom: string
  context?: string
  stage?: DiagnoseIssueStage
  issue?: IssueReport
  project?: ProjectSummary
  targetVersion?: string
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
