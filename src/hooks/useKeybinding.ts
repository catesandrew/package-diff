import { useMemo } from 'react';
import { defaultBindings } from '../keybindings/defaultBindings.js';
import type { KeybindingAction } from '../keybindings/defaultBindings.js';
import type { NormalizedInputEvent } from '../ink/events/input-event.js';

export function useKeybinding() {
  const bindings = useMemo(() => new Map(defaultBindings.map(binding => [binding.key, binding.action])), []);

  return (event: NormalizedInputEvent): KeybindingAction | undefined => bindings.get(event.key);
}
