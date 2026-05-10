import { Command } from 'commander';
import type { LaunchMode } from '../types.js';

export interface CliOptions {
  mode: LaunchMode;
  prompt: string;
  theme: 'amber' | 'cyan';
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('tui-shell')
    .description('Reusable CLI/TUI shell with example architecture seams')
    .option('-p, --print', 'run headless/print mode')
    .option('--prompt <text>', 'seed prompt', 'teach me how to replace this shell')
    .option('--theme <theme>', 'example theme token', 'cyan');

  return program;
}

export function parseCli(argv: string[]): CliOptions {
  const program = buildProgram();
  program.parse(argv);
  const options = program.opts<{
    print?: boolean;
    prompt: string;
    theme: 'amber' | 'cyan';
  }>();

  return {
    mode: options.print ? 'print' : 'interactive',
    prompt: options.prompt,
    theme: options.theme ?? 'cyan'
  };
}
