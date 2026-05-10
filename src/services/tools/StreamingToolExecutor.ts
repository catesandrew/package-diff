import type { ToolDefinition } from '../../types.js';

export interface StreamingToolEvent {
  toolId: string;
  result: string;
}

export class StreamingToolExecutor {
  async *run(tools: ToolDefinition[], input: string): AsyncGenerator<StreamingToolEvent> {
    for (const tool of tools) {
      const result = await tool.run(input);
      yield { toolId: tool.id, result };
    }
  }
}
