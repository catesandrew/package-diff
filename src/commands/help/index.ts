import type { SlashCommandDefinition } from '../../types.js';

export const helpCommand: SlashCommandDefinition = {
  id: 'help',
  summary: 'Show replacement-oriented help.',
  async run({ updateStatus }) {
    updateStatus('Opened help');
    return 'Example help command: replace this with product-specific help tabs.';
  }
};
