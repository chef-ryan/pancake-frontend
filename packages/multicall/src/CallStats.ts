import { keccak256 } from 'viem'
import { MulticallRequestWithGas } from './types'

const hash = (call: MulticallRequestWithGas) => {
  const { target, callData } = call
  const hash = keccak256(`0x${target}${callData}`)
  return hash
}

interface CallStats {
  [target: string]: {
    total: number
    uniq: number
    calls: Set<string> // hash
  }
}

const stats: CallStats = {}
export const updateStats = (calls: MulticallRequestWithGas[]) => {
  for (const call of calls) {
    const { target } = call
    if (!stats[target]) {
      stats[target] = {
        total: 0,
        uniq: 0,
        calls: new Set(),
      }
    }
    stats[target].total += 1
    const hashValue = hash(call)
    if (!stats[target].calls.has(hashValue)) {
      stats[target].uniq += 1
      stats[target].calls.add(hashValue)
    }
  }
}
