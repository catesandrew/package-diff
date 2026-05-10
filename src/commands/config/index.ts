import type { SlashCommandDefinition } from '../../types.js';

export const configCommand: SlashCommandDefinition = {
  id: 'config',
  summary: 'Open example settings.',
  async run({ updateStatus }) {
    updateStatus('Opened config');
    return 'Example config command: replace with your settings surface.';
  }
};
