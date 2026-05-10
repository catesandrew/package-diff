import { useInput as useInkInput } from 'ink';
import { normalizeInputEvent, type NormalizedInputEvent } from '../events/input-event.js';

export function useInput(handler: (event: NormalizedInputEvent) => void): void {
  useInkInput((input, key) => {
    handler(normalizeInputEvent(input, key));
  });
}
