import process from 'node:process'

const EXTRA_ROWS = 100
const ESC = '\u001B'
const ERASE_LINE = `${ESC}[2K`
const ERASE_END_LINE = `${ESC}[K`
const CURSOR_LEFT = `${ESC}[G`

function cursorUp(count: number): string {
  return count > 0 ? `${ESC}[${count}A` : ''
}

function cursorDown(count: number): string {
  return count > 0 ? `${ESC}[${count}B` : ''
}

function cursorRight(count: number): string {
  return count > 0 ? `${ESC}[${count}C` : ''
}

function splitFrame(frame: string): string[] {
  const lines = frame.split('\n')
  if (lines.at(-1) === '') {
    lines.pop()
  }
  return lines
}

function stripLogUpdatePrefix(chunk: string): string | null {
  let index = 0

  while (chunk.startsWith(ERASE_LINE, index)) {
    index += ERASE_LINE.length

    if (chunk.startsWith(`${ESC}[1A`, index)) {
      index += `${ESC}[1A`.length
      continue
    }

    if (chunk.startsWith(CURSOR_LEFT, index)) {
      index += CURSOR_LEFT.length
      return chunk.slice(index)
    }
  }

  return null
}

function buildIncrementalPatch(previous: string[], next: string[]): string {
  let patch = ''
  let cursorLine = previous.length
  const totalLines = Math.max(previous.length, next.length)

  for (let lineIndex = 0; lineIndex < totalLines; lineIndex += 1) {
    const before = previous[lineIndex] ?? ''
    const after = next[lineIndex] ?? ''

    if (before === after) {
      continue
    }

    const relativeMove = cursorLine - lineIndex
    if (relativeMove > 0) {
      patch += cursorUp(relativeMove)
    } else if (relativeMove < 0) {
      patch += cursorDown(relativeMove * -1)
    }

    patch += buildLinePatch(before, after)
    cursorLine = lineIndex
  }

  const finalMove = next.length - cursorLine
  if (finalMove > 0) {
    patch += cursorDown(finalMove)
  } else if (finalMove < 0) {
    patch += cursorUp(finalMove * -1)
  }

  patch += CURSOR_LEFT
  return patch
}

function buildLinePatch(before: string, after: string): string {
  if (before === after) {
    return ''
  }

  let prefix = 0
  const maxPrefix = Math.min(before.length, after.length)
  while (prefix < maxPrefix && before[prefix] === after[prefix]) {
    prefix += 1
  }

  let suffix = 0
  const maxSuffix = Math.min(before.length - prefix, after.length - prefix)
  while (
    suffix < maxSuffix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1
  }

  if (prefix === 0) {
    return `${CURSOR_LEFT}${ERASE_LINE}${after}`
  }

  const changedEnd = after.length - suffix
  const changedSlice = after.slice(prefix, changedEnd)
  const trailingSlice = after.slice(changedEnd)

  return `${CURSOR_LEFT}${cursorRight(prefix)}${ERASE_END_LINE}${changedSlice}${trailingSlice}`
}

export function createInkOutputProxy(
  stdout: NodeJS.WriteStream = process.stdout,
): NodeJS.WriteStream {
  const proxy = Object.create(stdout) as NodeJS.WriteStream
  let previousFrameLines: string[] = []

  Object.defineProperty(proxy, 'rows', {
    get() {
      return (stdout.rows ?? 24) + EXTRA_ROWS
    },
  })

  Object.defineProperty(proxy, 'columns', {
    get() {
      return stdout.columns
    },
  })

  proxy.write = ((chunk: string | Uint8Array) => {
    const text = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8')
    const frame = stripLogUpdatePrefix(text)

    if (frame === null) {
      const lines = splitFrame(text)
      if (lines.length > 0) {
        previousFrameLines = lines
      }
      return stdout.write(chunk)
    }

    const nextFrameLines = splitFrame(frame)

    if (previousFrameLines.length === 0) {
      previousFrameLines = nextFrameLines
      return stdout.write(frame)
    }

    const patch = buildIncrementalPatch(previousFrameLines, nextFrameLines)
    previousFrameLines = nextFrameLines
    return stdout.write(patch)
  }) as NodeJS.WriteStream['write']

  return proxy
}
