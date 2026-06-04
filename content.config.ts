import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'graphql-gene/docs/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        section: z.string(),
        order: z.number(),
        slug: z.string(),
        status: z.string().optional(),
        category: z.string().optional(),
        sidebarLabel: z.string().optional(),
        summary: z.string().optional(),
        related: z.array(z.string()).optional(),
        playgroundScenario: z.string().optional(),
      }),
    }),
  },
})
