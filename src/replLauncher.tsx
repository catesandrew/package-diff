import React from 'react'
import { App } from './components/App.js'
import { REPL } from './screens/REPL.js'
import type { Root } from './ink.js'
import type { QueryEngine, PackageDiffTuiOptions } from './QueryEngine.js'
import type { TuiPackageChange } from './packageDiff/tui/TerminalUI.js'

export interface LaunchReplArgs {
  root: Root
  cwd: string
  startupNotes: string[]
  packages: TuiPackageChange[]
  queryEngine: QueryEngine
  options: PackageDiffTuiOptions
}

export async function launchRepl({
  root,
  cwd,
  startupNotes,
  packages,
  queryEngine,
  options,
}: LaunchReplArgs): Promise<void> {
  root.render(
    <App initialCwd={cwd} startupNotes={startupNotes} theme="cyan">
      <REPL
        packages={packages}
        queryEngine={queryEngine}
        includePrerelease={options.includePrerelease}
      />
    </App>,
  )
}
