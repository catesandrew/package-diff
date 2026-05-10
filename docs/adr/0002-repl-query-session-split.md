# ADR 0002: Split REPL UI, Session Facade, And Turn Loop

## Status
Accepted

## Context

TUI applications often collapse prompt handling, session state, and model/tool execution into one file. That works for one product, but it creates tight coupling and makes headless reuse difficult.

## Decision

The shell keeps three distinct layers:

- `screens/REPL.tsx`
  Owns UI orchestration, prompt entry, transcript state, and mode switching.

- `QueryEngine.ts`
  Owns session/headless coordination and provides a stable programmatic boundary.

- `query.ts`
  Owns the actual streaming turn loop and event emission.

## Consequences

- Headless and interactive execution can share the same core turn behavior.
- Tests can target the session facade without mounting the TUI.
- Product-specific query behavior can evolve without forcing shell-level rewrites.
