import React from 'react';
import { Box, Text } from 'ink';
import { useAppState } from '../../state/AppState.js';
import { useTaskListWatcher } from '../../hooks/useTaskListWatcher.js';
import { useRemoteSession } from '../../hooks/useRemoteSession.js';

export function PromptInputFooterLeftSide(): React.ReactElement {
  const mode = useAppState(state => state.mode);
  const taskState = useTaskListWatcher();
  const remote = useRemoteSession();

  return (
    <Box gap={1}>
      <Text color="yellow">mode:{mode}</Text>
      {remote.enabled ? <Text color="magenta">remote:{remote.label ?? 'example'}</Text> : null}
      <Text color="green">tasks:{taskState.runningCount}</Text>
    </Box>
  );
}
