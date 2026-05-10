import { Command } from 'commander'
import { DiffCalculator } from '../services/diffCalculator.js'
import { CacheService } from '../services/cacheService.js'
import { GitRepository } from '../services/gitRepository.js'
import { PackagistRegistry } from '../analyzers/registries/packagistRegistry.js'
import { NpmRegistry } from '../analyzers/registries/npmRegistry.js'
import { ReleaseNotesResolver } from '../analyzers/releaseNotes/releaseNotesResolver.js'
import { parsePackageJsonSections } from './sharedOptions.js'
import { QueryEngine, type PackageDiffTuiOptions } from '../../QueryEngine.js'
import { getRenderContext, renderAndRun, showSetupScreens } from '../../interactiveHelpers.js'
import { createRoot } from '../../ink.js'
import { launchRepl } from '../../replLauncher.js'

interface TuiDeps {
  cache: CacheService
  diffCalculator: DiffCalculator
  gitRepository: GitRepository
  packagistRegistry: PackagistRegistry
  npmRegistry: NpmRegistry
  releaseNotesResolver: ReleaseNotesResolver
}

export function createTuiCommand({
  cache,
  diffCalculator,
  gitRepository,
  packagistRegistry,
  npmRegistry,
  releaseNotesResolver,
}: TuiDeps): Command {
  const command = new Command('tui')
    .description('Launch the Terminal User Interface to browse dependency changes')
    .option('--ignore-last', 'Ignore last commit when calculating changes')
    .option('--from <commit>', 'Commit hash, branch, or tag to compare from (older version)')
    .option(
      '--to <commit>',
      'Commit hash, branch, or tag to compare to (newer version, defaults to HEAD)',
    )
    .option('--no-cache', 'Disable cache')
    .option('--no-alt-screen', 'Disable alternate screen (ignored in TS TUI)')
    .option(
      '--sections <sections>',
      'Only include these package.json dependency sections (comma-separated)',
    )
    .option('--include-prerelease', 'Include pre-release versions in release notes')

  command.action(async () => {
    const options = command.opts()
    const ignoreLast = Boolean(options.ignoreLast)
    const noCache = Boolean(options.cache === false || options.noCache)
    const fromCommit = options.from ?? null
    const toCommit = options.to ?? null
    const sectionsOption = options.sections as string | undefined
    const includePrerelease = Boolean(options.includePrerelease)

    if ((fromCommit || toCommit) && ignoreLast) {
      process.stderr.write('Cannot use --ignore-last with --from or --to options\n')
      process.exitCode = 1
      return
    }

    try {
      if (noCache) {
        cache.disableCache()
      }

      if (ignoreLast) {
        diffCalculator.ignoreLastCommit()
      }

      const { sections, error: sectionsError } = parsePackageJsonSections(sectionsOption)
      if (sectionsError) {
        process.stderr.write(`${sectionsError}\n`)
        process.exitCode = 1
        return
      }
      diffCalculator.packageJsonOnlySections(sections)

      if (fromCommit) {
        diffCalculator.fromCommitRef(fromCommit)
      }

      if (toCommit) {
        diffCalculator.toCommitRef(toCommit)
      }

      const queryEngine = new QueryEngine({
        diffCalculator,
        gitRepository,
        packagistRegistry,
        npmRegistry,
        releaseNotesResolver,
      })

      const queryOptions: PackageDiffTuiOptions = {
        ignoreLast,
        noCache,
        fromCommit,
        toCommit,
        includePrerelease,
        sections,
      }

      const packages = await queryEngine.loadPackages(queryOptions)
      if (packages.length === 0) {
        process.stdout.write('No dependency changes detected.\n')
        return
      }

      const ctx = getRenderContext()
      const root = await createRoot(ctx.renderOptions)
      await showSetupScreens(root)
      await launchRepl({
        root,
        cwd: process.cwd(),
        startupNotes: [
          'Loaded package-diff TUI through the reusable shell architecture.',
          'Replace generic shell chrome as the browser evolves.',
        ],
        packages,
        queryEngine,
        options: queryOptions,
      })
      await renderAndRun(root, [])
    } catch (error) {
      process.stderr.write(`${(error as Error).message}\n`)
      process.exitCode = 1
    }
  })

  return command
}
