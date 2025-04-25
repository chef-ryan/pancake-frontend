import { MulticallRequestWithGas } from '@pancakeswap/multicall'
import { keccak256 } from 'viem'

interface TimedCall {
  timestamp: number
  hash: string
}

interface SlidingCallStats {
  // Holds raw events so we can slide the window
  events: TimedCall[]
  // Computed metrics
  total: number
  uniq: number
}

const stats: Record<string, SlidingCallStats> = {}

const start = Date.now()
/**
 * Update the sliding‐window stats.
 * @param calls  Array of new calls to record
 * @param windowMs  How far back (in ms) to keep data (e.g. 1000 or 5000)
 */
export function updateStats(
  calls: MulticallRequestWithGas[],
  windowMs = 5000, // default to 5s
) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  const now = Date.now()

  // 1) Record each incoming call with a timestamp+hash
  for (const call of calls) {
    const { target } = call
    const h = keccak256(`0x${target}${call.callData}`)

    if (!stats[target]) {
      stats[target] = { events: [], total: 0, uniq: 0 }
    }
    stats[target].events.push({ timestamp: now, hash: h })
  }

  const cutoff = now - windowMs

  // 2) For each target, purge old events and recompute metrics
  for (const [target, stat] of Object.entries(stats)) {
    // Keep only events within [now - windowMs, now]
    stat.events = stat.events.filter((e) => e.timestamp >= cutoff)

    // Recompute total / uniq
    stat.total = stat.events.length
    const uniqHashes = new Set(stat.events.map((e) => e.hash))
    stat.uniq = uniqHashes.size
  }

  const elapsed = Math.floor((Date.now() - start) / 1000)
  if (elapsed % 5 === 0) {
    console.log('Sliding call stats:', stats)
  }
}
