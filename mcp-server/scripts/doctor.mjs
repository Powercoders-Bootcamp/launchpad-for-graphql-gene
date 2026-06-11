import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildMcpAdoptionConfig } from './lib/adoption-config.mjs'

const sdkRoot = resolve(import.meta.dirname, '..', '..', 'node_modules', '@modelcontextprotocol', 'sdk', 'dist', 'esm')
const { Client } = await import(pathToFileURL(resolve(sdkRoot, 'client/index.js')).href)
const { StdioClientTransport } = await import(pathToFileURL(resolve(sdkRoot, 'client/stdio.js')).href)
const { StreamableHTTPClientTransport } = await import(
  pathToFileURL(resolve(sdkRoot, 'client/streamableHttp.js')).href,
)
const scriptPath = fileURLToPath(import.meta.url)

const args = process.argv.slice(2)
const jsonMode = args.includes('--json')
const transportMode = readOption(args, '--transport') ?? 'all'

main().catch((error) => {
  const fallback = {
    ok: false,
    summary: { passed: 0, warned: 0, failed: 1 },
    checks: [
      {
        id: 'doctor-crash',
        status: 'fail',
        title: 'Doctor process crashed',
        detail: error instanceof Error ? error.message : String(error),
      },
    ],
  }

  writeReport(fallback, jsonMode)
  process.exit(1)
})

async function main() {
  if (!['all', 'stdio', 'http'].includes(transportMode)) {
    throw new Error(`Unsupported transport mode "${transportMode}". Expected all, stdio, or http.`)
  }

  const report = await runDoctor({ transportMode })
  writeReport(report, jsonMode)
  process.exit(report.ok ? 0 : 1)
}

async function runDoctor(options) {
  const payload = buildMcpAdoptionConfig()
  const checks = []

  const packageInfo = readPackageMetadata(payload.workspaceRoot, payload.mcpServerRoot)
  checks.push({
    id: 'workspace-version',
    status: packageInfo.graphqlGeneVersion ? 'pass' : 'warn',
    title: 'GraphQL Gene dependency metadata',
    detail: packageInfo.graphqlGeneVersion
      ? `Detected graphql-gene version range ${packageInfo.graphqlGeneVersion}.`
      : 'Could not detect a graphql-gene dependency version from the workspace package.json.',
    remediation: packageInfo.graphqlGeneVersion
      ? undefined
      : 'Add graphql-gene to the workspace package.json if this repository is expected to run the library locally.',
  })

  const buildArtifacts = [
    resolve(payload.mcpServerRoot, 'dist/mcp-server/src/index.js'),
    resolve(payload.mcpServerRoot, 'dist/mcp-server/src/http-entry.js'),
  ]
  const missingArtifacts = buildArtifacts.filter(filePath => !existsSync(filePath))

  checks.push({
    id: 'build-artifacts',
    status: missingArtifacts.length === 0 ? 'pass' : 'fail',
    title: 'Production build artifacts',
    detail: missingArtifacts.length === 0
      ? 'Found compiled stdio and HTTP entrypoints under mcp-server/dist.'
      : `Missing build artifacts: ${missingArtifacts.join(', ')}`,
    remediation: missingArtifacts.length === 0
      ? undefined
      : 'Run npm run mcp:build before registering the production MCP server in a client.',
  })

  const presetNames = Object.keys(payload.clientPresets)
  checks.push({
    id: 'client-presets',
    status: presetNames.length >= 4 ? 'pass' : 'warn',
    title: 'Client preset payloads',
    detail: `Generated presets: ${presetNames.join(', ')}.`,
    remediation: presetNames.length >= 4
      ? undefined
      : 'Regenerate the adoption config and confirm the expected client preset wrappers are present.',
  })

  if (options.transportMode === 'all' || options.transportMode === 'stdio') {
    if (missingArtifacts.length > 0) {
      checks.push(skipTransportCheck('stdio-runtime', 'Stdio runtime handshake'))
    }
    else if (options.transportMode === 'all') {
      checks.push(await runDoctorSubprocess('stdio'))
    }
    else {
      checks.push(await runChecked('stdio-runtime', 'Stdio runtime handshake', async () => {
        const result = await verifyStdioTransport(payload)
        return {
          detail: `Connected over stdio and verified ${result.toolCount} tools, ${result.resourceCount} resources, and the knowledge overview resource.`,
          data: result,
        }
      }))
    }
  }

  if (options.transportMode === 'all' || options.transportMode === 'http') {
    if (missingArtifacts.length > 0) {
      checks.push(skipTransportCheck('http-runtime', 'Streamable HTTP runtime handshake'))
    }
    else if (options.transportMode === 'all') {
      checks.push(await runDoctorSubprocess('http'))
    }
    else {
      checks.push(await runChecked('http-runtime', 'Streamable HTTP runtime handshake', async () => {
        const result = await verifyHttpTransport(payload)
        return {
          detail: `Connected over Streamable HTTP at ${result.url}, verified ${result.toolCount} tools, ${result.resourceCount} resources, the knowledge overview resource, and the health endpoint at ${result.healthUrl}.`,
          data: result,
        }
      }))
    }
  }

  const summary = summarizeChecks(checks)

  return {
    ok: summary.failed === 0,
    summary,
    checks,
    config: {
      serverId: payload.serverId,
      selectedPlatform: payload.selectedPlatform,
      httpUrl: payload.http.url,
      clientPresetNames: presetNames,
    },
  }
}

