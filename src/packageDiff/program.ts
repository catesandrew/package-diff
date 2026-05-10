import { Command } from 'commander'
import { createServices } from './app.js'
import { createAnalyseCommand } from './commands/analyseCommand.js'
import { createBetweenCommand } from './commands/betweenCommand.js'
import { createCheckCommand } from './commands/checkCommand.js'
import { createConfigCommand } from './commands/configCommand.js'
import { createChangelogCommand } from './commands/changelogCommand.js'
import { createTuiCommand } from './commands/tuiCommand.js'
import { moveLeadingCommandOptionsAfterCommand, shouldDefaultToAnalyse } from './utils/argv.js'

export async function buildPackageDiffProgram(): Promise<Command> {
  const services = await createServices()

  const program = new Command('package-diff')
    .description('package-diff is a CLI tool to inspect dependency changes')
    .version('dev', '-v, --version')

  program.addCommand(
    createAnalyseCommand({ cache: services.cache, diffCalculator: services.diffCalculator }),
  )
  program.addCommand(
    createBetweenCommand({ cache: services.cache, diffCalculator: services.diffCalculator }),
  )
  program.addCommand(createCheckCommand({ diffCalculator: services.diffCalculator }))
  program.addCommand(createConfigCommand({ config: services.config }))
  program.addCommand(
    createChangelogCommand({
      gitRepository: services.gitRepository,
      packagistRegistry: services.packagistRegistry,
      npmRegistry: services.npmRegistry,
      cache: services.cache,
      releaseNotesResolver: services.releaseNotesResolver,
    }),
  )
  program.addCommand(
    createTuiCommand({
      cache: services.cache,
      diffCalculator: services.diffCalculator,
      gitRepository: services.gitRepository,
      packagistRegistry: services.packagistRegistry,
      npmRegistry: services.npmRegistry,
      releaseNotesResolver: services.releaseNotesResolver,
    }),
  )

  return program
}

export function normalizePackageDiffArgv(argv: string[]): string[] {
  const knownCommands = new Set(['analyse', 'between', 'check', 'config', 'changelog', 'tui'])
  const normalized = [...argv]

  if (normalized[0] === '--') {
    normalized.shift()
  }

  const reordered = moveLeadingCommandOptionsAfterCommand(normalized, knownCommands)
  if (shouldDefaultToAnalyse(reordered, knownCommands)) {
    reordered.unshift('analyse')
  }

  return reordered
}
