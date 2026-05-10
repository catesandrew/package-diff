---
id: examples
title: Examples
sidebar_position: 3
---

# Examples

Real-world usage patterns for `package-diff` across different workflows.

## Before a Release

Review all dependency changes between two tags to understand what changed since the last release:

```bash
package-diff between v1.0.0 v2.0.0
```

Example output:

```
pnpm-lock.yaml  (v1.0.0 vs v2.0.0)
  ^^^ react        17.0.2 -> 18.3.1  (12 releases)  Major
  ^^^ chalk         4.1.2 -> 5.3.0   (3 releases)   Major
  ^^  commander    11.1.0 -> 12.1.0  (4 releases)   Major
  +   ink           ---   -> 5.0.0
  x   left-pad      1.3.0 -> ---
```

## Reviewing Pull Requests

Generate a Markdown report suitable for pasting into a PR comment:

```bash
package-diff between origin/main HEAD --format markdown > dependency-changes.md
```

This produces a Markdown file with tables for each lockfile, organized by change type:

```markdown
## pnpm-lock.yaml

### Updated

| Package | From | To | SemVer | Releases |
|---------|------|----|--------|----------|
| react | 18.2.0 | 18.3.1 | Minor | 3 |
| typescript | 5.3.0 | 5.7.2 | Minor | 8 |

### Added

| Package | Version |
|---------|---------|
| ink | 5.0.0 |
```

## Fetching Release Notes

See what changed in a dependency between two versions:

```bash
package-diff changelog react 18.2.0...18.3.1
```

Use `--summary` for a condensed view:

```bash
package-diff changelog react 18.2.0...18.3.1 --summary
```

Use `--format markdown` for a Markdown-formatted output:

```bash
package-diff changelog commander 11.0.0...12.1.0 --format markdown
```

Let `package-diff` infer the version range from your lockfile history:

```bash
package-diff changelog react --from main --to feature-branch
```

## CI Pipeline Integration

### Fail on major upgrades

Use `--fail-on` to cause a non-zero exit when specific change types are detected:

```bash
# Fail if any major version bump is found
package-diff analyse --fail-on major --quiet
```

### Machine-readable output

Export JSON for processing by other tools:

```bash
package-diff analyse --format json > package-diff.json
```

### Check a specific package

Use `check` as a CI gate to verify a specific package meets a condition:

```bash
# Fail the CI step if react was NOT updated
package-diff check react --is-updated --quiet
if [ $? -eq 0 ]; then
  echo "react was updated"
else
  echo "react was not updated"
fi
```

### Guard against accidental removals

```bash
package-diff check lodash --is-removed --quiet && echo "WARNING: lodash was removed!"
```

## Different Output Formats

### Text (default)

```bash
package-diff analyse
```

Colored, aligned output ideal for terminal use. Symbols indicate change type and SemVer magnitude.

### Markdown

```bash
package-diff analyse --format markdown
```

Tables suitable for documentation, PR comments, or issue templates.

### JSON

```bash
package-diff analyse --format json
```

Structured output for CI pipelines, custom scripts, or further processing.

## Monorepo Usage

In a monorepo, run `package-diff` from any sub-package. It discovers lockfiles by walking upward from `cwd` to the git root:

```bash
# From a sub-package
cd packages/my-app
package-diff

# Output covers lockfiles from:
#   packages/my-app/package-lock.json
#   package-lock.json  (root)
```

Filter which lockfile types to process:

```bash
# Only show pnpm lockfile changes
package-diff analyse --include pnpm

# Exclude composer lockfiles
package-diff analyse --exclude composer
```

## Filtering Dependency Sections

Show only production dependency changes:

```bash
package-diff analyse --sections dependencies
```

Show only devDependencies:

```bash
package-diff analyse --sections devDependencies
```

Combine sections:

```bash
package-diff analyse --sections dependencies,peerDependencies
```

## Interactive Browsing

Launch the TUI to interactively browse changes and preview release notes:

```bash
package-diff tui
```

Navigate with `j/k` or arrow keys, press `Enter` to view release notes for a selected package, and `t` to toggle between summary and full mode. Press `q` to quit.

## Comparing Specific Refs

Compare the current branch against the default branch:

```bash
package-diff between origin/main HEAD
```

Compare two arbitrary commits:

```bash
package-diff between abc1234 def5678
```

Compare against a relative ref:

```bash
package-diff between HEAD~10
```

## Explain Mode

Add `--explain` to see which git refs and lockfiles are being compared:

```bash
package-diff analyse --explain
```

This prints context lines before the diff output, helping you understand exactly what is being compared and why.
