export interface ScenarioFixture {
  users?: Array<{ id: number; email: string; name: string; address?: string | null }>
  orders?: Array<{ id: number; userId: number; status: string; total: number }>
  pages?: Array<{ id: number; slug: string }>
  blocks?: Array<{
    id: number
    pageId: number
    type: 'HeroBlock' | 'TextBlock'
    headline?: string | null
    body?: string | null
  }>
}

export function getFixture(scenario: string, exampleId: string): ScenarioFixture {
  if (scenario === 'query-lookahead' && exampleId === 'me-with-orders') {
    return {
      users: [{ id: 1, email: 'user@example.com', name: 'Alex', address: 'GraphQL Street 42' }],
      orders: [
        { id: 10, userId: 1, status: 'PAID', total: 99 },
        { id: 11, userId: 1, status: 'PENDING', total: 49 },
      ],
    }
  }
  if (scenario === 'polymorphic-blocks' && exampleId === 'page-blocks-basic') {
    return {
      pages: [{ id: 1, slug: '/home' }],
      blocks: [
        { id: 1, pageId: 1, type: 'HeroBlock', headline: 'Welcome to graphql-gene' },
        { id: 2, pageId: 1, type: 'TextBlock', body: 'Hello world from a polymorphic block.' },
      ],
    }
  }
  if (scenario === 'directive-middleware' && exampleId === 'user-auth-directive') {
    return {
      users: [{ id: 1, email: 'user@example.com', name: 'Alex', address: 'Directive Avenue 7' }],
    }
  }
  return {}
}
