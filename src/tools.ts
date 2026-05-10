import type { ToolDefinition } from './types.js';

const echoTool: ToolDefinition = {
  id: 'echo-example',
  description: 'Example tool that mirrors input for replacement demos.',
  concurrencySafe: true,
  async run(input: string) {
    return `echo-example: ${input}`;
  }
};

const filesTool: ToolDefinition = {
  id: 'files-example',
  description: 'Example tool that demonstrates deterministic, replaceable tool output.',
  concurrencySafe: true,
  async run() {
    return 'files-example: replace this with your own filesystem-aware toolset';
  }
};

const mutationTool: ToolDefinition = {
  id: 'mutation-example',
  description: 'Example mutating tool to demonstrate serialized execution.',
  concurrencySafe: false,
  async run(input: string) {
    return `mutation-example completed: ${input}`;
  }
};

export function getAllBaseTools(): ToolDefinition[] {
  return [echoTool, filesTool, mutationTool];
}

export function assembleToolPool(): ToolDefinition[] {
  return getAllBaseTools();
}
