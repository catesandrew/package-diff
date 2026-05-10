export function getPackageListOffset(
  total: number,
  selectedIndex: number,
  viewportSize: number,
): number {
  const safeViewport = Math.max(viewportSize, 1)
  const maxStart = Math.max(0, total - safeViewport)
  const centered = selectedIndex - Math.floor(safeViewport / 2)
  return Math.max(0, Math.min(centered, maxStart))
}
