import { useInput } from '../ink/hooks/use-input.js';

export function useScrollKeybindingHandler(handlers: {
  onScrollUp(): void;
  onScrollDown(): void;
}): void {
  useInput(event => {
    if (event.key === 'up') {
      handlers.onScrollUp();
    }
    if (event.key === 'down') {
      handlers.onScrollDown();
    }
  });
}
