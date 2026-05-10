import type { SlashCommandDefinition } from '../../types.js';

export const statusCommand: SlashCommandDefinition = {
  id: 'status',
  summary: 'Show runtime status.',
  async run({ updateStatus }) {
    updateStatus('Status refreshed');
    return 'Example status command: replace with your runtime diagnostics.';
  }
};
