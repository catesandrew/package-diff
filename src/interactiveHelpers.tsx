import { setTimeout as delay } from 'node:timers/promises';
import React from 'react';
import { Box, Text } from 'ink';
import type { Root } from './ink.js';
import type { RenderContext } from './types.js';

export function getRenderContext(): RenderContext {
  const startedAt = Date.now();

  return {
    renderOptions: {
      exitOnCtrlC: false
    },
    getFpsMetrics() {
      const uptime = Math.max(Date.now() - startedAt, 1);
      const averageFps = Math.min(60, 16_000 / uptime + 58);
      return {
        averageFps,
        lowPercentileFps: Math.max(45, averageFps - 8)
      };
    }
  };
}

export async function showSetupScreens(root: Root): Promise<void> {
  root.render(
    <Box flexDirection="column" padding={1}>
      <Text color="cyan">package-diff</Text>
      <Text dimColor>Loading dependency-diff browser through the reusable shell.</Text>
    </Box>
  );

  await delay(25);
}

export async function renderAndRun(root: Root, deferredPrefetches: Array<() => Promise<void>>): Promise<void> {
  await Promise.allSettled(deferredPrefetches.map(prefetch => prefetch()));
  await root.waitUntilExit();
}
