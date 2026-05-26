# Security and Operating Boundaries

## Security Goal

The playground should behave like a real product demo without becoming a generic remote code execution surface.

That means the backend must run real graphql-gene flows while tightly constraining what the browser can influence.

## Core Principle

Allow users to explore runtime behavior, not to execute arbitrary application code.

## Required MVP Boundaries

### 1. Structured Input Only

Do not accept unrestricted TypeScript, JavaScript, or package installation requests from the browser.

Instead, accept:

- scenario identifiers
- curated editable fields
- constrained query text
- limited variables
- safe configuration toggles

### 2. Scenario Whitelisting

Every request must map to a predefined scenario family and example definition.

Allowed examples should be loaded from backend-owned configuration, not created dynamically by users.

### 3. Execution Time Limits

Each request should run with a hard timeout.

Suggested MVP limit:

- generation requests: 2 to 3 seconds
- query execution requests: 3 to 5 seconds

Timed out requests should return a safe error response with no internal stack trace.

### 4. Memory and Payload Limits

Apply caps to:

- request body size
- query text length
- variable payload size
- number of editable entities in a single request

### 5. No Persistent User Workspaces

For MVP, do not persist user-created runtime state between sessions.

Each request should run against:

- seeded demo fixtures
- short-lived execution state
- backend-controlled model templates

### 6. Safe Error Handling

Never expose:

- raw stack traces
- local file paths
- internal package layout
- unredacted runtime exceptions

Return:

- a safe message
- optional structured diagnostic hints
- a request ID for debugging

## Operational Boundaries

### Allowed Runtime Capabilities

- instantiate curated demo models
- generate schema through graphql-gene
- execute curated or constrained GraphQL operations
- inspect include behavior and diagnostics

### Disallowed Runtime Capabilities

- shell access from user input
- arbitrary network access
- arbitrary package import
- unrestricted file writes
- long-running background tasks per user request

## Rate Limiting

At minimum, limit by:

- IP address
- session identifier
- endpoint type

This protects the service from abuse and keeps execution costs predictable.

## Audit and Logging

Log:

- request ID
- selected scenario
- validation failures
- timeout events
- execution duration

Avoid logging full sensitive payloads unless there is a clear operational need.

## Future Security Expansion

If the product later supports freer-form input, add stronger isolation such as:

- per-request containerization
- process sandboxing
- outbound network denial
- filesystem jails
- stricter resource quotas

These should be considered a second-phase investment, not a prerequisite for the first MVP.
