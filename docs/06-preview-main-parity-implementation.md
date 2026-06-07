# Preview to Main Parity Implementation Plan

## Goal

Port the high-value `preview` branch improvements into `main` without merging the branch directly.
This work is intentionally selective because `preview` is behind `main` and contains both useful
improvements and regressions.

## Explicit Exclusions

The implementation must **not** include the following:

1. The three preview-only internal planning documents:
   - `docs/06-four-person-implementation-plan.md`
   - `docs/07-ai-execution-backlog.md`
   - `docs/08-ai-scenario-bot-idea.md`
2. Any visual or shell redesign outside the playground surface:
   - no global shell changes in `app.vue`
   - no homepage redesign
   - no docs shell, docs landing, or docs sidebar redesign

## Approved Scope

### 1. Build and Runtime Stability

- Add the Windows-safe Nitro build configuration from `preview` so `nuxt build` does not fail with
  `EPERM readlink` on Windows.
- Keep the existing `main` scripts and Pagefind flow intact unless a small compatibility adjustment
  is required.

### 2. Playground API Hardening

- Preserve the existing safe JSON response envelope.
- Add correct HTTP status codes for validation, not found, timeout, oversized request, rate limit,
  and internal execution failures.
- Centralize request logging and request ID handling.
- Keep the current route contract stable for the frontend.

### 3. Playground State and UX Parity

- Add missing playground state for:
  - generate options: `includeOrders`, `includeAddress`, `showTypeSummary`
  - directive mode: `named` / `anonymous`
  - scenario-specific default queries
- Improve error handling so API error messages surface cleanly to the user.
- Preserve hash-based sharing and query-param deep-link support.

### 4. Playground UI Only

- Upgrade only `pages/playground.vue`.
- Keep the current stable textarea / pre-based rendering strategy instead of reintroducing Monaco
  for read-only output panels.
- Add:
  - scenario header and example context
  - generate option controls
  - directive mode selector
  - type summary panel
  - include graph panel
  - execution notes panel
  - reset query action
  - clearer loading and error states

### 5. Docs Validation Improvements

- Strengthen typed content schema in `content.config.ts`.
- Move docs frontmatter validation into a dedicated helper.
- Validate:
  - required fields
  - known sections
  - known statuses
  - known playground scenarios
  - duplicate slugs
  - related page references
- Do not change docs visuals.

### 6. Test Coverage

- Keep current tests passing.
- Add an API-focused integration path that verifies:
  - health
  - examples
  - generate
  - query
  - directives
  - unknown example
  - oversized request
  - HTTP status codes

## Delivery Sequence

### Phase A

- Build stability
- request context / logging
- API status code hardening

### Phase B

- Playground state parity
- Playground UI parity

### Phase C

- Docs validation extraction
- API test coverage improvements

## Acceptance Criteria

- `npm run build` succeeds on this Windows workspace.
- Playground API endpoints return stable envelopes plus correct HTTP status codes.
- Playground exposes the missing generate and directive controls.
- Playground can display SDL, type summary, result JSON, SQL, include graph, and execution notes.
- Docs build-time validation is stricter without changing docs UI.
- Verification covers both build and API behavior.
