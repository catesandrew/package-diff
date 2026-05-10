import React from 'react';
import { Box, Text } from 'ink';

export function Onboarding(): React.ReactElement {
  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text color="cyan">Welcome to package-diff</Text>
      <Text>Browse dependency changes and release notes with the new shell spine.</Text>
      <Text>Keep the architecture seams, replace product-specific UX as needed.</Text>
    </Box>
  );
}
