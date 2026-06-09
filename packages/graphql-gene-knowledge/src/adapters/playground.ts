import type {
  BuildKnowledgeCatalogOptions,
  ExampleKnowledgeEntry,
  PlaygroundExampleContract,
} from '../contracts'

const ADAPTED_RUNTIME_NOTE = [
  'The current website playground runtime is an adapted demo engine.',
  'Treat it as a capability showcase until upstream parity auditing is complete.',
].join(' ')

export function loadPlaygroundKnowledgeEntries(
  options: Pick<
    BuildKnowledgeCatalogOptions,
    | 'examples'
    | 'sourceRepo'
    | 'sourceRef'
    | 'versionRange'
    | 'exampleCatalogSourcePath'
    | 'exampleRuntimeSourcePath'
  >,
): ExampleKnowledgeEntry[] {
  return options.examples.map(example => createExampleEntry(example, options))
}

export function createExampleId(scenario: string, exampleId: string) {
  return `example:${scenario}:${exampleId}`
}

function createExampleEntry(
  example: PlaygroundExampleContract,
  options: Pick<
    BuildKnowledgeCatalogOptions,
    | 'sourceRepo'
    | 'sourceRef'
    | 'versionRange'
    | 'exampleCatalogSourcePath'
    | 'exampleRuntimeSourcePath'
  >,
): ExampleKnowledgeEntry {
  return {
    id: createExampleId(example.scenario, example.id),
    kind: 'example',
    title: example.title,
    summary: example.description,
    topics: [example.scenario],
    relatedIds: [],
    sourcePath: options.exampleCatalogSourcePath ?? 'server/utils/playground/registry.ts',
    sourceRepo: options.sourceRepo ?? 'graphql-gene-site',
    sourceRef: options.sourceRef ?? 'workspace',
    sourceType: 'demo-catalog',
    confidence: 'medium',
    versionRange: options.versionRange,
    exampleId: example.id,
    scenario: example.scenario,
    description: example.description,
    editableFields: example.editableFields,
    recommendedDocIds: [],
    runtimeSourcePath: options.exampleRuntimeSourcePath ?? 'server/utils/playground/engine.ts',
    executionMode: 'adapted',
    supportsDisplayedCodeParity: false,
    supportsRuntimeParity: false,
    requiresAdapter: true,
    adapterRisk: 'medium',
    notes: [ADAPTED_RUNTIME_NOTE],
  }
}
