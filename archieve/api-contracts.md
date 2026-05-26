# API Contracts

## Design Principles

- Stable for the frontend — the frontend never depends on internal graphql-gene implementation details
- Every request identifies the scenario explicitly
- Structured input only — no arbitrary code, no open-ended payloads
- Every response includes `requestId`, `status`, structured result data, and diagnostics
- Failures always return a safe error shape with no raw stack traces

## Endpoint 1: Health Check

### `GET /api/health`

Pinged by the playground frontend on page load to pre-warm the serverless function.

Response:

```json
{ "status": "ok" }
```

## Endpoint 2: Load Examples

### `GET /api/playground/examples`

Returns the curated example catalog used by the playground UI.

Response shape:

```json
{
  "requestId": "req_123",
  "status": "ok",
  "examples": [
    {
      "id": "polymorphic-blocks-basic",
      "scenario": "polymorphic-blocks",
      "title": "Polymorphic Page Blocks",
      "description": "Query heterogeneous CMS blocks with inline fragments.",
      "editableFields": ["query", "path", "blockSelection"]
    }
  ]
}
```

## Endpoint 3: Generate Schema

### `POST /api/playground/generate`

Generates a GraphQL SDL and type summary from a structured model input.

Request shape:

```json
{
  "scenario": "model-to-schema",
  "input": {
    "exampleId": "user-orders-basic",
    "modelEdits": {
      "includeOrders": true,
      "includeAddress": true
    },
    "options": {
      "showTypeSummary": true
    }
  }
}
```

Response shape:

```json
{
  "requestId": "req_124",
  "status": "ok",
  "scenario": "model-to-schema",
  "schema": {
    "sdl": "type Query { ... }",
    "typeSummary": [
      {
        "name": "User",
        "kind": "object",
        "fields": ["id", "username", "orders"]
      }
    ]
  },
  "diagnostics": []
}
```

## Endpoint 4: Execute Query

### `POST /api/playground/query`

Executes a curated demo query against a seeded scenario. Returns result data, include graph, Sequelize SQL, and execution notes.

Request shape:

```json
{
  "scenario": "query-lookahead",
  "input": {
    "exampleId": "me-with-orders",
    "query": "query MeForAccount { me { id email orders { id status } } }",
    "variables": {}
  }
}
```

Response shape:

```json
{
  "requestId": "req_125",
  "status": "ok",
  "scenario": "query-lookahead",
  "result": {
    "data": {
      "me": {
        "id": "1",
        "email": "user@example.com",
        "orders": [
          { "id": "10", "status": "PAID" }
        ]
      }
    }
  },
  "execution": {
    "includeGraph": {
      "User": ["orders"]
    },
    "sql": "SELECT \"User\".\"id\", \"User\".\"email\", \"orders\".\"id\" AS \"orders.id\", \"orders\".\"status\" AS \"orders.status\" FROM \"Users\" AS \"User\" LEFT OUTER JOIN \"Orders\" AS \"orders\" ON \"User\".\"id\" = \"orders\".\"userId\";",
    "notes": [
      "orders was loaded because it was requested in the selection set"
    ]
  },
  "diagnostics": []
}
```

The `execution.sql` field contains the SQL string Sequelize generated for the query, formatted as a single readable string for display in a Monaco panel. It is `null` for scenarios that do not involve a database query.

## Endpoint 5: Directive Scenario

### `POST /api/playground/directives`

Runs a directive-focused demo scenario. Shows runtime behavior and schema-printing impact.

Request shape:

```json
{
  "scenario": "directive-middleware",
  "input": {
    "exampleId": "user-auth-directive",
    "directiveMode": "named"
  }
}
```

Response shape:

```json
{
  "requestId": "req_126",
  "status": "ok",
  "scenario": "directive-middleware",
  "directive": {
    "name": "userAuth",
    "printsToSchema": true,
    "runtimeBehaviorSummary": "Loads authenticated user context before field resolution."
  },
  "schema": {
    "sdlExcerpt": "type Query { me: AuthenticatedUser @userAuth }"
  },
  "diagnostics": []
}
```

## Shared Error Shape

All non-successful responses:

```json
{
  "requestId": "req_127",
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The selected example payload is not valid.",
    "details": [
      "query must be a string"
    ]
  }
}
```

Error codes:

- `VALIDATION_ERROR` — malformed request payload
- `UNKNOWN_SCENARIO` — scenario ID not in the whitelist
- `UNKNOWN_EXAMPLE` — example ID not registered for the given scenario
- `EXECUTION_TIMEOUT` — execution exceeded the time limit
- `EXECUTION_ERROR` — runtime failure with a safe diagnostic message

## Backend Validation Rules

Validate on every request:

- `scenario` is a known whitelisted value (`model-to-schema`, `query-lookahead`, `polymorphic-blocks`, `directive-middleware`)
- `exampleId` is registered for the given scenario
- `query` string does not exceed maximum length
- `variables` payload does not exceed maximum size
- editable fields are limited to the declared `editableFields` for the example

## Versioning

For MVP, unversioned endpoints are acceptable while the frontend and backend deploy together. When the API is consumed independently, introduce versioning: `/api/v1/playground/...`.
