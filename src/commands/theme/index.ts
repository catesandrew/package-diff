import type { SlashCommandDefinition } from '../../types.js';

export const themeCommand: SlashCommandDefinition = {
  id: 'theme',
  summary: 'Open example theme picker.',
  async run({ updateStatus }) {
    updateStatus('Opened theme picker');
    return 'Example theme command: replace with your theme system.';
  }
};
