import { randomUUID } from 'node:crypto'
import type { ErrorCode } from '~/types'

export function okResponse<T extends object>(data: T) {
  return { requestId: randomUUID(), status: 'ok' as const, ...data }
}

export function errorResponse(code: ErrorCode, message: string, details?: string[]) {
  return {
    requestId: randomUUID(),
    status: 'error' as const,
    error: { code, message, ...(details?.length ? { details } : {}) },
  }
}

export function logRequest(fields: {
  requestId: string
  scenario: string
  exampleId: string
  durationMs: number
  status: 'ok' | 'error'
  errorCode?: string
}) {
  console.log(JSON.stringify(fields))
}