#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import type { Command } from 'commander'
import { buildPackageDiffProgram, normalizePackageDiffArgv } from './packageDiff/program.js'

interface RuntimeIo {
  stdout?: Pick<typeof process.stdout, 'write'>
  stderr?: Pick<typeof process.stderr, 'write'>
}

async function parseProgram(program: Command, argv: string[]): Promise<void> {
  program.exitOverride()
  await program.parseAsync(argv, { from: 'node' })
}

export async function runCli(argv: string[], io: RuntimeIo = {}): Promise<number> {
  const stdout = io.stdout ?? process.stdout
  const stderr = io.stderr ?? process.stderr
  const program = await buildPackageDiffProgram()
  program.configureOutput({
    writeOut: (value: string) => {
      stdout.write(value)
    },
    writeErr: (value: string) => {
      stderr.write(value)
    },
  })

  const normalized = normalizePackageDiffArgv(argv.slice(2))

  try {
    await parseProgram(program, [argv[0] ?? 'node', argv[1] ?? 'package-diff', ...normalized])
    return typeof process.exitCode === 'number' ? process.exitCode : 0
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String((error as { code?: unknown }).code ?? '')
      if (code === 'commander.helpDisplayed') {
        return 0
      }
      if (code === 'commander.version') {
        return 0
      }
    }

    stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
    return 1
  }
}

export async function main(argv: string[] = process.argv): Promise<void> {
  process.exitCode = await runCli(argv)
}

const currentFilePath = fileURLToPath(import.meta.url)
const isBunMain = typeof (import.meta as ImportMeta & { main?: boolean }).main === 'boolean'
  ? Boolean((import.meta as ImportMeta & { main?: boolean }).main)
  : false

if (isBunMain || process.argv[1] === currentFilePath) {
  void main()
}
