import { describe, expect, it } from 'vitest'
import { invokeKnowledgeMcpTool } from '../packages/graphql-gene-knowledge/src'
import { mcpEvalCases, type McpEvalCase } from './fixtures/mcp-evals'
import { createTestKnowledgeContext } from './support/site-knowledge'

describe('MCP evaluation harness', () => {
  for (const evalCase of mcpEvalCases) {
    it(evalCase.id, () => {
      const result = invokeKnowledgeMcpTool(
        createTestKnowledgeContext(),
        evalCase.toolName,
        evalCase.input,
      )

      assertEvalResult(evalCase, result)
    })
  }
})

function assertEvalResult(evalCase: McpEvalCase, result: Record<string, unknown>) {
  const expected = evalCase.expected

  if (typeof expected.resultCountAtLeast === 'number') {
    expect(asNumber(result.resultCount)).toBeGreaterThanOrEqual(expected.resultCountAtLeast)
  }

  if (expected.topResultId || expected.topResultKind || expected.resultIdsInclude?.length) {
    const results = asRecordArray(result.results)

    if (expected.topResultId) {
      expect(asString(results[0]?.id)).toBe(expected.topResultId)
    }

    if (expected.topResultKind) {
      expect(asString(results[0]?.kind)).toBe(expected.topResultKind)
    }

    if (expected.resultIdsInclude?.length) {
      expect(results.map(entry => asString(entry.id))).toEqual(expect.arrayContaining(expected.resultIdsInclude))
    }
  }

  if (expected.strategy) {
    expect(asString(result.strategy)).toBe(expected.strategy)
  }

  if (expected.pluginStrategy) {
    expect(asString(asRecord(result.pluginStrategy).strategy)).toBe(expected.pluginStrategy)
  }

  if ('recommendedPlugin' in expected) {
    expect(result.recommendedPlugin ?? null).toBe(expected.recommendedPlugin ?? null)
  }

  if ('selectedRecipeId' in expected) {
    expect(result.selectedRecipeId ?? null).toBe(expected.selectedRecipeId ?? null)
  }

  if ('selectedIssueId' in expected) {
    expect(result.selectedIssueId ?? null).toBe(expected.selectedIssueId ?? null)
  }

  if (expected.recommendedQuery) {
    expect(asString(result.recommendedQuery)).toBe(expected.recommendedQuery)
  }

  if (expected.focusArea) {
    expect(asString(result.focusArea)).toBe(expected.focusArea)
  }

  if (expected.diagnosisArea) {
    expect(asString(result.diagnosisArea)).toBe(expected.diagnosisArea)
  }

  if (expected.taskId) {
    expect(asString(result.taskId)).toBe(expected.taskId)
  }

  if (expected.topTaskId || expected.rankedTaskIdsInclude?.length) {
    const rankedTasks = asRecordArray(result.rankedTasks)

    if (expected.topTaskId) {
      expect(asString(rankedTasks[0]?.taskId)).toBe(expected.topTaskId)
    }

    if (expected.rankedTaskIdsInclude?.length) {
      expect(rankedTasks.map(entry => asString(entry.taskId))).toEqual(expect.arrayContaining(expected.rankedTaskIdsInclude))
    }
  }

  if (expected.recommendedNextTool) {
    expect(asString(result.recommendedNextTool)).toBe(expected.recommendedNextTool)
  }

  if (expected.nextTool) {
    expect(asString(result.nextTool)).toBe(expected.nextTool)
  }

  if (expected.docsFirstId || expected.docsInclude?.length) {
    const docs = asRecordArray(result.docs)
    assertRelatedIds(docs, expected.docsFirstId, expected.docsInclude)
  }

  if (expected.examplesInclude?.length) {
    assertRelatedIds(asRecordArray(result.examples), undefined, expected.examplesInclude)
  }

  if (expected.pluginsInclude?.length) {
    assertRelatedIds(asRecordArray(result.plugins), undefined, expected.pluginsInclude)
  }

  if (expected.recipesInclude?.length) {
    assertRelatedIds(asRecordArray(result.recipes), undefined, expected.recipesInclude)
  }

  if (expected.troubleshootingInclude?.length) {
    assertRelatedIds(asRecordArray(result.troubleshooting), undefined, expected.troubleshootingInclude)
  }

  if (typeof expected.stepsAtLeast === 'number') {
    expect(asStringArray(result.steps).length).toBeGreaterThanOrEqual(expected.stepsAtLeast)
  }

  if (expected.summaryIncludes?.length) {
    const summary = asString(result.summary)
    for (const fragment of expected.summaryIncludes) {
      expect(summary).toContain(fragment)
    }
  }

  if (expected.recommendationIncludes?.length) {
    const recommendation = asString(result.recommendation)
    for (const fragment of expected.recommendationIncludes) {
      expect(recommendation).toContain(fragment)
    }
  }

  if (expected.rationaleIncludes?.length) {
    const rationale = asString(result.rationale)
    for (const fragment of expected.rationaleIncludes) {
      expect(rationale).toContain(fragment)
    }
  }

  if (expected.recommendedChecksInclude?.length) {
    expect(asStringArray(result.recommendedChecks)).toEqual(expect.arrayContaining(expected.recommendedChecksInclude))
  }

  if (expected.warningIncludes?.length) {
    const warnings = [
      ...asStringArray(result.warnings),
      ...asStringArray(asRecordArray(result.rankedTasks)[0]?.warnings),
    ]
    for (const fragment of expected.warningIncludes) {
      expect(warnings.some(warning => warning.includes(fragment))).toBe(true)
    }
  }
}

function assertRelatedIds(
  entries: Record<string, unknown>[],
  firstId?: string,
  includedIds: string[] = [],
) {
  if (firstId) {
    expect(asString(entries[0]?.id)).toBe(firstId)
  }

  if (includedIds.length) {
    expect(entries.map(entry => asString(entry.id))).toEqual(expect.arrayContaining(includedIds))
  }
}

function asRecordArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    : []
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : []
}

function asNumber(value: unknown) {
  return typeof value === 'number' ? value : 0
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function asRecord(value: unknown) {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : {}
}
