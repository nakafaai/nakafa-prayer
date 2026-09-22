#!/usr/bin/env node
/**
 * Fails unless React Doctor reports a perfect score.
 *
 * The CLI can gate on findings by itself, but the project's bar is the score,
 * so this reads the structured report and checks both. It runs the published
 * CLI through `npx` rather than depending on it: its own dependency tree trips
 * the `trustPolicy: no-downgrade` rule this project keeps enabled, and a linter
 * is not worth weakening that policy for.
 */
import { spawnSync } from 'node:child_process'

const REACT_DOCTOR_VERSION = 'react-doctor@0.9.14'

const result = spawnSync(
  'npx',
  ['--yes', REACT_DOCTOR_VERSION, '.', '--yes', '--json'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
)

if (result.status !== 0) {
  console.error('React Doctor did not complete.')
  process.exit(result.status ?? 1)
}

const report = JSON.parse(result.stdout)
const { score, totalDiagnosticCount, errorCount, warningCount } = report.summary

console.log(
  `React Doctor score ${score} / 100 (${errorCount} errors, ${warningCount} warnings)`,
)

if (score !== 100 || totalDiagnosticCount !== 0) {
  for (const diagnostic of report.diagnostics ?? []) {
    console.error(`- ${diagnostic.rule} at ${diagnostic.filePath}:${diagnostic.line}`)
    console.error(`  ${diagnostic.message}`)
  }

  console.error('React Doctor must report 100 with no findings.')
  process.exit(1)
}
