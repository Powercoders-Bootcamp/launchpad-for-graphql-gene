export default {
  common: {
    locales: {
      en: 'EN',
      fr: 'FR',
    },
  },
  nav: {
    playground: 'Playground',
    docs: 'Docs',
    mcp: 'MCP',
    github: 'GitHub',
    language: 'Language',
    switchTheme: 'Switch to {mode} mode',
    light: 'light',
    dark: 'dark',
  },
  footer: {
    tagline:
      'ORM-native GraphQL generation for TypeScript teams that want schema output, query execution, and SQL behavior to stay visible in one place.',
    product: 'Product',
    scenarios: 'Scenarios',
    resources: 'Resources',
    livePlayground: 'Live Playground',
    documentation: 'Documentation',
    schemaDesign: 'Schema Design',
    modelToSchema: 'Model to schema',
    queryLookahead: 'Query lookahead',
    directiveMiddleware: 'Directive middleware',
    github: 'GitHub',
    npm: 'npm',
    license: 'MIT License',
    builtWith: 'Built with Nuxt. Playground execution uses graphql-gene, Sequelize, and SQLite.',
  },
  home: {
    seo: {
      title: 'graphql-gene - ORM-native GraphQL generation',
      description:
        'Generate production-ready GraphQL schemas from your Sequelize models. Smart query lookahead, directive middleware, and full TypeScript support.',
    },
    hero: {
      badge: 'TypeScript · Sequelize · GraphQL',
      titleLead: 'The ORM-Native',
      titleAccent: 'GraphQL Generator',
      description:
        'Stop writing resolvers by hand. graphql-gene reads your Sequelize models, generates a production-ready GraphQL schema, and keeps polymorphic page blocks queryable with typed fragments.',
      primaryCta: 'Try the Playground',
      secondaryCta: 'Read the Docs ->',
      install: 'npm install graphql-gene',
    },
    features: {
      title: "Everything you need, nothing you don't",
      subtitle: 'graphql-gene handles the schema so you can focus on product logic.',
      ormNativeTitle: 'ORM-Native',
      ormNativeDescription:
        'Define your Sequelize models once. graphql-gene generates types, queries, and mutations automatically with no hand-rolled resolvers.',
      lookaheadTitle: 'Query Lookahead',
      lookaheadDescription:
        'Your resolvers know exactly which relations the query needs. Sequelize builds optimized JOINs automatically with zero N+1 problems.',
      directivesTitle: 'Directive Middleware',
      directivesDescription:
        'Attach runtime behavior to any field with a decorator. Auth, validation, and rate-limiting become first-class schema citizens.',
      typesTitle: 'TypeScript First',
      typesDescription:
        'Full type safety from model definition to resolver. Your IDE knows your schema before the server starts.',
      polymorphicTitle: 'Polymorphic Blocks',
      polymorphicDescription:
        'Model CMS-style pages as one ordered block list. Query HeroBlock, TextBlock, and future variants in a single typed operation.',
      pluginsTitle: 'Plugin Ecosystem',
      pluginsDescription:
        'Drop in the plugin-sequelize package and get Sequelize support out of the box. More adapters are on the way.',
      playgroundTitle: 'Interactive Playground',
      playgroundDescription:
        'Try every scenario live: schema generation, query execution, SQL capture, and directive middleware right in your browser.',
    },
    showcase: {
      title: 'Polymorphic blocks, rendered cleanly',
      subtitle:
        'Query heterogeneous page content in one operation and hand frontend teams a result payload that is already shaped for rendering.',
      queryLabel: 'Single query',
      resultLabel: 'Typed result',
      cta: 'Open the polymorphic blocks demo',
    },
    getStarted: {
      title: 'Ready to ship your GraphQL API?',
      subtitle:
        'Drop graphql-gene into your existing Sequelize project and generate a production-ready schema in minutes.',
      primaryCta: 'Open Playground',
      secondaryCta: 'Read the Docs',
      install: 'npm install graphql-gene plus the plugin-sequelize package',
    },
  },
  docs: {
    seo: {
      title: 'Documentation - graphql-gene',
      description:
        'Official documentation for graphql-gene - generate executable GraphQL schemas from your ORM models.',
    },
    home: 'Documentation',
    searchLabel: 'Search docs',
    searchPlaceholder: 'Search docs',
    noResults: 'No results for "{query}".',
    onThisPage: 'On This Page',
    editOnGitHub: 'Edit on GitHub',
    notFound: 'Page not found.',
    tryInPlayground: 'Try it in the Playground',
    runExample: 'Run this example interactively.',
    openPlayground: 'Try in Playground',
    statuses: {
      experimental: 'experimental',
      planned: 'planned',
      deprecated: 'deprecated',
    },
    sections: {
      concepts: {
        title: 'Concepts',
      },
      guides: {
        title: 'Guides',
      },
      reference: {
        title: 'Reference',
      },
      examples: {
        title: 'Examples',
      },
      tutorials: {
        title: 'Tutorials',
      },
    },
    landing: {
      heroSubtitle:
        'Generate an executable GraphQL schema automatically from your ORM models. Define your types once and GraphQL and TypeScript stay in sync.',
      getStarted: 'Get Started',
      tryPlayground: 'Try Playground',
      snippetLabel: 'Quick setup',
      featureOneTitle: 'Performant',
      featureOneDescription:
        'Query lookahead avoids loading associations the client never requested. No wasted database work.',
      featureTwoTitle: 'Type-safe',
      featureTwoDescription:
        'Resolver arguments and return types are deeply inferred from your models. One source of truth.',
      featureThreeTitle: 'Extensible',
      featureThreeDescription:
        'The plugin system supports any Node.js ORM. Add directives, aliases, and custom resolvers with ease.',
      conceptsTitle: 'Concepts',
      conceptsDescription: 'Mental models, architecture, and how graphql-gene works under the hood.',
      guidesTitle: 'Guides',
      guidesDescription:
        'Schema design, directives, and polymorphic blocks through focused how-to pages.',
      referenceTitle: 'Reference',
      referenceDescription: 'Plugin API, configuration options, and exact lookup-style documentation.',
    },
  },
  mcp: {
    seo: {
      title: 'MCP Server - graphql-gene',
      description:
        'Operational setup, deployment, and version contract documentation for the GraphQL Gene MCP server.',
    },
    home: 'MCP Server',
    searchLabel: 'Search MCP docs',
    searchPlaceholder: 'Search MCP docs',
    noResults: 'No results for "{query}".',
    notFound: 'Page not found.',
    sections: {
      guides: {
        title: 'Guides',
      },
      reference: {
        title: 'Reference',
      },
    },
    landing: {
      eyebrow: 'Developer MCP Server',
      title: 'Source-backed GraphQL Gene guidance for coding agents',
      description:
        'Use the GraphQL Gene MCP server when you want Claude Desktop, Cursor, or another MCP client to work from canonical docs, audited package parity, and developer-task planning tools.',
      primaryCta: 'Open setup guide',
      secondaryCta: 'Read library docs',
      highlightsTitle: 'What this surface covers',
      highlightsDescription:
        'Keep MCP operations separate from product docs while preserving one canonical knowledge graph underneath.',
      highlightOneTitle: 'Client setup',
      highlightOneDescription:
        'Register stdio or Streamable HTTP transports, print ready-made client presets, and validate the installation.',
      highlightTwoTitle: 'Deployment',
      highlightTwoDescription:
        'Ship the HTTP server as an internal service with auth, rate limits, health checks, and provenance-aware verification.',
      highlightThreeTitle: 'Version contract',
      highlightThreeDescription:
        'Understand how repo commit, GraphQL Gene package range, and MCP wrapper version stay aligned.',
      cardsTitle: 'Start with one of these paths',
      cardsDescription: 'Choose the operational slice you need without mixing it into the core library documentation.',
      setupTitle: 'Setup',
      setupDescription: 'Build the MCP server, print client presets, and verify stdio or HTTP registration locally.',
      deploymentTitle: 'Deployment',
      deploymentDescription: 'Run the MCP server as a long-lived HTTP service with the recommended hardening defaults.',
      versionTitle: 'Version contract',
      versionDescription: 'See how provenance, parity audits, and repo-aligned builds define the support boundary.',
    },
  },
  playground: {
    seo: {
      title: 'Playground - graphql-gene',
      description:
        'Inspect SDL, SQL, result payloads, and directive behavior with the graphql-gene playground.',
    },
    eyebrow: 'Interactive Playground',
    defaultLead: 'Run a scenario and inspect the generated output.',
    resetQuery: 'Reset query',
    refreshNow: 'Refresh now',
    refreshing: 'Refreshing...',
    copy: 'Copy',
    copied: 'Copied',
    scenariosAria: 'Scenarios',
    exampleAria: 'Example',
    directiveModeAria: 'Directive mode',
    executionNotes: 'Execution Notes',
    executionFallback: 'Edit the query to inspect runtime notes.',
    scenarioTitles: {
      'model-to-schema': 'Model to schema',
      'query-lookahead': 'Query lookahead',
      'polymorphic-blocks': 'Polymorphic blocks',
      'directive-middleware': 'Directive middleware',
    },
    scenarioOverview: {
      'model-to-schema': {
        title: 'Toggle the model shape and inspect the generated schema instantly.',
        description:
          'This scenario edits the example model definition, regenerates the SDL, and lets you compare the structural type map side by side.',
      },
      'query-lookahead': {
        title: 'Edit a real query and watch the data path, include planning, and SQL stay in sync.',
        description:
          'This scenario runs the query against the example runtime and shows how graphql-gene shapes the GraphQL response, association graph, and final Sequelize statements.',
      },
      'polymorphic-blocks': {
        title: 'Inspect a polymorphic page query from typed blocks down to include planning.',
        description:
          'This scenario shows how a query with unions and block variants resolves into a result payload, SQL statements, and an include plan you can read at a glance.',
      },
      'directive-middleware': {
        title: 'Compare how directive middleware appears in the printed schema.',
        description:
          'This scenario flips between named and anonymous middleware modes so you can inspect the SDL excerpt that graphql-gene emits for each runtime contract.',
      },
    },
    examples: {
      'user-orders-basic': {
        title: 'User with Orders',
        description: 'Generate a schema from User and Order models with a hasMany association.',
      },
      'me-with-orders': {
        title: 'Me with Orders',
        description: 'Query the current user including their orders. Observe the JOIN in the SQL panel.',
      },
      'page-blocks-basic': {
        title: 'Polymorphic Page Blocks',
        description: 'Query heterogeneous CMS blocks with inline fragments.',
      },
      'user-auth-directive': {
        title: 'Auth Directive',
        description: 'Attach the userAuth directive to a field and inspect schema and runtime behavior.',
      },
    },
    panels: {
      query: 'Query',
      options: 'Options',
      editableRequestInput: 'Editable request input',
      scenarioConfiguration: 'Scenario configuration',
      sdl: 'SDL',
      generatedSchema: 'Generated schema',
      result: 'Result',
      responsePayload: 'GraphQL response payload',
      directiveSdl: 'Directive SDL',
      schemaExcerpt: 'Schema excerpt',
      typeSummary: 'Type Summary',
      generatedTypeMap: 'Generated type map',
      sql: 'SQL',
      capturedSql: 'Captured Sequelize statements',
      includeGraph: 'Include Graph',
      associationPlan: 'Requested association plan',
      diagnostics: 'Diagnostics',
    },
    placeholder: 'Enter your GraphQL query here...',
    toggles: {
      includeOrdersTitle: 'Include orders',
      includeOrdersDescription: 'Add the `orders` association to the generated schema.',
      includeAddressTitle: 'Include address',
      includeAddressDescription: 'Expose the `address` field in the generated type.',
      showTypeSummaryTitle: 'Return type summary',
      showTypeSummaryDescription: 'Keep the structural type map visible alongside the SDL.',
    },
    directiveModes: {
      named: 'Named directive',
      anonymous: 'Anonymous runtime middleware',
    },
    directiveHelp:
      'Compare schema output when middleware is represented as a named directive versus an anonymous runtime behavior.',
    errors: {
      loadExamples: 'Failed to load examples.',
      generate: 'Schema generation failed. Please try again.',
      query: 'Query execution failed. Please try again.',
      directives: 'Directive scenario failed. Please try again.',
    },
  },
}
