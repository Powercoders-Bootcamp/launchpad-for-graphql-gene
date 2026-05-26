# AI Consumability Audit

## Purpose

This audit evaluates the current graphql-gene documentation from the perspective of AI consumption.

Here, "AI consumable" means documentation that is easy for language models and AI agents to:

- parse correctly
- retrieve semantically
- summarize without guesswork
- convert into implementation guidance
- use as a basis for code generation, onboarding, or product support

The focus of this audit is the current documentation set under `docs_providedBy_Pierre`.

## Overall Assessment

The documentation is technically strong and contains valuable examples. It already has many qualities that help AI systems:

- topic-specific files
- meaningful code snippets
- concrete GraphQL examples
- practical guidance rather than pure marketing language

However, it is not yet fully optimized for AI consumption.

The main gaps are:

- too much reliance on off-page references
- inconsistent feature documentation structure
- thin plugin guidance
- mixing current behavior with future roadmap notes
- encoding issues that reduce parsing quality

## Audit Findings

### 1. Key behavior depends too heavily on external references

**Severity:** High

Several important explanations rely on sources that are not fully present or not self-contained within the current docs:

- `docs_providedBy_Pierre/directives.md`
- `docs_providedBy_Pierre/schema-design.md`
- `docs_providedBy_Pierre/polymorphic-blocks.md`
- `docs_providedBy_Pierre/writing-a-plugin.md`

Examples:

- references to the main project README
- references to `PLAN_V2.md`
- references to dev-playground paths inside the repository
- plugin guidance that depends on reading source code directly

### Why this matters

AI systems often work on partial context windows or only on indexed documentation subsets. If a core concept is explained mostly through references to missing materials, the model is forced to infer behavior instead of reading it directly.

### Recommendation

Make each guide self-sufficient enough to answer the main feature questions without requiring the reader to jump elsewhere.

For each major feature page, include:

- what the feature is
- what the user defines
- what graphql-gene generates
- what happens at runtime
- what the GraphQL consumer sees

## 2. Feature docs are rich in concepts but weak in standardized contracts

**Severity:** High

The docs explain ideas well, but they do not consistently use a structured feature template.

For example:

- `directives.md` explains shape and runtime nuance
- `polymorphic-blocks.md` explains setup and behavior
- `schema-design.md` offers best practices

But they do not consistently answer the same core questions in the same order.

### Why this matters

AI systems perform better when repeated concepts follow repeated structure. That reduces ambiguity and improves extraction quality.

### Recommendation

Adopt a consistent documentation template for feature-oriented pages:

```md
## Purpose
## When to Use
## Inputs
## Generated Schema Output
## Runtime Behavior
## Example Query
## Example Response
## Common Pitfalls
## Related Features
```

This does not need to make the docs longer. It makes them easier to interpret accurately.

## 3. Plugin documentation is too thin for reliable AI-assisted implementation

**Severity:** Medium

The current plugin guide is effectively a pointer to `@graphql-gene/plugin-sequelize` source code.

File:

- `docs_providedBy_Pierre/writing-a-plugin.md`

### Why this matters

For AI systems, "read the source" is not enough unless the extension surface is already explicit. The model needs a minimal conceptual contract for plugin authoring.

### Recommendation

Expand the plugin guide to include:

- what a plugin is responsible for
- key extension points
- minimum required interfaces or functions
- lifecycle overview
- a minimal plugin skeleton
- one tiny end-to-end example

## 4. Current behavior and future roadmap notes should be separated more clearly

**Severity:** Medium

The polymorphic blocks guide includes a useful note about planned v2 behavior.

File:

- `docs_providedBy_Pierre/polymorphic-blocks.md`

### Why this matters

AI systems can accidentally collapse "current behavior" and "planned behavior" into one summary if the distinction is not strongly labeled.

### Recommendation

Whenever future behavior is mentioned, isolate it under a clearly named section such as:

- `Future`
- `Planned in v2`
- `Not implemented yet`

This reduces accidental misinterpretation.

## 5. Encoding corruption reduces readability and retrieval quality

**Severity:** Medium

Several files contain visibly corrupted characters such as:

- `â€”`
- `â€¦`
- `â†’`

Affected files include:

- `docs_providedBy_Pierre/README.md`
- `docs_providedBy_Pierre/schema-design.md`
- `docs_providedBy_Pierre/directives.md`
- `docs_providedBy_Pierre/polymorphic-blocks.md`

### Why this matters

Even when meaning remains understandable, encoding noise can reduce:

- search quality
- embedding quality
- chunk cleanliness
- summary fidelity

### Recommendation

Normalize all docs to UTF-8 and verify special punctuation rendering.

## 6. The top-level documentation entrypoint could guide retrieval better

**Severity:** Low

The docs index is clean, but it does not provide a recommended learning path.

File:

- `docs_providedBy_Pierre/README.md`

### Why this matters

Both humans and AI benefit from a small onboarding structure that explains where to start and how the concepts build on each other.

### Recommendation

Add a `Start Here` section such as:

1. Core mental model
2. Schema generation basics
3. Directives
4. Polymorphic patterns
5. Plugin extension

## Strengths

The current docs already do several things well for AI consumption:

- they are topic-oriented instead of dumping everything into one file
- they include real code and GraphQL examples
- they discuss runtime behavior, not just API signatures
- they connect backend generation to frontend consumption patterns
- they avoid excessive marketing language

This means the documentation has a strong foundation. It mainly needs structural hardening rather than a full rewrite.

## Priority Improvements

The most valuable next improvements would be:

1. Make each major guide more self-contained.
2. Add a standard feature template across docs.
3. Replace the plugin placeholder guide with a real implementation guide.
4. Separate roadmap content from current behavior.
5. Fix encoding issues.

## Recommended New Document

The single most useful addition would be a canonical mental-model page:

### Suggested title

`How graphql-gene works`

### Suggested structure

- models
- gene config
- directives
- generated GraphQL schema
- default resolvers
- selection-driven includes
- runtime execution
- frontend query shape

This page would likely become the highest-value retrieval target for both AI systems and new developers.

## Final Verdict

The current graphql-gene docs are above average in technical clarity and example quality, but they are only partially AI-optimized.

They are already useful to AI systems.

To become strongly AI consumable, they should become:

- more self-contained
- more structurally consistent
- more explicit about feature contracts
- more careful about present-vs-future distinctions
- cleaner at the encoding level
