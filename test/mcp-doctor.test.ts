import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')
const doctorScriptPath = path.join(workspaceRoot, 'mcp-server', 'scripts', 'doctor.mjs')
const mcpServerDistEntrypoint = path.join(workspaceRoot, 'mcp-server', 'dist', 'mcp-server', 'src', 'index.js')

describe('mcp doctor', () => {
  it('reports healthy stdio and http transports in json mode', () => {
    if (!existsSync(mcpServerDistEntrypoint)) {
      const buildCommand = process.platform === 'win32'
        ? ['cmd', ['/c', 'npm', '--prefix', 'mcp-server', 'run', 'build']]
        : ['npm', ['--prefix', 'mcp-server', 'run', 'build']]
      const buildResult = spawnSync(buildCommand[0], buildCommand[1], {
        cwd: workspaceRoot,
        encoding: 'utf8',
        timeout: 180000,
      })

      expect(buildResult.status).toBe(0)
    }

    const result = spawnSync(process.execPath, [doctorScriptPath, '--json'], {
      cwd: workspaceRoot,
      encoding: 'utf8',
      timeout: 120000,
    })

    expect(result.status).toBe(0)

    const payload = JSON.parse(result.stdout)
    expect(payload.ok).toBe(true)
    expect(payload.checks.some((check: { id: string, status: string }) => (
      check.id === 'stdio-runtime' && check.status === 'pass'
    ))).toBe(true)
    expect(payload.checks.some((check: { id: string, status: string }) => (
      check.id === 'http-runtime' && check.status === 'pass'
    ))).toBe(true)

    const stdioRuntime = payload.checks.find((check: { id: string }) => check.id === 'stdio-runtime')
    const httpRuntime = payload.checks.find((check: { id: string }) => check.id === 'http-runtime')

    expect(stdioRuntime?.data?.overviewCounts?.docs).toBe(8)
    expect(stdioRuntime?.data?.resourceCount).toBeGreaterThanOrEqual(50)
    expect(stdioRuntime?.data?.developerTaskCount).toBeGreaterThanOrEqual(20)
    expect(stdioRuntime?.data?.developerTaskVersionMetadata?.workspaceGraphqlGeneRange).toBeTruthy()
    expect(stdioRuntime?.data?.auditStatus).toBe('full')
    expect(stdioRuntime?.data?.auditConflictCount).toBeGreaterThan(0)
    expect(stdioRuntime?.data?.packageParityUnresolvedCount).toBeGreaterThan(0)
    expect(stdioRuntime?.data?.packageParityPolymorphicStatus).toBe('conceptual-pattern')
    expect(stdioRuntime?.data?.developerTaskClassificationTopTask).toBe('migrate-from-handwritten-schema')
    expect(stdioRuntime?.data?.developerToolPattern).toBe('polymorphic-blocks')
    expect(stdioRuntime?.data?.developerToolStrategy).toBe('plugin-sequelize')
    expect(stdioRuntime?.data?.developerIssueTask).toBe('debug-schema-generation')
    expect(stdioRuntime?.data?.maintainerToolScenario).toBe('polymorphic-blocks')
    expect(stdioRuntime?.data?.maintainerToolKnownScenario).toBe(true)
    expect(stdioRuntime?.data?.maintainerToolGateCount).toBeGreaterThanOrEqual(5)
    expect(httpRuntime?.data?.overviewCounts?.docs).toBe(8)
    expect(httpRuntime?.data?.resourceCount).toBeGreaterThanOrEqual(50)
    expect(httpRuntime?.data?.developerTaskCount).toBeGreaterThanOrEqual(20)
    expect(httpRuntime?.data?.developerTaskVersionMetadata?.workspaceGraphqlGeneRange).toBeTruthy()
    expect(httpRuntime?.data?.auditStatus).toBe('full')
    expect(httpRuntime?.data?.auditConflictCount).toBeGreaterThan(0)
    expect(httpRuntime?.data?.packageParityUnresolvedCount).toBeGreaterThan(0)
    expect(httpRuntime?.data?.packageParityPolymorphicStatus).toBe('conceptual-pattern')
    expect(httpRuntime?.data?.developerTaskClassificationTopTask).toBe('migrate-from-handwritten-schema')
    expect(httpRuntime?.data?.developerToolPattern).toBe('polymorphic-blocks')
    expect(httpRuntime?.data?.developerToolStrategy).toBe('plugin-sequelize')
    expect(httpRuntime?.data?.developerIssueTask).toBe('debug-schema-generation')
    expect(httpRuntime?.data?.maintainerToolScenario).toBe('polymorphic-blocks')
    expect(httpRuntime?.data?.maintainerToolKnownScenario).toBe(true)
    expect(httpRuntime?.data?.maintainerToolGateCount).toBeGreaterThanOrEqual(5)
  })
})
