export interface FpsMetrics {
  averageFps: number
  lowPercentileFps: number
}

const WINDOW_MS = 1000

export class FpsTracker {
  private frameTimes: number[] = []

  recordFrame(now = Date.now()): FpsMetrics {
    this.frameTimes.push(now)
    this.frameTimes = this.frameTimes.filter((timestamp) => now - timestamp <= WINDOW_MS)
    return this.getMetrics()
  }

  getMetrics(): FpsMetrics {
    if (this.frameTimes.length < 2) {
      return {
        averageFps: 0,
        lowPercentileFps: 0,
      }
    }

    const first = this.frameTimes[0] ?? 0
    const last = this.frameTimes[this.frameTimes.length - 1] ?? first
    const elapsedMs = Math.max(last - first, 1)
    const averageFps = ((this.frameTimes.length - 1) * 1000) / elapsedMs

    const fpsSamples: number[] = []
    for (let index = 1; index < this.frameTimes.length; index += 1) {
      const previous = this.frameTimes[index - 1]
      const current = this.frameTimes[index]
      if (previous === undefined || current === undefined) {
        continue
      }
      const delta = Math.max(current - previous, 1)
      fpsSamples.push(1000 / delta)
    }

    const sorted = [...fpsSamples].sort((left, right) => left - right)
    const percentileIndex = Math.max(0, Math.floor(sorted.length * 0.1) - 1)
    const lowPercentileFps = sorted[percentileIndex] ?? averageFps

    return {
      averageFps,
      lowPercentileFps,
    }
  }
}
