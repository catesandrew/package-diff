import test from 'node:test';
import assert from 'node:assert/strict';
import { AppStateStore, createInitialAppState } from '../src/state/AppStateStore.js';

test('AppStateStore notifies subscribers on updates', () => {
  const store = new AppStateStore(createInitialAppState('/tmp/example'));
  let notifications = 0;

  const unsubscribe = store.subscribe(() => {
    notifications += 1;
  });

  store.setState({ statusLine: 'Updated' });
  unsubscribe();

  assert.equal(store.getState().statusLine, 'Updated');
  assert.equal(notifications, 1);
});
