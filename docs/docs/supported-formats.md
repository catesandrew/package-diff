---
id: supported-formats
title: Supported Formats
sidebar_position: 4
---

# Supported Formats

`package-diff` supports five lockfile formats. Each format has a dedicated analyzer that knows how to parse the file, extract package versions, and optionally query the corresponding package registry for metadata.

## Lockfile Types

### npm (`package-lock.json`)

- **File:** `package-lock.json`
- **Include flag:** `npmjs`
- **Registry:** npmjs.com
- **Sections:** `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`

npm lockfiles are parsed to extract resolved package versions. The npm registry is queried for release count metadata and GitHub repository URLs (used for release notes fetching).

### pnpm (`pnpm-lock.yaml`)

- **File:** `pnpm-lock.yaml`
- **Include flag:** `pnpm`
- **Registry:** npmjs.com
- **Sections:** `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`

pnpm lockfiles use YAML format. The analyzer handles multiple lockfile format versions and extracts package names and versions from the lockfile's dependency resolution structure.

### Yarn (`yarn.lock`)

- **File:** `yarn.lock`
- **Include flag:** `yarn`
- **Registry:** npmjs.com
- **Sections:** `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`

Yarn lockfiles use a custom format. The analyzer parses the lockfile to extract resolved versions from the lock entries.

### Composer (`composer.lock`)

- **File:** `composer.lock`
- **Include flag:** `composer`
- **Registry:** Packagist (packagist.org)
- **Sections:** `packages`, `packages-dev`

Composer lockfiles are JSON and contain a flat list of installed packages with their versions. The Packagist registry is queried for version metadata and GitHub URLs.

### Plain package.json

- **File:** `package.json`
- **Include flag:** `package-json`
- **Registry:** N/A (range diffs only)
- **Sections:** `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`

When no lockfile is present (or when explicitly included), `package-diff` can compare the dependency version ranges declared in `package.json` files. This shows which ranges were added, removed, or changed, but does not resolve exact versions.

## Lockfile Discovery

When you run `analyse`, `between`, `check`, or `tui`, `package-diff`:

1. Finds the git root via `git rev-parse --show-toplevel`
2. Walks upward from `process.cwd()` to the git root
3. At each directory level, checks for known lockfile names and records any that exist

This means in a monorepo, running `package-diff` from a sub-package will discover lockfiles in:
- The current package directory
- Parent package directories
- The repository root

## Filtering Lockfile Types

Use `--include` to process only specific lockfile types:

```bash
package-diff analyse --include pnpm,npmjs
```

Use `--exclude` to skip specific lockfile types:

```bash
package-diff analyse --exclude composer,package-json
```

Valid type names for both flags: `composer`, `npmjs`, `pnpm`, `yarn`, `package-json`.

## Diff Classification

Each package change is classified as one of:

| Status | Description |
|--------|-------------|
| **Added** | Package was not present before, now it is (`from=null`, `to=version`) |
| **Removed** | Package was present before, now it is not (`from=version`, `to=null`) |
| **Updated** | Package version increased (SemVer comparison) |
| **Downgraded** | Package version decreased (SemVer comparison) |
| **Changed** | Version changed but cannot be compared via SemVer |

### SemVer Magnitude

For updated and downgraded packages, when both versions can be coerced into valid SemVer, the magnitude is classified:

| Magnitude | Meaning |
|-----------|---------|
| **Major** | Breaking change -- first version number differs (e.g., `2.x.x` to `3.x.x`) |
| **Minor** | New features -- second version number differs (e.g., `2.1.x` to `2.2.x`) |
| **Patch** | Bug fixes -- third version number differs (e.g., `2.1.0` to `2.1.1`) |

Dev-style versions (strings containing `dev` that are not valid SemVer) are treated as "unknown" and do not receive a magnitude label.

### Release Count

For updated and downgraded packages, `package-diff` queries the package registry to count how many versions were published in the range `from < version <= to`. This value is best-effort and may be `null` if the registry call fails or the package type does not support registry lookups.
