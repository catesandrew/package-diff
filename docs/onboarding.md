# Onboarding Guide

## Purpose

This repository is now the `package-diff` product running on top of the reusable TUI shell architecture.

Keep the architecture.
Evolve the package-diff domain inside it.

## The Architecture Spine

These files are the non-negotiable mental model:

1. `src/main.tsx`
   The package-diff launch spine. Commander routing, default-command behavior, and shell entry all start here.

2. `src/replLauncher.tsx`
   The narrow bridge between bootstrap and the mounted app shell.

3. `src/components/App.tsx`
   The provider shell. Global state and cross-cutting runtime context should enter here before they reach the REPL kernel.

4. `src/screens/REPL.tsx`
   The TUI kernel. It now hosts the package-diff browser through the shell REPL seam.

5. `src/QueryEngine.ts`
   The package-diff TUI session facade. It loads package changes and release notes for the browser.

6. `src/query.ts`
   The package-diff release-notes query boundary. Keep release-note resolution separate from the UI.

7. `src/packageDiff/`
   The migrated product domain. Most package-diff behavior now lives here.

## What To Replace First

For package-diff, these are the most important places to evolve:

- package diff analyzers and lockfile parsers in `src/packageDiff/analyzers/`
- command behavior in `src/packageDiff/commands/`
- output formatting in `src/packageDiff/outputs/`
- release note resolution in `src/packageDiff/analyzers/releaseNotes/`
- shell-facing TUI behavior in `src/screens/REPL.tsx` and `src/packageDiff/tui/TerminalUI.tsx`

## What To Preserve

Try to keep these stable:

- The entry spine in `main.tsx`
- The App -> REPL -> QueryEngine -> query split
- The external store boundary in `src/state/`
- The virtualization/render-performance seam in `src/components/VirtualMessageList.tsx`, `src/hooks/useVirtualScroll.ts`, and `src/ink/`
- The test boundary through `runCli()` in `src/main.tsx`

## Recommended Workflow For package-diff Changes

1. Change domain behavior in `src/packageDiff/` first.
2. Change shell/runtime behavior in `src/` only when the improvement should apply to the reusable architecture itself.
3. Keep `runCli()` stable.
4. Keep the TUI on the `main.tsx` -> `replLauncher.tsx` -> `components/App.tsx` -> `screens/REPL.tsx` path.
5. Expand unit and e2e coverage before changing output semantics.

## Testing Workflow

Current test commands:

```bash
bun test
bun run test:e2e
```

Current coverage intentionally focuses on the shell seam:

- `tests/main.test.ts`
  Verifies the CLI runtime can be exercised without a raw TTY by calling `runCli()` directly.

- `tests/query-engine.test.ts`
  Verifies the session/query facade returns an assistant message.

- `tests/state.test.ts`
  Verifies the external store notifies subscribers on change.

- `tests/e2e/print-mode.test.ts`
  Verifies the built CLI works end-to-end in print mode.

## Bun-first workflow

This repository is intentionally Bun-first.

Use these commands by default:

```bash
bun install
bun run dev
bun run typecheck
bun test
bun run test:e2e
bun run build
bun run compile:exe
```

What this means in practice:

- `bun install` is the default package manager path
- `bun run` is the default script/runtime path
- `bun test` is the default test runner
- `bun build --compile` is the default executable packaging path

Node remains a compatibility fallback, not the primary workflow.

One implementation detail is intentional: `vendor/react-devtools-core` exists as a local shim so Bun can compile the Ink-based shell into a single executable without failing on Ink's optional DevTools import.

## Future Extensions

Good next additions for a real product:

- richer task/mailbox adapters
- more realistic background work integration
- interactive e2e coverage using a PTY harness
- transcript search/jump tests
- richer remote/direct-connect adapters

## Rule Of Thumb

If you want to change package-diff behavior, work in `src/packageDiff/`.

If you want to change how every future shell-based TUI should be structured, work in the shared `src/` shell architecture and write an ADR for it.
