import { FpsTracker, type FpsMetrics } from '../utils/fpsTracker.js'

export type RenderPane = 'list' | 'details' | 'chrome'

export interface MetricsSnapshot extends FpsMetrics {
  lastReason: string
  dirtyRegions: number
  selectionChanges: number
  releaseNotesLoads: number
  paneRenders: Record<RenderPane, number>
}

type Listener = () => void

interface MetricsStoreOptions {
  publishDelayMs?: number
  navigationIdleMs?: number
}

export class MetricsStore {
  private readonly fpsTracker = new FpsTracker()
  private readonly listeners = new Set<Listener>()
  private readonly publishDelayMs: number
  private readonly navigationIdleMs: number
  private publishTimer: ReturnType<typeof setTimeout> | null = null
  private navigationActiveUntil = 0
  private draft: MetricsSnapshot = {
    averageFps: 0,
    lowPercentileFps: 0,
    lastReason: 'idle',
    dirtyRegions: 0,
    selectionChanges: 0,
    releaseNotesLoads: 0,
    paneRenders: {
      list: 0,
      details: 0,
      chrome: 0,
    },
  }
  private snapshot: MetricsSnapshot = this.draft

  constructor(options: MetricsStoreOptions = {}) {
    this.publishDelayMs = options.publishDelayMs ?? 250
    this.navigationIdleMs = options.navigationIdleMs ?? 180
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot(): MetricsSnapshot {
    return this.snapshot
  }

  reportRender(pane: RenderPane, dirtyRegions: number, reason: string = pane): void {
    const fps = this.fpsTracker.recordFrame()
    this.draft = {
      ...this.draft,
      ...fps,
      lastReason: reason,
      dirtyRegions,
      paneRenders: {
        ...this.draft.paneRenders,
        [pane]: this.draft.paneRenders[pane] + 1,
      },
    }
    this.schedulePublish()
  }

  reportSelectionChange(): void {
    this.navigationActiveUntil = Date.now() + this.navigationIdleMs
    this.draft = {
      ...this.draft,
      lastReason: 'selection',
      dirtyRegions: 2,
      selectionChanges: this.draft.selectionChanges + 1,
    }
    this.schedulePublish()
  }

  reportReleaseNotesLoad(status: string): void {
    this.draft = {
      ...this.draft,
      lastReason: `release-notes:${status}`,
      releaseNotesLoads: this.draft.releaseNotesLoads + 1,
    }
    this.schedulePublish()
  }

  private schedulePublish(): void {
    const now = Date.now()
    const navigationDelay = Math.max(0, this.navigationActiveUntil - now)
    const delay = Math.max(this.publishDelayMs, navigationDelay)

    if (delay <= 0) {
      this.publishNow()
      return
    }
    if (this.publishTimer) {
      clearTimeout(this.publishTimer)
    }

    this.publishTimer = setTimeout(() => {
      this.publishTimer = null
      this.publishNow()
    }, delay)
  }

  private publishNow(): void {
    this.snapshot = this.draft
    for (const listener of this.listeners) {
      listener()
    }
  }
}
