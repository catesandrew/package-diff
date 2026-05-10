import { setTimeout as delay } from 'node:timers/promises';
import process from 'node:process';
import type { CliOptions } from './cli.js';
import type { InitArtifacts } from '../types.js';

async function warmSettings(): Promise<string> {
  await delay(5);
  return 'settings warmed';
}

async function warmNetwork(): Promise<string> {
  await delay(5);
  return 'network preconnect simulated';
}

async function warmWorkspace(): Promise<string> {
  await delay(5);
  return 'workspace scan simulated';
}

export async function initializeEntrypoint(_options: CliOptions): Promise<InitArtifacts> {
  const startupNotes = await Promise.all([
    warmSettings(),
    warmNetwork(),
    warmWorkspace()
  ]);

  return {
    cwd: process.cwd(),
    startupNotes,
    deferredPrefetches: [
      async () => {
        await delay(1);
      }
    ]
  };
}
