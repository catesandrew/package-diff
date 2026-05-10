import process from 'node:process';

export function getSystemContext(): string {
  return `system cwd=${process.cwd()} platform=${process.platform}`;
}

export function getUserContext(): string {
  return 'example user context for the reusable TUI shell';
}

export function getOriginalCwd(): string {
  return process.cwd();
}
