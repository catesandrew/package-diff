import { useEffect, useState } from 'react'

export interface TerminalSize {
  columns: number
  rows: number
}

export function useTerminalSize(): TerminalSize {
  const [size, setSize] = useState<TerminalSize>({
    columns: process.stdout.columns ?? 120,
    rows: process.stdout.rows ?? 32,
  })

  useEffect(() => {
    function updateSize() {
      setSize({
        columns: process.stdout.columns ?? 120,
        rows: process.stdout.rows ?? 32,
      })
    }

    process.stdout.on('resize', updateSize)
    return () => {
      process.stdout.off('resize', updateSize)
    }
  }, [])

  return size
}
