# Contributing

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
git clone git@github.com:Powercoders-Bootcamp/launchpad-for-graphql-gene.git
cd launchpad-for-graphql-gene
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Branch Workflow

```bash
# Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# After your changes
git add <files>
git commit -m "feat: describe what and why"
git push origin feature/your-feature-name
```

Then open a pull request on GitHub. One approval is required to merge into `main`. Direct pushes to `main` are not allowed.

## Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

| Prefix | When to use |
|---|---|
| `feat:` | New feature or page |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure, no behavior change |
| `chore:` | Dependency updates, config changes |

Keep the subject line under 72 characters. Add a body if the reason is not obvious.

## Implementation Specs

Before working on backend routes, composables, or docs pipeline, read the relevant spec:

| Topic | File |
|---|---|
| Types and Zod schemas | `docs/01-types.md` |
| Nitro server routes | `docs/02-backend.md` |
| Playground UI and composables | `docs/03-frontend.md` |
| Docs pipeline (`@nuxt/content`) | `docs/04-docs-pipeline.md` |
| Delivery phases and acceptance criteria | `docs/05-phases.md` |

## Questions

Prefer Slack. Contact Pierre-Michel (pierre-michel@elio-tax.com) or Sonu (sonu@elio-tax.com) for library-specific questions.
