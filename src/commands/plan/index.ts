import type { SlashCommandDefinition } from '../../types.js';

export const planCommand: SlashCommandDefinition = {
  id: 'plan',
  summary: 'Open example plan mode.',
  async run({ updateStatus }) {
    updateStatus('Opened planning example');
    return 'Example plan command: replace with your planning workflow.';
  }
};
