import LRU from 'lru-cache'
import { PublicClient } from 'viem'
import { getCalcContract } from './contract'
import { Gauge, GaugeInfoConfig } from './types'

const cache = new LRU<string, Promise<any>>({
  max: 10,
  ttl: 1000,
})

export const fetchAllGaugesVoting = async (
  client: PublicClient,
  gaugeInfos: GaugeInfoConfig[],
  inCap: boolean = true,
  options?: {
    blockNumber?: bigint
  },
): Promise<Gauge[]> => {
  const contract = getCalcContract(client)

  const cacheKey = `${inCap}-${options?.blockNumber}`
  const cached = cache.get(cacheKey)
  let weightsPromise = cached.get(cacheKey)
  if (!weightsPromise) {
    weightsPromise = contract.read.massGetGaugeWeight([inCap], options)
    cache.set(cacheKey, weightsPromise)
  }

  const weights = await weightsPromise

  return gaugeInfos.map((gauge) => ({
    ...gauge,
    weight: weights[gauge.gid] ?? 0n,
  }))
}
