import type { SlashCommandDefinition } from '../../types.js';

export const keybindingsCommand: SlashCommandDefinition = {
  id: 'keybindings',
  summary: 'Open example keybindings customization.',
  async run({ updateStatus }) {
    updateStatus('Opened keybindings');
    return 'Example keybindings command: replace with your user-overrides editor.';
  }
};
