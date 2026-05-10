import React from 'react'
import { Box, Text, useApp } from 'ink'
import type { QueryEngine } from '../QueryEngine.js'
import { useAppStateStore } from '../state/AppState.js'
import { StatusLine } from '../components/StatusLine.js'
import { TerminalUI, type TuiPackageChange } from '../packageDiff/tui/TerminalUI.js'

export function REPL(props: {
  packages: TuiPackageChange[]
  queryEngine: QueryEngine
  includePrerelease: boolean
}): React.ReactElement {
  const { exit } = useApp()
  const store = useAppStateStore()

  React.useEffect(() => {
    store.setState({
      statusLine: `Loaded ${props.packages.length} package changes`,
    })
  }, [props.packages.length, store])

  return (
    <Box flexDirection="column">
      <StatusLine />
      <Box marginBottom={1}>
        <Text color="cyan">package-diff TUI</Text>
        <Text color="gray"> powered by the reusable shell architecture</Text>
      </Box>
      <TerminalUI
        packages={props.packages}
        queryEngine={props.queryEngine}
        includePrerelease={props.includePrerelease}
        onExit={() => {
          exit()
        }}
      />
    </Box>
  )
}
