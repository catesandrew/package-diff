import React from 'react';
import { Box, Text } from 'ink';

export function PromptInputHelpMenu(): React.ReactElement {
  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text color="cyan">Example interaction grammar</Text>
      <Text>! bash mode</Text>
      <Text>/ slash commands</Text>
      <Text>@ file references</Text>
      <Text>& background work</Text>
      <Text>/btw side question</Text>
    </Box>
  );
}
