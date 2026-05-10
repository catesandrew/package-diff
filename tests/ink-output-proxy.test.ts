import test from 'node:test'
import assert from 'node:assert/strict'
import { createInkOutputProxy } from '../src/ink/outputProxy.js'

test('createInkOutputProxy inflates rows for Ink while preserving writes', () => {
  const writes: string[] = []
  const proxy = createInkOutputProxy({
    columns: 80,
    rows: 24,
    write(chunk: string) {
      writes.push(chunk)
      return true
    },
    on() {
      return this
    },
    off() {
      return this
    },
  })

  assert.equal(proxy.columns, 80)
  assert.ok(proxy.rows > 24)
  proxy.write('hello')
  assert.equal(writes[0], 'hello')
})

test('createInkOutputProxy rewrites erase-and-repaint frames into incremental line updates', () => {
  const writes: string[] = []
  const proxy = createInkOutputProxy({
    columns: 80,
    rows: 24,
    write(chunk: string) {
      writes.push(chunk)
      return true
    },
    on() {
      return this
    },
    off() {
      return this
    },
  } as never)

  proxy.write('line one\nline two\n')
  proxy.write('\u001B[2K\u001B[1A\u001B[2K\u001B[Gline one\nline two updated\n')

  const incremental = writes.at(-1) ?? ''
  assert.match(incremental, /updated/)
  assert.doesNotMatch(incremental, /\u001B\[2J/)
  assert.doesNotMatch(incremental, /line one\nline two updated\n/)
})

test('createInkOutputProxy patches only the changed span within a line', () => {
  const writes: string[] = []
  const proxy = createInkOutputProxy({
    columns: 80,
    rows: 24,
    write(chunk: string) {
      writes.push(chunk)
      return true
    },
    on() {
      return this
    },
    off() {
      return this
    },
  } as never)

  proxy.write('prefix old suffix\n')
  proxy.write('\u001B[2K\u001B[1A\u001B[2K\u001B[Gprefix new suffix\n')

  const incremental = writes.at(-1) ?? ''
  assert.match(incremental, /\u001B\[7C/)
  assert.match(incremental, /new suffix/)
  assert.doesNotMatch(incremental, /prefix new suffix\n/)
})
