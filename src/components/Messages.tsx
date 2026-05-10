import React from 'react';
import { Box, Text } from 'ink';
import type { MessageRecord } from '../types.js';

function roleColor(role: MessageRecord['role']): string {
  switch (role) {
    case 'assistant':
      return 'cyan';
    case 'user':
      return 'green';
    case 'tool':
      return 'yellow';
    default:
      return 'gray';
  }
}

export function Messages(props: {
  messages: MessageRecord[];
}): React.ReactElement {
  return (
    <Box flexDirection="column">
      {props.messages.map(message => (
        <Box key={message.id} flexDirection="column" marginBottom={1}>
          <Text color={roleColor(message.role)}>{message.role}</Text>
          <Text>{message.content}</Text>
        </Box>
      ))}
    </Box>
  );
}
