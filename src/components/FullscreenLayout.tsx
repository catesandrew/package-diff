import React from 'react';
import { Box } from 'ink';

export function FullscreenLayout(props: {
  transcript: React.ReactNode;
  footer: React.ReactNode;
}): React.ReactElement {
  return (
    <Box flexDirection="column" height={24} justifyContent="space-between">
      <Box flexDirection="column" flexGrow={1}>
        {props.transcript}
      </Box>
      <Box flexDirection="column">{props.footer}</Box>
    </Box>
  );
}
