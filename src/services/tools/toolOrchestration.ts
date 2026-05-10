import type { ToolDefinition } from '../../types.js';

export async function runToolsWithPolicy(tools: ToolDefinition[], input: string): Promise<string[]> {
  const safe = tools.filter(tool => tool.concurrencySafe);
  const mutating = tools.filter(tool => !tool.concurrencySafe);

  const safeResults = await Promise.all(safe.map(tool => tool.run(input)));
  const mutatingResults: string[] = [];

  for (const tool of mutating) {
    mutatingResults.push(await tool.run(input));
  }

  return [...safeResults, ...mutatingResults];
}
