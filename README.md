# package-diff

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-package--diff-red.svg)](https://www.npmjs.com/package/package-diff)

**CLI tool to inspect dependency changes between git commits.**

Quickly see what changed in your lockfiles -- added, removed, updated, or downgraded packages -- with SemVer classification, release count estimates, and optional release notes fetching.

[Documentation](https://catesandrew.github.io/package-diff/) | [Getting Started](https://catesandrew.github.io/package-diff/docs/getting-started) | [Examples](https://catesandrew.github.io/package-diff/docs/examples)

## Features

- **Multi-format lockfile support** -- npm (`package-lock.json`), pnpm (`pnpm-lock.yaml`), yarn (`yarn.lock`), Composer (`composer.lock`), and plain `package.json` manifests
- **SemVer classification** -- changes are classified as major, minor, or patch upgrades/downgrades with directional arrows
- **Release notes fetching** -- pull release notes from GitHub Releases, `CHANGELOG.md`, or local vendor files for any dependency range
- **Multiple output formats** -- human-readable text (colored), Markdown tables (for PR comments), and JSON (for CI pipelines)
- **Monorepo awareness** -- discovers lockfiles by walking from `cwd` up to the git root, reporting diffs per lockfile
- **Interactive TUI** -- browse changes and preview release notes in a terminal UI built with Ink/React
- **Built-in caching** -- HTTP responses from registries and GitHub are cached on disk to speed up repeated runs
- **CI-friendly** -- exit codes, `--fail-on` flags, JSON output, and `--quiet` mode for automation

## Installation

### From source

```bash
git clone https://github.com/catesandrew/package-diff.git
cd package-diff
pnpm install
```

### Build a standalone executable

```bash
pnpm run build:exe
# Binary is at ./dist/package-diff
./dist/package-diff analyse
```

### Run directly (development)

```bash
pnpm dev -- analyse
# or use the bin script
./bin/package-diff analyse
```

## Quick Start

```bash
# See what changed in the most recent lockfile update
package-diff

# Compare lockfiles between two git refs
package-diff between main feature-branch

# Check if a specific package was updated (CI gate)
package-diff check react --is-updated --quiet

# Fetch release notes for a dependency
package-diff changelog react 18.2.0...18.3.1

# Interactive TUI
package-diff tui
```

## Usage

`package-diff` defaults to the `analyse` command when no subcommand is given.

### Commands

| Command | Description |
|---------|-------------|
| `analyse` | Scan for lockfile changes (default command) |
| `between <from> [to]` | Compare lockfiles at two explicit git refs |
| `check <package>` | Check if a package matches a condition (exit code 0/1) |
| `changelog <pkg> [range]` | Fetch release notes for a dependency version range |
| `config [key] [value]` | Read or write configuration |
| `tui` | Interactive terminal UI for browsing changes |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format` | Output format: `text`, `json`, `markdown` | `text` |
| `--from` | Git ref to compare from | auto-detected |
| `--to` | Git ref to compare to | `HEAD` |
| `--include` | Lockfile types to include (comma-separated) | all |
| `--exclude` | Lockfile types to exclude (comma-separated) | none |
| `--sections` | Dependency sections to show | all |
| `--fail-on` | Exit non-zero on change type: `any`, `major`, `minor`, `patch`, `added`, `removed` | none |
| `--explain` | Show comparison context (which refs are being compared) | `false` |
| `--no-cache` | Disable HTTP caching for this run | `false` |
| `--no-progress` | Disable progress indicators | `false` |
| `--show-empty` | Show lockfiles with no changes | `false` |
| `--ignore-last` | Skip the latest lockfile commit | `false` |
| `-q, --quiet` | Suppress stdout (for `check` command) | `false` |

### Lockfile types for `--include` / `--exclude`

`composer`, `npmjs`, `pnpm`, `yarn`, `package-json`

## Examples

### Before a release -- review all dependency changes

```bash
package-diff between v1.0.0 v2.0.0
```

```
pnpm-lock.yaml  (HEAD~3 vs HEAD)
  ↑↑↑ react        17.0.2 -> 18.3.1  (12 releases)  Major
  ↑   chalk         4.1.2 -> 5.3.0   (3 releases)   Major
  ↑   commander    11.1.0 -> 12.1.0  (4 releases)   Major
  +   ink           ---   -> 5.0.0
  ×   left-pad      1.3.0 -> ---
```

### Reviewing a PR -- generate a Markdown report

```bash
package-diff between origin/main HEAD --format markdown > dependency-changes.md
```

### Fetch release notes for a specific package

```bash
package-diff changelog react 18.2.0...18.3.1 --format text --summary
```

### CI gate -- fail if any major upgrade was introduced

```bash
package-diff analyse --fail-on major --quiet
```

### Machine-readable output for tooling

```bash
package-diff analyse --format json > package-diff.json
```

### Interactive browsing

```bash
package-diff tui
```

Key bindings: `j/k` or arrows to navigate, `Enter` to view release notes, `t` to toggle summary/full mode, `q` to quit.

## Output Formats

### Text

Colored, aligned columns with symbols indicating change type:

| Symbol | Meaning |
|--------|---------|
| `+` | Added |
| `x` | Removed |
| `~` | Changed (non-SemVer) |
| `^^^` | Major update |
| `^^` | Minor update |
| `^` | Patch update |
| `vvv` | Major downgrade |

### Markdown

Produces tables grouped by lockfile, suitable for PR comments or documentation.

### JSON

Stable schema for CI/tooling integrations with one entry per lockfile and one entry per changed package containing `status`, `from`, `to`, `semver`, and `release_count` fields.

## Configuration

`package-diff` stores configuration at `~/.package-diff/config.yaml`.

| Key | Default | Description |
|-----|---------|-------------|
| `cache.enabled` | `true` | Enable/disable HTTP caching |
| `cache.min-time` | `300` | Minimum cache TTL (seconds) |
| `cache.max-time` | `86400` | Maximum cache TTL (seconds) |
| `tui.mode` | `summary` | Default TUI display mode |

```bash
# View all config
package-diff config

# Set a value
package-diff config cache.enabled false
```

## GitHub Authentication

For fetching release notes from private repositories or avoiding rate limits, `package-diff` tries to authenticate with GitHub in this order:

1. `GITHUB_TOKEN` environment variable
2. `auth.json` in the current directory (Composer format)
3. `~/.composer/auth.json`
4. `COMPOSER_AUTH` environment variable (JSON)

## Tech Stack

- **TypeScript** -- strict mode, ES2022 target
- **Commander** -- CLI argument parsing
- **Ink + React** -- interactive terminal UI
- **SemVer** -- version comparison and classification
- **Bun** -- test runner and standalone binary compilation
- **pnpm** -- package management

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Install dependencies: `pnpm install`
4. Make your changes
5. Run tests: `bun test`
6. Run type checking: `pnpm run typecheck`
7. Submit a pull request

## License

[MIT](LICENSE) -- Copyright (c) 2025 Andrew Cates
