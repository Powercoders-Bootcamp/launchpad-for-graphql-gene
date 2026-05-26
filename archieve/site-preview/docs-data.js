window.docsPreviewData = {
  config: {
    docsRoot: "docs_providedBy_Pierre",
    sections: [
      {
        id: "guides",
        title: "Guides",
        order: 1,
        description: "Feature-oriented explanations for the current graphql-gene documentation set."
      }
    ],
    pages: [
      {
        file: "README.md",
        title: "Documentation Overview",
        description: "Entry point for the current prose-first graphql-gene docs.",
        section: "guides",
        category: "start-here",
        order: 1,
        slug: "/docs",
        status: "stable",
        summary: "Start here to understand what the current GitHub docs cover and how they are grouped."
      },
      {
        file: "schema-design.md",
        title: "Schema Design",
        description: "Guidelines for auth scope, default resolution, performance, pagination, and schema hygiene.",
        section: "guides",
        category: "core",
        order: 2,
        slug: "/docs/guides/schema-design",
        status: "stable",
        summary: "Design GraphQL APIs that stay close to graphql-gene defaults and work well with normalized clients.",
        playgroundScenario: "lookahead"
      },
      {
        file: "directives.md",
        title: "Directives",
        description: "Understand directive middleware, SDL output, and handler-only directive behavior.",
        section: "guides",
        category: "core",
        order: 3,
        slug: "/docs/guides/directives",
        status: "stable",
        summary: "Make runtime middleware visible in the graph and control whether directives print to SDL.",
        playgroundScenario: "directive"
      },
      {
        file: "polymorphic-blocks.md",
        title: "Polymorphic Page Blocks",
        description: "Model heterogeneous block trees with one query, fragments, and a minimal shared interface.",
        section: "guides",
        category: "advanced",
        order: 4,
        slug: "/docs/guides/polymorphic-page-blocks",
        status: "stable",
        summary: "Use polymorphic associations so frontend teams can render typed block lists from a single operation.",
        playgroundScenario: "polymorphic"
      },
      {
        file: "writing-a-plugin.md",
        title: "Writing a Plugin",
        description: "Use the Sequelize plugin as the reference point for extending graphql-gene.",
        section: "guides",
        category: "extensions",
        order: 5,
        slug: "/docs/guides/writing-a-plugin",
        status: "draft",
        summary: "A thin starter guide that points plugin authors toward the current implementation example."
      }
    ]
  },
  contentBySlug: {
    "/docs": {
      sourceFile: "README.md",
      sourceHref: "https://github.com/accesimpot/graphql-gene",
      headings: ["Current scope", "Rendered taxonomy", "Current guide set", "How this preview interprets the source"],
      html: `
        <div class="docs-article__lead">
          <p>The current GitHub documentation set is small, prose-first, and strongly guide-oriented. In this preview, it is treated as a canonical content source that the website classifies through a manifest instead of Markdown frontmatter.</p>
        </div>

        <h2>Current scope</h2>
        <p>The source set currently exposes one entry page and four feature guides. It already reads like product documentation, but it needs website-side structure so readers can scan it like a proper docs surface instead of a flat repository folder.</p>

        <div class="docs-callout">
          <strong>Manifest interpretation</strong>
          <p>The preview classifies every source file into a section, category, order, and slug without modifying the Markdown files themselves.</p>
        </div>

        <h2>Rendered taxonomy</h2>
        <ul>
          <li><strong>Start here</strong> contains the current docs overview.</li>
          <li><strong>Core</strong> contains schema design and directives.</li>
          <li><strong>Advanced</strong> contains polymorphic page blocks.</li>
          <li><strong>Extensions</strong> contains plugin authoring guidance.</li>
        </ul>

        <h2>Current guide set</h2>
        <div class="docs-mini-grid">
          <article class="docs-mini-card">
            <div class="docs-mini-card__eyebrow">Core</div>
            <h3>Schema Design</h3>
            <p>Auth scope, lookahead, mutation shape, schema hygiene, and performance discipline.</p>
          </article>
          <article class="docs-mini-card">
            <div class="docs-mini-card__eyebrow">Core</div>
            <h3>Directives</h3>
            <p>Directive middleware shape, SDL visibility, and the handler-only pattern.</p>
          </article>
          <article class="docs-mini-card">
            <div class="docs-mini-card__eyebrow">Advanced</div>
            <h3>Polymorphic Blocks</h3>
            <p>Heterogeneous content trees with fragments, <code>__typename</code>, and selection-driven includes.</p>
          </article>
          <article class="docs-mini-card">
            <div class="docs-mini-card__eyebrow">Extensions</div>
            <h3>Writing a Plugin</h3>
            <p>A minimal extension entry point built around the existing Sequelize plugin.</p>
          </article>
        </div>

        <h2>How this preview interprets the source</h2>
        <p>This docs page intentionally shows what a GitHub-backed docs experience could feel like on the future public website: the prose stays in GitHub, while classification, route structure, and navigation stay in a website-owned manifest.</p>
      `
    },
    "/docs/guides/schema-design": {
      sourceFile: "schema-design.md",
      sourceHref: "https://github.com/accesimpot/graphql-gene",
      headings: ["Auth scope in the type graph", "Stay close to default resolution", "Mutation return shape", "Schema discipline"],
      html: `
        <div class="docs-article__lead">
          <p>This guide is one of the strongest current docs because it explains what "serious GraphQL generation" actually means in practice: keep schema shape, access scope, runtime loading, and client expectations aligned.</p>
        </div>

        <h2>Auth scope in the type graph</h2>
        <p>The guide recommends expressing access scope directly in GraphQL types. A public <code>User</code> and an authenticated alias such as <code>AuthenticatedUser</code> can point to the same underlying Sequelize model while exposing different field sets and directive behavior.</p>
        <pre><code>type Query {
  me: AuthenticatedUser
}

type User {
  id: ID!
  username: String
}

type AuthenticatedUser {
  id: ID!
  email: String!
  username: String
  orders: [Order!]
}</code></pre>

        <h2>Stay close to default resolution</h2>
        <p>The documentation strongly favors graphql-gene's default resolver path. The key architectural point is that nested associations should follow the selection set instead of being loaded eagerly "just in case."</p>
        <ul>
          <li>Prefer the default resolver when it already models the traversal correctly.</li>
          <li>Use <code>getQueryInclude</code> or <code>getQueryIncludeOf</code> when custom logic is unavoidable.</li>
          <li>Avoid duplicating lookahead logic in hand-written resolvers.</li>
        </ul>

        <h2>Mutation return shape</h2>
        <p>The guide also argues for returning modified objects from mutations so normalized clients can merge updates without broad refetches. That keeps cache behavior predictable and makes the generated API more usable in serious frontends.</p>

        <h2>Schema discipline</h2>
        <div class="docs-callout docs-callout--soft">
          <strong>What the guide reinforces</strong>
          <p>graphql-gene is not positioned as "generate everything blindly." It is positioned as a disciplined layer where the shape of the graph, loading behavior, and client ergonomics stay close together.</p>
        </div>
        <ul>
          <li>Expose stable IDs for persisted object types.</li>
          <li>Paginate list fields that can grow.</li>
          <li>Prefer declarative GraphQL semantics over hidden header-driven behavior.</li>
          <li>Keep fields under the object that owns the data.</li>
        </ul>
      `
    },
    "/docs/guides/directives": {
      sourceFile: "directives.md",
      sourceHref: "https://github.com/accesimpot/graphql-gene",
      headings: ["Directive shape", "Printed SDL vs handler-only directives", "Why this matters"],
      html: `
        <div class="docs-article__lead">
          <p>The directives guide explains one of graphql-gene's clearest differentiators: runtime middleware can stay visible at the graph layer instead of dissolving into resolver glue code.</p>
        </div>

        <h2>Directive shape</h2>
        <p>A directive entry contains a <code>name</code>, optional <code>args</code>, and a <code>handler</code> that runs around the underlying resolution path. This makes it suitable for auth checks, context loading, source rewriting, and other graph-scoped middleware.</p>
        <pre><code>{
  name: "userAuth",
  args: { roles: ["member"] },
  handler: ({ context, resolve }) =&gt; {
    context.viewer = loadViewer()
    return resolve()
  }
}</code></pre>

        <h2>Printed SDL vs handler-only directives</h2>
        <p>The guide makes an important distinction between named directives and directives whose name is intentionally empty.</p>
        <ul>
          <li><strong>Named directive</strong>: appears in generated SDL and runs as middleware.</li>
          <li><strong>Empty name</strong>: does not print to SDL, but the handler still runs.</li>
        </ul>

        <div class="docs-callout">
          <strong>Why the empty-name pattern matters</strong>
          <p>Some behaviors should remain runtime-only. graphql-gene can preserve the middleware benefit without forcing awkward or invalid SDL output.</p>
        </div>

        <h2>Why this matters</h2>
        <p>For the website, this guide is valuable because it shows graphql-gene is opinionated about architectural visibility. Access rules and runtime transformations are not just hidden implementation details; they can live at the graph level where teams can reason about them.</p>
      `
    },
    "/docs/guides/polymorphic-page-blocks": {
      sourceFile: "polymorphic-blocks.md",
      sourceHref: "https://github.com/accesimpot/graphql-gene",
      headings: ["The query shape", "The model pattern", "What graphql-gene contributes", "Frontend value"],
      html: `
        <div class="docs-article__lead">
          <p>This is the strongest frontend-facing guide in the current set. It shows how graphql-gene can expose one ordered block list that resolves into multiple concrete types and still feels natural for fragment-based UI rendering.</p>
        </div>

        <h2>The query shape</h2>
        <p>The guide centers around a familiar GraphQL pattern: ask for <code>__typename</code> and inline fragments so each block requests only its own fields.</p>
        <pre><code>query PagePolymorphicBlocks($path: String!) {
  pageByPath(where: { path: { eq: $path } }) {
    id
    path
    blocks {
      id
      __typename

      ... on HeroBlock {
        title
        subtitle
      }

      ... on TextBlock {
        body
      }
    }
  }
}</code></pre>

        <h2>The model pattern</h2>
        <p>The source doc uses a page model, a hub model decorated with <code>@Polymorphic</code>, and concrete block models such as <code>HeroBlock</code> and <code>TextBlock</code>. The shared interface stays minimal while each concrete block owns its real fields.</p>

        <h2>What graphql-gene contributes</h2>
        <ul>
          <li>Real Sequelize associations from the hub row to each concrete block.</li>
          <li>Selection-driven includes so only queried block branches contribute to nested loading.</li>
          <li>A generated shared GraphQL interface that stays intentionally minimal.</li>
        </ul>

        <div class="docs-callout docs-callout--soft">
          <strong>Why this deserves homepage visibility</strong>
          <p>Polymorphic blocks connect backend modeling, query ergonomics, and frontend rendering in one example. It is one of the fastest ways to explain why graphql-gene is not generic GraphQL boilerplate tooling.</p>
        </div>

        <h2>Frontend value</h2>
        <p>Because every block returns a concrete <code>__typename</code>, the client can map types directly to components without additional fetches. One query can drive a full heterogeneous component tree.</p>
      `
    },
    "/docs/guides/writing-a-plugin": {
      sourceFile: "writing-a-plugin.md",
      sourceHref: "https://github.com/accesimpot/graphql-gene/tree/main/packages/plugin-sequelize",
      headings: ["Current state", "How the preview categorizes it", "Expected next step"],
      html: `
        <div class="docs-article__lead">
          <p>The current plugin guide is intentionally thin. It effectively points readers to the source code of <code>@graphql-gene/plugin-sequelize</code> as the best reference for learning the plugin surface.</p>
        </div>

        <h2>Current state</h2>
        <p>As a GitHub document, this page works as a pointer. As a full website docs page, it is better treated as an extension placeholder until a richer guide exists.</p>

        <h2>How the preview categorizes it</h2>
        <p>In this preview it lives under <strong>Extensions</strong> rather than Core because it is useful, but not yet developed enough to anchor a full implementation workflow on its own.</p>

        <div class="docs-callout">
          <strong>Documentation quality note</strong>
          <p>This page is the clearest candidate for future expansion. A stronger version would describe extension points, plugin responsibilities, and a minimal plugin skeleton instead of only linking to source code.</p>
        </div>

        <h2>Expected next step</h2>
        <p>Once the public docs mature, this should likely evolve into a proper guide plus a narrower reference page for plugin APIs. For now, it still belongs in the website because it signals extensibility.</p>
      `
    }
  }
};