async function verifyStdioTransport(payload) {
  const stdioConfig = payload.stdio[payload.selectedPlatform]
  const transport = new StdioClientTransport({
    command: stdioConfig.command,
    args: stdioConfig.args,
    cwd: stdioConfig.cwd,
    stderr: 'pipe',
  })
  const stderrBuffer = createStreamCollector(transport.stderr)
  const client = new Client({
    name: 'graphql-gene-mcp-doctor-stdio',
    version: '1.0.0',
  })

  try {
    await withTimeout(client.connect(transport), 15000, 'Timed out while connecting to the stdio MCP server.')
    const tools = await withTimeout(client.listTools(), 10000, 'Timed out while listing stdio MCP tools.')
    const resources = await withTimeout(client.listResources(), 10000, 'Timed out while listing stdio MCP resources.')
    const overview = await withTimeout(
      client.readResource({ uri: 'knowledge://overview' }),
      10000,
      'Timed out while reading the stdio knowledge overview resource.',
    )

    return {
      toolCount: tools.tools.length,
      resourceCount: resources.resources.length,
      overviewBytes: JSON.stringify(overview).length,
      stderrPreview: stderrBuffer.read(),
    }
  }
  catch (error) {
    throw enrichError(error, stderrBuffer.read())
  }
  finally {
    await Promise.allSettled([
      client.close(),
      transport.close(),
    ])
  }
}

