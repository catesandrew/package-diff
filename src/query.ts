import fs from 'node:fs/promises'
import type { ReleaseNotesCollection } from './packageDiff/data/releaseNotesCollection.js'
import { PackageManagerType } from './packageDiff/analyzers/packageManagerType.js'
import type { NpmRegistry } from './packageDiff/analyzers/registries/npmRegistry.js'
import type { PackagistRegistry } from './packageDiff/analyzers/registries/packagistRegistry.js'
import type { ReleaseNotesResolver } from './packageDiff/analyzers/releaseNotes/releaseNotesResolver.js'
import type { GitRepository } from './packageDiff/services/gitRepository.js'
import type { TuiPackageChange } from './packageDiff/tui/TerminalUI.js'

interface ReleaseNotesQueryDeps {
  gitRepository: GitRepository
  packagistRegistry: PackagistRegistry
  npmRegistry: NpmRegistry
  releaseNotesResolver: ReleaseNotesResolver
}

export interface ReleaseNotesQueryContext extends ReleaseNotesQueryDeps {
  selected: TuiPackageChange
  includePrerelease: boolean
}

export async function resolveReleaseNotesQuery(
  context: ReleaseNotesQueryContext,
): Promise<ReleaseNotesCollection | null> {
  if (!context.selected.from || !context.selected.to) {
    return null
  }

  const localPath = await getLocalPath(
    context.selected.name,
    context.selected.type,
    context.gitRepository,
  )
  const repositoryUrl = await getRepositoryUrl(
    context.selected.name,
    context.selected.type,
    context.packagistRegistry,
    context.npmRegistry,
  )
  if (!repositoryUrl && !localPath) {
    return null
  }

  return await context.releaseNotesResolver.resolve(
    context.selected.name,
    context.selected.from.replace(/^[vV]/, ''),
    context.selected.to.replace(/^[vV]/, ''),
    repositoryUrl ?? '',
    context.selected.type,
    localPath,
    context.includePrerelease,
  )
}

async function getRepositoryUrl(
  packageName: string,
  packageManagerType: PackageManagerType,
  packagistRegistry: PackagistRegistry,
  npmRegistry: NpmRegistry,
): Promise<string | null> {
  const registry =
    packageManagerType === PackageManagerType.Composer ? packagistRegistry : npmRegistry
  return await registry.getRepositoryUrl(packageName)
}

async function getLocalPath(
  packageName: string,
  packageManagerType: PackageManagerType,
  gitRepository: GitRepository,
): Promise<string | null> {
  const basePath = await gitRepository.getGitRoot()
  const relativePath =
    packageManagerType === PackageManagerType.Composer
      ? `vendor/${packageName}`
      : `node_modules/${packageName}`
  const fullPath = `${basePath}/${relativePath}`

  try {
    await fs.access(fullPath)
    return fullPath
  } catch {
    return null
  }
}
