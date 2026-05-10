import React from 'react';
import { Box, Text } from 'ink';
import { useAppState } from '../state/AppState.js';
import { useMetricsSnapshot } from './App.js';

export function StatusLine(): React.ReactElement {
  const cwd = useAppState(state => state.cwd);
  const status = useAppState(state => state.statusLine);
  const mode = useAppState(state => state.mode);
  const metrics = useMetricsSnapshot();

  return (
    <Box justifyContent="space-between">
      <Text color="gray">{cwd}</Text>
      <Text color="cyan">
        {mode} | {status} | {metrics.averageFps.toFixed(0)}fps avg / {metrics.lowPercentileFps.toFixed(0)} low | dirty:{metrics.dirtyRegions} | last:{metrics.lastReason} | sel:{metrics.selectionChanges} | panes L{metrics.paneRenders.list}/D{metrics.paneRenders.details}/C{metrics.paneRenders.chrome}
      </Text>
    </Box>
  );
}
