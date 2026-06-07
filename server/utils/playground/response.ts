import { randomUUID } from 'node:crypto'
import type { ErrorCode } from '~/types'

export function okResponse<T extends object>(data: T, requestId?: string) {
  return { requestId: requestId ?? randomUUID(), status: 'ok' as const, ...data }
}

export function errorResponse(code: ErrorCode, message: string, details?: string[], requestId?: string) {
  return {
    requestId: requestId ?? randomUUID(),
    status: 'error' as const,
    error: { code, message, ...(details?.length ? { details } : {}) },
  }
}
