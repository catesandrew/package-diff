import test from 'node:test'
import assert from 'node:assert/strict'
import { FpsTracker } from '../src/utils/fpsTracker.js'

test('FpsTracker computes average and low-percentile fps from recent frames', () => {
  const tracker = new FpsTracker()

  tracker.recordFrame(0)
  tracker.recordFrame(16)
  tracker.recordFrame(32)
  tracker.recordFrame(48)

  const metrics = tracker.getMetrics()

  assert.ok(metrics.averageFps > 50)
  assert.ok(metrics.averageFps < 70)
  assert.ok(metrics.lowPercentileFps > 50)
})
