import React from 'react';
import { Box } from 'ink';
import { useVirtualScroll } from '../hooks/useVirtualScroll.js';
import { Messages } from './Messages.js';
import type { MessageRecord } from '../types.js';

export function VirtualMessageList(props: {
  messages: MessageRecord[];
  offset: number;
  viewportSize?: number;
}): React.ReactElement {
  const viewportSize = props.viewportSize ?? 10;
  const range = useVirtualScroll(props.messages.length, props.offset, viewportSize);
  const visibleMessages = props.messages.slice(range.startIndex, range.endIndex);

  return (
    <Box flexDirection="column">
      <Messages messages={visibleMessages} />
    </Box>
  );
}
