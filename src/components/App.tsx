import React, { createContext, useContext, useRef, useSyncExternalStore } from 'react';
import { Box } from 'ink';
import { AppStateProvider } from '../state/AppState.js';
import { MetricsStore, type MetricsSnapshot } from './metricsStore.js';

const MetricsContext = createContext<MetricsStore | null>(null);

export function useMetricsStore(): MetricsStore {
  const store = useContext(MetricsContext);
  if (!store) {
    throw new Error('useMetricsStore must be used within App');
  }
  return store;
}

export function useMetricsSnapshot(): MetricsSnapshot {
  const store = useMetricsStore();
  return useSyncExternalStore(store.subscribe.bind(store), () => store.getSnapshot());
}

export function App(props: {
  initialCwd: string;
  startupNotes: string[];
  theme: 'amber' | 'cyan';
  children: React.ReactNode;
}): React.ReactElement {
  const storeRef = useRef<MetricsStore>();
  if (!storeRef.current) {
    storeRef.current = new MetricsStore();
  }

  return (
    <MetricsContext.Provider value={storeRef.current}>
      <AppStateProvider cwd={props.initialCwd}>
        <Box flexDirection="column">{props.children}</Box>
      </AppStateProvider>
    </MetricsContext.Provider>
  );
}
