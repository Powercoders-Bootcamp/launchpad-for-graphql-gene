import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(__dirname, '..')
const scriptPath = path.join(workspaceRoot, 'mcp-server', 'scripts', 'print-config.mjs')

describe('mcp config printer', () => {
  it('prints machine-readable config payloads', () => {
    const result = spawnSync(process.execPath, [scriptPath, '--json'], {
      cwd: workspaceRoot,
      encoding: 'utf8',
    })

    expect(result.status).toBe(0)

    const payload = JSON.parse(result.stdout)
    expect(payload.workspaceRoot).toBe(workspaceRoot)
    expect(payload.serverId).toBe('graphql-gene')
    expect(payload.stdio.windows.command).toBe('cmd')
    expect(payload.http.url).toContain('/mcp')
    expect(payload.genericRegistration.stdio.transport).toBe('stdio')
    expect(payload.genericRegistration.http.transport).toBe('streamable-http')
    expect(payload.clientPresets.claudeDesktop.mcpServers['graphql-gene']).toBeDefined()
    expect(payload.clientPresets.cursor.mcpServers['graphql-gene']).toBeDefined()
  })
})
