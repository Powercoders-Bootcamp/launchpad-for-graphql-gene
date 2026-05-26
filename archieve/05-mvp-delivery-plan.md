# MVP Delivery Plan

## Goal

Deliver a real graphql-gene playground that is production-worthy enough for the public website, while keeping scope focused on a small set of compelling scenarios.

## MVP Output

The first release should include:

- one public playground page on the website
- one public documentation experience on the website rendered from the canonical GitHub docs source
- a backend service that runs real graphql-gene demo scenarios
- curated examples for schema generation, query lookahead, and polymorphic blocks
- clear diagnostics and execution notes

## Phase 1: Product and Contract Definition

Deliverables:

- finalize scenario list
- define editable fields per scenario
- define frontend panel layout
- define how canonical GitHub docs and the repository docs manifest are ingested and mapped into website navigation
- lock API response shapes

Recommended output:

- approved examples catalog
- endpoint contract document
- UI-to-backend data flow agreement
- docs ingestion and routing rules
- docs manifest schema and validation rules

## Phase 2: Backend Foundation

Deliverables:

- API service skeleton
- request validation
- scenario registry
- execution orchestration layer
- safe error model

Success criteria:

- backend can accept structured requests
- backend can resolve a scenario and return deterministic placeholder-safe responses from real handlers

## Phase 3: graphql-gene Runtime Integration

Deliverables:

- runtime adapter for graphql-gene
- seeded demo fixtures
- schema generation path
- query execution path
- include graph extraction or equivalent execution metadata

Success criteria:

- at least one end-to-end scenario runs against the real engine
- output is stable enough for frontend integration

## Phase 4: Frontend Playground UI

Deliverables:

- Monaco-based structured input editor
- Monaco-based output viewer for SDL, query output, or execution summaries
- result tabs for SDL, result JSON, execution notes, and diagnostics
- example switcher
- loading and error states
- docs rendering layer wired to the canonical GitHub docs source
- docs navigation generated from the agreed taxonomy and manifest rules

Success criteria:

- users can pick an example, edit safe fields, run it, and inspect outputs clearly
- users can browse public docs on the website without content drift from GitHub

> **Amendment (2026-05-20):** Add to Phase 4 deliverables:
>
> - **SQL output panel**: third Monaco panel in the `query-lookahead` scenario rendering `execution.sql` from the API response. Applies also to `polymorphic-blocks` once that scenario is wired.
> - **URL hash state encoding**: encode `scenarioId`, `exampleId`, and `query` into the URL hash on every change; decode on page load to restore state. Enables link sharing with zero backend involvement.
> - **"Try in Playground" deep-link intake**: playground page reads URL parameters set by docs callout buttons and pre-loads the named scenario and example on mount.

## Phase 5: Polish and Launch Readiness

Deliverables:

- visual integration with the marketing site
- visual integration of the GitHub-sourced documentation experience
- request telemetry
- rate limiting
- copy review for technical clarity
- responsive behavior verification

Success criteria:

- experience feels coherent with the rest of the site
- execution is fast and reliable for normal public usage

> **Amendment (2026-05-20):** Add to Phase 5 deliverables:
>
> - **Pagefind search index**: run `pagefind --source .output/public` as a post-build step after `nuxt generate`. The resulting index is served statically alongside the site. Wire a search input component into the docs layout that queries the local Pagefind index. No external service, no API key, no additional cost.
> - **"Try in Playground" callout blocks**: render callout components in documentation pages. Each callout carries a `scenarioId` and optional `exampleId` and links to the playground with those parameters in the URL.

## Suggested Scenario Order

Build in this order:

1. `model-to-schema`
2. `query-lookahead`
3. `polymorphic-blocks`
4. `directive-middleware`

This order starts with the easiest proof of value and expands toward more advanced product capabilities.

## Team Workflow Recommendation

Parallel work can happen across three lanes:

- backend runtime and API
- frontend playground UI and docs rendering
- content and example authoring

The API contract should be locked early so the frontend can proceed before every runtime detail is complete.

## Risks to Watch

- scope expansion into a full online IDE
- unstable runtime outputs during content design
- security creep from allowing too much input freedom
- backend latency making the public experience feel unreliable

## Definition of Done

The MVP is done when:

- the website contains a working public playground
- the website contains a working public docs experience sourced from GitHub
- the playground uses the real graphql-gene backend path
- visitors can understand at least three high-value graphql-gene capabilities interactively
- the service is safe, stable, and maintainable enough for public traffic
