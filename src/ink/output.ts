export interface OutputFrame {
  fullRedraw: boolean;
  dirtyRegions: number;
}

export function planOutputFrame(dirtyRegions: number): OutputFrame {
  return {
    fullRedraw: dirtyRegions > 10,
    dirtyRegions
  };
}
