import { resolveReleaseNotesQuery } from './query.js'
import type { ReleaseNotesCollection } from './packageDiff/data/releaseNotesCollection.js'
import type { DiffResult } from './packageDiff/data/diffResult.js'
import type { DiffCalculator } from './packageDiff/services/diffCalculator.js'
import type { GitRepository } from './packageDiff/services/gitRepository.js'
import type { PackagistRegistry } from './packageDiff/analyzers/registries/packagistRegistry.js'
import type { NpmRegistry } from './packageDiff/analyzers/registries/npmRegistry.js'
import type { ReleaseNotesResolver } from './packageDiff/analyzers/releaseNotes/releaseNotesResolver.js'
import type { TuiPackageChange } from './packageDiff/tui/TerminalUI.js'

export interface PackageDiffTuiOptions {
  ignoreLast: boolean
  noCache: boolean
  fromCommit: string | null
  toCommit: string | null
  includePrerelease: boolean
  sections: string[] | null
}

interface QueryEngineDeps {
  diffCalculator: DiffCalculator
  gitRepository: GitRepository
  packagistRegistry: PackagistRegistry
  npmRegistry: NpmRegistry
  releaseNotesResolver: ReleaseNotesResolver
}

export class QueryEngine {
  constructor(private readonly deps: QueryEngineDeps) {}

  async loadPackages(options: PackageDiffTuiOptions): Promise<TuiPackageChange[]> {
    const calculator = this.deps.diffCalculator

    if (options.ignoreLast) {
      calculator.ignoreLastCommit()
    }
    if (options.sections) {
      calculator.packageJsonOnlySections(options.sections)
    }
    if (options.fromCommit) {
      calculator.fromCommitRef(options.fromCommit)
    }
    if (options.toCommit) {
      calculator.toCommitRef(options.toCommit)
    }

    const result = (await calculator.run(false)) as DiffResult
    const flattened: TuiPackageChange[] = []

    for (const diff of result.diffs) {
      for (const change of diff.changes) {
        flattened.push({
          name: change.name,
          type: change.type,
          from: change.from,
          to: change.to,
          status: change.status,
          releases: change.releaseCount,
          semver: change.semver,
          filename: diff.filename,
        })
      }
    }

    return flattened
  }

  async loadReleaseNotes(
    selected: TuiPackageChange,
    includePrerelease: boolean,
  ): Promise<ReleaseNotesCollection | null> {
    return await resolveReleaseNotesQuery({
      selected,
      includePrerelease,
      gitRepository: this.deps.gitRepository,
      packagistRegistry: this.deps.packagistRegistry,
      npmRegistry: this.deps.npmRegistry,
      releaseNotesResolver: this.deps.releaseNotesResolver,
    })
  }
}
