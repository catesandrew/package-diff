---
id: usage
title: Usage
sidebar_position: 2
---

# Usage

`package-diff` defaults to the `analyse` command when no subcommand is provided. It supports six commands for different workflows.

## Commands

### `analyse`

Scans upward from the current working directory to the git root, discovers lockfiles, and shows what changed.

**Default comparison behavior:**
- If a lockfile is modified or untracked in your working tree, it compares the **working tree** vs **HEAD**.
- Otherwise, it compares the most recent lockfile commit vs the commit before it (showing the last committed lockfile update).

```bash
# Default -- analyse recent changes
package-diff

# Explicit
package-diff analyse

# With options
package-diff analyse --format markdown --explain
```

### `between <from> [to]`

Compares lockfiles between two explicit git refs. The `to` argument defaults to `HEAD`.

```bash
package-diff between main feature-branch
package-diff between v1.0.0 v2.0.0
package-diff between HEAD~5
```

### `check <package>`

Checks whether a specific package matches a condition. Exits with code `0` if the condition is met, `1` if not, and `2` on errors.

```bash
# Check if react has any change (default)
package-diff check react

# Check for a specific change type
package-diff check react --is-updated
package-diff check lodash --is-removed
package-diff check zod --is-added

# Quiet mode for CI scripts
package-diff check react --is-updated --quiet
```

**Available check flags:**

| Flag | Description |
|------|-------------|
| `--has-any-change` | Any change detected (default) |
| `--is-updated` | Package was updated to a newer version |
| `--is-downgraded` | Package was downgraded to an older version |
| `--is-removed` | Package was removed |
| `--is-added` | Package was added |
| `--is-changed` | Package version changed (non-SemVer) |
| `-q, --quiet` | Suppress stdout output |

### `changelog <package> [versionOrRange]`

Fetches and displays release notes for a dependency between two versions.

```bash
# Explicit version range
package-diff changelog react 18.2.0...18.3.1

# Single version (resolves previous version automatically)
package-diff changelog react 18.3.1

# Infer versions from lockfile history
package-diff changelog react

# With options
package-diff changelog react 18.2.0...18.3.1 --format markdown --summary
```

**Version range resolution:**
- `A...B` -- uses the exact range provided
- `B` (single version) -- resolves the previous version from the package registry, then uses `prev(B)...B`
- No version argument -- infers versions from lockfile history, optionally using `--from`/`--to` refs

**Changelog-specific options:**

| Option | Description |
|--------|-------------|
| `--type` | Force package manager type: `composer`, `npm`, `pnpm`, `yarn` |
| `--include-prerelease` | Include prerelease versions when parsing changelogs |
| `--summary` | Produce condensed output |

### `config [key] [value]`

Reads or writes configuration stored at `~/.package-diff/config.yaml`.

```bash
# Print full config
package-diff config

# Read a single key
package-diff config cache.enabled

# Set a value
package-diff config cache.enabled false
package-diff config cache.min-time 60
```

### `tui`

Opens an interactive terminal UI built with Ink/React for browsing dependency changes and previewing release notes.

```bash
package-diff tui
```

**Key bindings:**

| Key | Action |
|-----|--------|
| `Up/Down` or `j/k` | Move selection |
| `PageUp/PageDown` | Jump by 10 items |
| `g` / `G` | Jump to start / end |
| `Enter` | Open release notes detail view |
| `Esc` / `Backspace` | Return to summary from detail view |
| `t` | Toggle summary vs full mode |
| `q` | Quit |

## Shared Options

These options are available for `analyse`, `between`, and other commands that perform diff calculations.

| Option | Description | Default |
|--------|-------------|---------|
| `--format <type>` | Output format: `text`, `json`, `markdown` | `text` |
| `--from <ref>` | Git ref to compare from | auto-detected |
| `--to <ref>` | Git ref to compare to | `HEAD` |
| `--include <types>` | Comma-separated lockfile types to include | all |
| `--exclude <types>` | Comma-separated lockfile types to exclude | none |
| `--sections <list>` | Dependency sections: `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies` | all |
| `--explain` | Show comparison context (which refs are being compared) | `false` |
| `--fail-on <type>` | Exit non-zero on change type: `any`, `major`, `minor`, `patch`, `added`, `removed`, `updated`, `downgraded`, `changed` | none |
| `--no-cache` | Disable HTTP caching for this run | `false` |
| `--no-progress` | Disable progress indicators | `false` |
| `--show-empty` | Show lockfiles with no changes | `false` |
| `--ignore-last` | Skip the latest lockfile commit and compare against the one before it | `false` |

## Output Formats

### Text

Human-readable output with colored, aligned columns. Change types are indicated by symbols:

| Symbol | Meaning |
|--------|---------|
| `+` | Added |
| `x` | Removed |
| `~` | Changed (non-SemVer) |
| `^^^` | Major update |
| `^^` | Minor update |
| `^` | Patch update |
| `vvv` / `vv` / `v` | Downgrade (major/minor/patch) |

Release counts are shown as `(N releases)` when available from the registry.

### Markdown

Produces sections per lockfile with Markdown tables grouped by change type (Added, Removed, Updated, Downgraded). Includes SemVer labels (Major/Minor/Patch) when available. Suitable for PR comments or documentation.

### JSON

Emits a stable JSON structure for CI or tooling integrations:

```json
[
  {
    "lockfile": "pnpm-lock.yaml",
    "changes": [
      {
        "name": "react",
        "status": "updated",
        "from": "18.2.0",
        "to": "18.3.1",
        "semver": "minor",
        "release_count": 3
      }
    ]
  }
]
```

A JSON Schema is available at `schema/package-diff-output.schema.json`.
