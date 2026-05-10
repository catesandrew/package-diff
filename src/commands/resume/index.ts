import type { SlashCommandDefinition } from '../../types.js';

export const resumeCommand: SlashCommandDefinition = {
  id: 'resume',
  summary: 'Resume an example conversation.',
  async run({ updateStatus }) {
    updateStatus('Opened resume picker');
    return 'Example resume command: replace with your session restore flow.';
  }
};
