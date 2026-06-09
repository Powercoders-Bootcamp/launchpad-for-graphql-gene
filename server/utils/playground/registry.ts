import type { ScenarioId, Example } from '~/types'
import { getSitePlaygroundExample, getSitePlaygroundExamples } from '~/packages/graphql-gene-knowledge/src'

const CATALOG: Example[] = getSitePlaygroundExamples() as Example[]

export function getAllExamples(): Example[] {
  return CATALOG
}

export function getExample(scenario: ScenarioId, exampleId: string): Example | undefined {
  return getSitePlaygroundExample(scenario, exampleId) as Example | undefined
}
