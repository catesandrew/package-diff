import type { SlashCommandDefinition } from '../../types.js';

export const vimCommand: SlashCommandDefinition = {
  id: 'vim',
  summary: 'Toggle example editor mode.',
  async run({ updateStatus }) {
    updateStatus('Toggled vim example');
    return 'Example vim command: replace with your editor-mode integration.';
  }
};
