export function computeScrollFastPath(delta: number): 'blit' | 'rerender' {
  return Math.abs(delta) <= 3 ? 'blit' : 'rerender';
}
