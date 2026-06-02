import type { DocsConfig } from '~/types'

export const docsConfig: DocsConfig = {
  docsRoot: 'docs',
  sections: [
    { id: 'concepts',  title: 'Concepts',   order: 1, description: 'Mental models and architecture explanations.' },
    { id: 'guides',    title: 'Guides',      order: 2, description: 'Focused feature and how-to pages.' },
    { id: 'reference', title: 'Reference',   order: 3, description: 'Exact lookup-style API and configuration.' },
    { id: 'examples',  title: 'Examples',    order: 4, description: 'Runnable or inspectable scenarios.' },
    { id: 'tutorials', title: 'Tutorials',   order: 5, description: 'Step-by-step onboarding flows.' },
  ],
}
