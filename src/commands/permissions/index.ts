import type { SlashCommandDefinition } from '../../types.js';

export const permissionsCommand: SlashCommandDefinition = {
  id: 'permissions',
  summary: 'Open example permissions UI.',
  async run({ updateStatus }) {
    updateStatus('Opened permissions');
    return 'Example permissions command: replace with your approval system.';
  }
};
