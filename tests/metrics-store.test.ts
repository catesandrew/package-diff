import test from 'node:test'
import assert from 'node:assert/strict'
import { MetricsStore } from '../src/components/metricsStore.js'

test('MetricsStore records pane renders, selection changes, and last dirty-region reason', () => {
  const store = new MetricsStore({ publishDelayMs: 0, navigationIdleMs: 0 })

  store.reportRender('list', 1, 'list')
  store.reportSelectionChange()
  store.reportRender('details', 2, 'selection')
  store.reportReleaseNotesLoad('loading')

  const snapshot = store.getSnapshot()

  assert.equal(snapshot.paneRenders.list, 1)
  assert.equal(snapshot.paneRenders.details, 1)
  assert.equal(snapshot.selectionChanges, 1)
  assert.equal(snapshot.releaseNotesLoads, 1)
  assert.equal(snapshot.lastReason, 'release-notes:loading')
  assert.equal(snapshot.dirtyRegions, 2)
})

test('MetricsStore batches notifications until the publish cadence flushes', async () => {
  const store = new MetricsStore({ publishDelayMs: 25, navigationIdleMs: 60 })
  let notifications = 0

  const unsubscribe = store.subscribe(() => {
    notifications += 1
  })

  store.reportSelectionChange()
  store.reportRender('list', 1, 'list')
  assert.equal(notifications, 0)

  await new Promise((resolve) => setTimeout(resolve, 35))
  assert.equal(notifications, 0)

  await new Promise((resolve) => setTimeout(resolve, 50))
  unsubscribe()

  assert.equal(notifications, 1)
})
