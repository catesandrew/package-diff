export type LaunchMode = 'interactive' | 'print';

export type ChatMode = 'chat' | 'bash' | 'command';

export type QueryRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageRecord {
  id: string;
  role: QueryRole;
  content: string;
  createdAt: string;
  pending?: boolean;
}

export interface ExampleTask {
  id: string;
  title: string;
  status: 'idle' | 'running' | 'completed';
}

export interface ExampleRemoteState {
  enabled: boolean;
  label?: string;
}

export interface ExampleSuggestion {
  id: string;
  label: string;
}

export interface ToolDefinition {
  id: string;
  description: string;
  concurrencySafe: boolean;
  run(input: string): Promise<string>;
}

export interface SlashCommandDefinition {
  id: string;
  summary: string;
  run(args: {
    prompt: string;
    updateStatus: (status: string) => void;
  }): Promise<string>;
}

export interface QueryContext {
  mode: ChatMode;
  prompt: string;
  commands: SlashCommandDefinition[];
  tools: ToolDefinition[];
}

export type QueryEvent =
  | { type: 'status'; value: string }
  | { type: 'assistant-delta'; value: string }
  | { type: 'assistant-complete'; value: string }
  | { type: 'tool-call'; toolId: string; value: string }
  | { type: 'tool-result'; toolId: string; value: string };

export interface InitArtifacts {
  cwd: string;
  startupNotes: string[];
  deferredPrefetches: Array<() => Promise<void>>;
}

export interface RenderContext {
  renderOptions: {
    exitOnCtrlC: boolean;
  };
  getFpsMetrics: () => { averageFps: number; lowPercentileFps: number };
}
