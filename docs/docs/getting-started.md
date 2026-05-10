---
id: getting-started
title: Getting Started
sidebar_position: 1
---

# Getting Started

`package-diff` is a CLI tool that inspects dependency changes between git commits. It discovers lockfiles in your repository, compares versions across commits, classifies changes by SemVer magnitude, and optionally fetches release notes.

## Requirements

- **Node.js** 18+ (for development with `tsx`)
- **Git** (the tool shells out to git for commit history)
- **Bun** (optional -- for running tests and building standalone binaries)

## Installation

### Clone and install from source

```bash
git clone https://github.com/catesandrew/package-diff.git
cd package-diff
pnpm install
```

### Run in development mode

```bash
# Using pnpm dev (passes args after --)
pnpm dev -- analyse

# Using the bin script directly
./bin/package-diff analyse
```

### Build the TypeScript project

```bash
pnpm run build
```

This compiles TypeScript sources from `src/` into `dist/` using the project's `tsconfig.json`.

## Building a Standalone Executable

You can compile `package-diff` into a single self-contained binary using Bun's `--compile` flag. This produces an executable with no external dependencies.

```bash
pnpm run build:exe
```

The binary is written to `./dist/package-diff`. You can copy it anywhere on your system:

```bash
# Build
pnpm run build:exe

# Move to a directory on your PATH
cp ./dist/package-diff /usr/local/bin/package-diff

# Now use it from any git repository
cd ~/projects/my-app
package-diff
```

## Verify installation

Run from any git repository that contains a supported lockfile:

```bash
package-diff --version
package-diff analyse
```

If the repository has recent lockfile changes, you should see a summary of added, removed, updated, and downgraded packages.

## Next steps

- [Usage](/docs/usage) -- learn about all available commands and options
- [Examples](/docs/examples) -- see real-world usage patterns
- [Supported Formats](/docs/supported-formats) -- which lockfiles are supported and how they are parsed
