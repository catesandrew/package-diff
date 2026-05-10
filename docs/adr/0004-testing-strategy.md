# ADR 0004: Use Node-Native Tests And A Stable CLI Entry Boundary

## Status
Accepted

## Context

The project should remain dependency-light and reusable. Adding a large test framework for the starter shell would increase setup cost and distract from the architecture.

## Decision

The shell uses:

- Bun as the primary test runner
- node-compatible test files so the suite remains portable
- a stable exported `runCli()` boundary from `src/main.tsx`
- a built-artifact e2e smoke test for print mode

## Consequences

- The shell has real coverage without adding a large test framework.
- The CLI entrypoint is testable without importing the file and accidentally booting the TUI.
- The suite stays close to Bun-first workflows while remaining structurally portable.
- Interactive e2e coverage can be added later with a PTY harness if needed.
