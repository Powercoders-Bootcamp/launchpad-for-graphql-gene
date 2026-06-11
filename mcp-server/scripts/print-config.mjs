import { buildMcpAdoptionConfig, formatMcpAdoptionConfig } from './lib/adoption-config.mjs'

const payload = buildMcpAdoptionConfig()

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(payload, null, 2))
  process.exit(0)
}

process.stdout.write(formatMcpAdoptionConfig(payload))
