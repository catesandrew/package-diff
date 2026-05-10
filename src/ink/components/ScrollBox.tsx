import React from 'react';
import { Box } from 'ink';

export function ScrollBox(props: { children: React.ReactNode }): React.ReactElement {
  return <Box flexDirection="column">{props.children}</Box>;
}
