import React from 'react';
import { Box, Text } from 'ink';
import { PromptInputFooterLeftSide } from './PromptInputFooterLeftSide.js';

export function PromptInputFooter(props: {
  showHelpHint: boolean;
}): React.ReactElement {
  return (
    <Box justifyContent="space-between">
      <PromptInputFooterLeftSide />
      <Text color="gray">{props.showHelpHint ? '? shortcuts' : 'replace footer examples'}</Text>
    </Box>
  );
}
