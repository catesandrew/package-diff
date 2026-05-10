export type KeybindingAction =
  | 'submit'
  | 'interrupt'
  | 'exit'
  | 'redraw'
  | 'toggle-transcript'
  | 'toggle-help'
  | 'cycle-mode'
  | 'open-model'
  | 'open-config'
  | 'scroll-up'
  | 'scroll-down';

export interface Keybinding {
  key: string;
  action: KeybindingAction;
  label: string;
}

export const defaultBindings: Keybinding[] = [
  { key: 'return', action: 'submit', label: 'Submit prompt' },
  { key: 'ctrl+c', action: 'interrupt', label: 'Interrupt current work' },
  { key: 'ctrl+d', action: 'exit', label: 'Exit shell' },
  { key: 'ctrl+l', action: 'redraw', label: 'Redraw UI' },
  { key: 'ctrl+o', action: 'toggle-transcript', label: 'Toggle transcript' },
  { key: 'ctrl+t', action: 'toggle-help', label: 'Toggle help/tasks' },
  { key: 'shift+tab', action: 'cycle-mode', label: 'Cycle mode' },
  { key: 'meta+p', action: 'open-model', label: 'Open model picker example' },
  { key: 'meta+,', action: 'open-config', label: 'Open config example' },
  { key: 'up', action: 'scroll-up', label: 'Scroll transcript up' },
  { key: 'down', action: 'scroll-down', label: 'Scroll transcript down' }
];
