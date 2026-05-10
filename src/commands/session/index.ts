import type { SlashCommandDefinition } from '../../types.js';

export const sessionCommand: SlashCommandDefinition = {
  id: 'session',
  summary: 'Show example session handoff.',
  async run({ updateStatus }) {
    updateStatus('Opened session example');
    return 'Example session command: replace with your QR/browser or remote handoff.';
  }
};
