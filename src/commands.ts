import { helpCommand } from './commands/help/index.js';
import { configCommand } from './commands/config/index.js';
import { modelCommand } from './commands/model/index.js';
import { statusCommand } from './commands/status/index.js';
import { themeCommand } from './commands/theme/index.js';
import { vimCommand } from './commands/vim/index.js';
import { permissionsCommand } from './commands/permissions/index.js';
import { planCommand } from './commands/plan/index.js';
import { sessionCommand } from './commands/session/index.js';
import { resumeCommand } from './commands/resume/index.js';
import { keybindingsCommand } from './commands/keybindings/index.js';
import type { SlashCommandDefinition } from './types.js';

export function getCommands(): SlashCommandDefinition[] {
  return [
    helpCommand,
    configCommand,
    modelCommand,
    statusCommand,
    themeCommand,
    vimCommand,
    permissionsCommand,
    planCommand,
    sessionCommand,
    resumeCommand,
    keybindingsCommand
  ];
}
