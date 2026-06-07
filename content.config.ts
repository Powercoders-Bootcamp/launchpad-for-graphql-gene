import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const docs = defineCollection({
  type: 'page',
  source: 'graphql-gene/docs/**/*.md',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(['concepts', 'guides', 'reference', 'examples', 'tutorials']),
    order: z.number(),
    slug: z.string(),
    category: z.string().optional(),
    status: z.enum(['stable', 'experimental', 'planned', 'deprecated']).optional(),
    summary: z.string().optional(),
    related: z.array(z.string()).optional(),
    sidebarLabel: z.string().optional(),
    playgroundScenario: z.enum([
      'model-to-schema',
      'query-lookahead',
      'polymorphic-blocks',
      'directive-middleware',
    ]).optional(),
  }),
})

export default defineContentConfig({
  collections: {
    docs,
  },
})
