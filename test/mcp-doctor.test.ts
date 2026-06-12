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
    expect(stdioRuntime?.data?.resourceCount).toBe(31)
    expect(stdioRuntime?.data?.maintainerToolScenario).toBe('polymorphic-blocks')
    expect(stdioRuntime?.data?.maintainerToolKnownScenario).toBe(true)
    expect(stdioRuntime?.data?.maintainerToolGateCount).toBeGreaterThanOrEqual(5)
    expect(httpRuntime?.data?.overviewCounts?.docs).toBe(8)
    expect(httpRuntime?.data?.resourceCount).toBe(31)
    expect(httpRuntime?.data?.maintainerToolScenario).toBe('polymorphic-blocks')
    expect(httpRuntime?.data?.maintainerToolKnownScenario).toBe(true)
    expect(httpRuntime?.data?.maintainerToolGateCount).toBeGreaterThanOrEqual(5)
  })
})
