import type { PlaygroundExampleContract } from '../contracts'

const SITE_PLAYGROUND_EXAMPLES: PlaygroundExampleContract[] = [
  {
    id: 'user-orders-basic',
    scenario: 'model-to-schema',
    title: 'User with Orders',
    description: 'Generate a schema from User and Order models with a hasMany association.',
    editableFields: ['includeOrders', 'includeAddress', 'showTypeSummary'],
  },
  {
    id: 'me-with-orders',
    scenario: 'query-lookahead',
    title: 'Me with Orders',
    description: 'Query the current user including their orders. Observe the JOIN in the SQL panel.',
    editableFields: ['query'],
  },
  {
    id: 'page-blocks-basic',
    scenario: 'polymorphic-blocks',
    title: 'Polymorphic Page Blocks',
    description: 'Query heterogeneous CMS blocks with inline fragments.',
    editableFields: ['query'],
  },
  {
    id: 'user-auth-directive',
    scenario: 'directive-middleware',
    title: 'Auth Directive',
    description: 'Attach @userAuth to a field and inspect schema and runtime behavior.',
    editableFields: ['directiveMode'],
  },
]

export function getSitePlaygroundExamples(): PlaygroundExampleContract[] {
  return SITE_PLAYGROUND_EXAMPLES
}

export function getSitePlaygroundExample(scenario: string, exampleId: string) {
  return SITE_PLAYGROUND_EXAMPLES.find(example => example.scenario === scenario && example.id === exampleId)
}
