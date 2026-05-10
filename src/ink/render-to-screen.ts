import { optimizeFrame } from './optimizer.js';
import { planOutputFrame } from './output.js';

export function renderToScreen(dirtyRegions: number): {
  dirtyRegions: number;
  fullRedraw: boolean;
  reusedNodes: number;
} {
  const frame = planOutputFrame(dirtyRegions);
  const optimized = optimizeFrame(dirtyRegions);

  return {
    dirtyRegions: frame.dirtyRegions,
    fullRedraw: frame.fullRedraw,
    reusedNodes: optimized.reusedNodes
  };
}
