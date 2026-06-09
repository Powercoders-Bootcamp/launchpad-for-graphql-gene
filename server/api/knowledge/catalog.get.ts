import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { docsConfig } from '~/content/graphql-gene/docs.config'
import { buildKnowledgeCatalog } from '~/packages/graphql-gene-knowledge/src'
import { getAllExamples } from '~/server/utils/playground/registry'
import { getRequestId, logPlaygroundRequest } from '~/server/utils/playground/logging'
import { okResponse } from '~/server/utils/playground/response'

export default defineEventHandler((event) => {
  const workspaceRoot = process.cwd()
  const knowledge = buildKnowledgeCatalog({
    workspaceRoot,
    docsRoot: resolve(workspaceRoot, 'content/graphql-gene/docs'),
    docsConfig,
    examples: getAllExamples(),
    sourceRepo: 'graphql-gene-site',
    sourceRef: 'workspace',
    versionRange: readGraphqlGeneVersionRange(workspaceRoot),
    exampleCatalogSourcePath: 'server/utils/playground/registry.ts',
    exampleRuntimeSourcePath: 'server/utils/playground/engine.ts',
  })

  const response = okResponse({ knowledge }, getRequestId(event))

  logPlaygroundRequest(event, {
    route: '/api/knowledge/catalog',
    status: 'ok',
  })

  return response
})

function readGraphqlGeneVersionRange(workspaceRoot: string) {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(workspaceRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
    }
    return packageJson.dependencies?.['graphql-gene']
  }
  catch {
    return undefined
  }
}
