# ADR 0001: Preserve A Single REPL-Centered Architecture Spine

## Status
Accepted

## Context

This shell is intended to be reused across many CLI/TUI products. A parser-centric design would encourage each product to grow a different runtime shape, making reuse harder.

## Decision

The project will preserve a single architecture spine:

- `main.tsx`
- `replLauncher.tsx`
- `components/App.tsx`
- `screens/REPL.tsx`
- `QueryEngine.ts`
- `query.ts`
- registry layers in `commands.ts` and `tools.ts`

## Consequences

- Products reuse one mental model across apps.
- Interactive mode remains the center of gravity.
- Some files will stay relatively important and broad by design.
- Product customization happens through adapters and registries, not by replacing the shell shape.
