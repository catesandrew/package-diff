export interface OptimizerStats {
  reusedNodes: number;
  dirtyRegions: number;
}

export function optimizeFrame(dirtyRegions: number): OptimizerStats {
  return {
    reusedNodes: Math.max(0, dirtyRegions - 1),
    dirtyRegions
  };
}
