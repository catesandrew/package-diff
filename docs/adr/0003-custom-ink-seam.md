# ADR 0003: Keep A Custom `ink/` Namespace Even When Using Upstream Ink

## Status
Accepted

## Context

The starter shell currently relies on upstream Ink for real rendering, but the target architecture includes a deeper renderer layer with performance-focused seams.

## Decision

The shell will keep a local `src/ink/` namespace and route app rendering through local files such as:

- `ink.tsx`
- `ink/root.tsx`
- `ink/render-to-screen.ts`
- `ink/output.ts`
- `ink/optimizer.ts`
- `ink/render-node-to-output.ts`

## Consequences

- Future products can evolve rendering internals without restructuring the app.
- The starter shell can remain lightweight while preserving the intended architecture.
- There is a small amount of indirection now, but it buys long-term flexibility.
