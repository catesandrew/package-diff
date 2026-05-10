import test from 'node:test'
import assert from 'node:assert/strict'
import { getPackageListOffset } from '../src/packageDiff/tui/packageListRange.js'

test('getPackageListOffset centers the selected row when possible', () => {
  assert.equal(getPackageListOffset(100, 20, 10), 15)
})

test('getPackageListOffset clamps to the start and end bounds', () => {
  assert.equal(getPackageListOffset(5, 0, 10), 0)
  assert.equal(getPackageListOffset(20, 19, 10), 10)
})
