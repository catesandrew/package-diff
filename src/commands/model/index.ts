import type { SlashCommandDefinition } from '../../types.js';

export const modelCommand: SlashCommandDefinition = {
  id: 'model',
  summary: 'Show example model controls.',
  async run({ updateStatus }) {
    updateStatus('Opened model picker');
    return 'Example model command: replace with your model/router selection logic.';
  }
};
