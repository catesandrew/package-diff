import type {
  ChatMode,
  ExampleRemoteState,
  ExampleSuggestion,
  ExampleTask,
  MessageRecord
} from '../types.js';

export interface AppState {
  cwd: string;
  mode: ChatMode;
  messages: MessageRecord[];
  statusLine: string;
  promptValue: string;
  tasks: ExampleTask[];
  remote: ExampleRemoteState;
  suggestions: ExampleSuggestion[];
  transcriptOpen: boolean;
  helpOpen: boolean;
}

type Listener = () => void;

export class AppStateStore {
  private state: AppState;
  private listeners = new Set<Listener>();

  constructor(initial: AppState) {
    this.state = initial;
  }

  getState(): AppState {
    return this.state;
  }

  setState(update: Partial<AppState> | ((current: AppState) => AppState)): void {
    this.state = typeof update === 'function' ? update(this.state) : { ...this.state, ...update };
    for (const listener of this.listeners) {
      listener();
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export function createInitialAppState(cwd: string): AppState {
  return {
    cwd,
    mode: 'chat',
    messages: [
      {
        id: 'system-welcome',
        role: 'system',
        content: 'This is a reusable TUI shell. Replace the examples, keep the seams.',
        createdAt: new Date().toISOString()
      }
    ],
    statusLine: 'Ready',
    promptValue: '',
    tasks: [
      { id: 'example-task-1', title: 'Replace example commands', status: 'idle' },
      { id: 'example-task-2', title: 'Replace example tools', status: 'idle' }
    ],
    remote: { enabled: false },
    suggestions: [
      { id: 'help', label: '/help' },
      { id: 'config', label: '/config' },
      { id: 'plan', label: '/plan' }
    ],
    transcriptOpen: true,
    helpOpen: false
  };
}
