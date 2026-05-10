export interface NormalizedInputEvent {
  key: string;
  input: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export function normalizeInputEvent(input: string, key: {
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  return?: boolean;
  tab?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
}): NormalizedInputEvent {
  let resolved = input;

  if (key.return) {
    resolved = 'return';
  } else if (key.tab && key.shift) {
    resolved = 'shift+tab';
  } else if (key.upArrow) {
    resolved = 'up';
  } else if (key.downArrow) {
    resolved = 'down';
  }

  if (key.ctrl && input) {
    resolved = `ctrl+${input}`;
  }

  if (key.meta && input) {
    resolved = `meta+${input}`;
  }

  return {
    key: resolved,
    input,
    ctrl: Boolean(key.ctrl),
    meta: Boolean(key.meta),
    shift: Boolean(key.shift)
  };
}