async function verifyHttpTransport(payload) {
  const httpConfig = payload.http.start[payload.selectedPlatform]
  const httpEntrypoint = resolve(payload.mcpServerRoot, 'dist/mcp-server/src/http-entry.js')
  const authToken = process.env.GRAPHQL_GENE_MCP_AUTH_TOKEN
  const child = spawn(process.execPath, [httpEntrypoint], {
    cwd: httpConfig.cwd,
    env: sanitizeEnv({
      ...process.env,
      ...httpConfig.env,
      GRAPHQL_GENE_MCP_PORT: '0',
    }),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  const stdoutBuffer = createStreamCollector(child.stdout)
  const stderrBuffer = createStreamCollector(child.stderr)

  let client = null
  let transport = null

  try {
    const url = await waitForHttpServerUrl(child, stdoutBuffer, stderrBuffer)

    client = new Client({
      name: 'graphql-gene-mcp-doctor-http',
      version: '1.0.0',
    })
    transport = new StreamableHTTPClientTransport(new URL(url), {
      requestInit: authToken
        ? {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        : undefined,
    })

    await withTimeout(client.connect(transport), 15000, 'Timed out while connecting to the HTTP MCP server.')
    const tools = await withTimeout(client.listTools(), 10000, 'Timed out while listing HTTP MCP tools.')
    const resources = await withTimeout(client.listResources(), 10000, 'Timed out while listing HTTP MCP resources.')
    const overview = await withTimeout(
      client.readResource({ uri: 'knowledge://overview' }),
      10000,
      'Timed out while reading the HTTP knowledge overview resource.',
    )
    const healthUrl = new URL(process.env.GRAPHQL_GENE_MCP_HEALTH_PATH ?? '/healthz', url).toString()
    const health = await withTimeout(
      fetch(healthUrl, {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : undefined,
      }),
      10000,
      'Timed out while reading the HTTP health endpoint.',
    )

    if (!health.ok) {
      throw new Error(`Health endpoint check failed with status ${health.status}.`)
    }

    return {
      url,
      healthUrl,
      toolCount: tools.tools.length,
      resourceCount: resources.resources.length,
      overviewBytes: JSON.stringify(overview).length,
      stdoutPreview: stdoutBuffer.read(),
      stderrPreview: stderrBuffer.read(),
    }
  }
  catch (error) {
    throw enrichError(error, `${stderrBuffer.read()}\n${stdoutBuffer.read()}`.trim())
  }
  finally {
    await Promise.allSettled([
      transport?.close?.() ?? Promise.resolve(),
      client?.close?.() ?? Promise.resolve(),
    ])
    await terminateChild(child)
  }
}

async function runChecked(id, title, callback) {
  try {
    const result = await callback()
    return {
      id,
      status: 'pass',
      title,
      detail: result.detail,
      data: result.data,
    }
  }
  catch (error) {
    return {
      id,
      status: 'fail',
      title,
      detail: error instanceof Error ? error.message : String(error),
      remediation: 'Inspect the reported command/output, run npm run mcp:build if needed, then retry the doctor command.',
    }
  }
}

async function runDoctorSubprocess(transport) {
  const child = spawn(process.execPath, [scriptPath, `--transport=${transport}`, '--json'], {
    cwd: resolve(import.meta.dirname, '..', '..'),
    env: sanitizeEnv(process.env),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  const stdoutBuffer = createStreamCollector(child.stdout)
  const stderrBuffer = createStreamCollector(child.stderr)
  const exitCode = await new Promise((resolvePromise, rejectPromise) => {
    child.once('error', rejectPromise)
    child.once('exit', code => resolvePromise(code ?? 1))
  })

  const stdout = stdoutBuffer.read()
  const stderr = stderrBuffer.read()

  if (exitCode !== 0) {
    return {
      id: `${transport}-runtime`,
      status: 'fail',
      title: transport === 'stdio' ? 'Stdio runtime handshake' : 'Streamable HTTP runtime handshake',
      detail: `Nested doctor process failed with exit code ${exitCode}.${stderr ? ` ${stderr}` : ''}`.trim(),
      remediation: 'Run the transport-specific doctor command directly to inspect the runtime failure in isolation.',
    }
  }

  const nestedReport = JSON.parse(stdout)
  const runtimeCheck = nestedReport.checks.find(check => check.id === `${transport}-runtime`)

  if (!runtimeCheck) {
    return {
      id: `${transport}-runtime`,
      status: 'fail',
      title: transport === 'stdio' ? 'Stdio runtime handshake' : 'Streamable HTTP runtime handshake',
      detail: 'Nested doctor output did not include the expected runtime check.',
      remediation: 'Inspect the nested doctor JSON output and ensure the transport-specific check is still emitted.',
    }
  }

  return runtimeCheck
}

function skipTransportCheck(id, title) {
  return {
    id,
    status: 'fail',
    title,
    detail: 'Skipped because the compiled MCP server entrypoints were not present.',
    remediation: 'Run npm run mcp:build before retrying runtime transport checks.',
  }
}

function summarizeChecks(checks) {
  const summary = { passed: 0, warned: 0, failed: 0 }

  for (const check of checks) {
    if (check.status === 'pass') summary.passed += 1
    else if (check.status === 'warn') summary.warned += 1
    else summary.failed += 1
  }

  return summary
}

function writeReport(report, json) {
  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2))
    return
  }

  const lines = [
    'GraphQL Gene MCP Doctor',
    '=======================',
    '',
  ]

  for (const check of report.checks) {
    const badge = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL'
    lines.push(`[${badge}] ${check.title}`)
    lines.push(`  ${check.detail}`)
    if (check.remediation) {
      lines.push(`  Remediation: ${check.remediation}`)
    }
    lines.push('')
  }

  lines.push(
    `Summary: ${report.summary.passed} passed, ${report.summary.warned} warned, ${report.summary.failed} failed.`,
  )

  process.stdout.write(lines.join('\n'))
}

function readPackageMetadata(workspaceRoot, mcpServerRoot) {
  return {
    graphqlGeneVersion: readJson(resolve(workspaceRoot, 'package.json'))?.dependencies?.['graphql-gene'],
    mcpServerVersion: readJson(resolve(mcpServerRoot, 'package.json'))?.version,
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  }
  catch {
    return null
  }
}

function readOption(argv, name) {
  const direct = argv.find(argument => argument.startsWith(`${name}=`))
  if (direct) {
    return direct.slice(name.length + 1)
  }

  const index = argv.indexOf(name)
  if (index >= 0 && argv[index + 1]) {
    return argv[index + 1]
  }

  return undefined
}

function sanitizeEnv(env) {
  return Object.fromEntries(
    Object.entries(env).filter(([, value]) => typeof value === 'string'),
  )
}

function createStreamCollector(stream) {
  let buffer = ''

  if (stream) {
    stream.setEncoding('utf8')
    stream.on('data', (chunk) => {
      buffer += chunk
      if (buffer.length > 8000) {
        buffer = buffer.slice(-8000)
      }
    })
  }

  return {
    read() {
      return buffer.trim()
    },
  }
}

async function waitForHttpServerUrl(child, stdoutBuffer, stderrBuffer) {
  const pattern = /streamable HTTP listening on (http:\/\/\S+)/i

  return withTimeout(new Promise((resolvePromise, rejectPromise) => {
    const tryResolve = (text) => {
      const match = pattern.exec(text)
      if (match) {
        cleanup()
        resolvePromise(match[1])
      }
    }

    const onStdout = (chunk) => tryResolve(String(chunk))
    const onStderr = (chunk) => tryResolve(String(chunk))
    const onExit = (code) => {
      cleanup()
      rejectPromise(new Error(
        `HTTP MCP server exited before becoming ready (code ${code ?? 'unknown'}). ${stderrBuffer.read() || stdoutBuffer.read() || ''}`.trim(),
      ))
    }

    const cleanup = () => {
      child.stdout?.off('data', onStdout)
      child.stderr?.off('data', onStderr)
      child.off('exit', onExit)
    }

    child.stdout?.on('data', onStdout)
    child.stderr?.on('data', onStderr)
    child.on('exit', onExit)

    tryResolve(stdoutBuffer.read())
    tryResolve(stderrBuffer.read())
  }), 15000, 'Timed out while waiting for the HTTP MCP server to report its listening URL.')
}

async function terminateChild(child) {
  if (child.exitCode !== null || child.killed) {
    return
  }

  child.kill()

  const exited = await Promise.race([
    onceChildExit(child).then(() => true),
    delay(1000).then(() => false),
  ])

  if (!exited && process.platform === 'win32' && child.pid) {
    await new Promise((resolvePromise) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        windowsHide: true,
      })

      killer.once('exit', () => resolvePromise())
      killer.once('error', () => resolvePromise())
    })
    return
  }

  if (!exited) {
    child.kill('SIGKILL')
    await onceChildExit(child).catch(() => {})
  }
}

function onceChildExit(child) {
  return new Promise((resolvePromise, rejectPromise) => {
    child.once('exit', () => resolvePromise())
    child.once('error', rejectPromise)
  })
}

function delay(ms) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, ms))
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error(message)
    }),
  ])
}

function enrichError(error, output) {
  const message = error instanceof Error ? error.message : String(error)
  if (!output) {
    return new Error(message)
  }

  return new Error(`${message}\nOutput:\n${output}`)
}
