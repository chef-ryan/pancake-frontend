import { Address } from '@ton/core'
import { PRESET_POOLS } from 'config/presetPools'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'
import { chainIdAtom } from '../chainIdAtom'

interface PoolAddressAtomParams {
  token0Address?: string
  token1Address?: string
}

const poolAddressCache = new Map<string, Address>()

export const poolAddressAtom = atomFamily(({ token0Address, token1Address }: PoolAddressAtomParams) => {
  return atom(async (get) => {
    if (!token0Address || !token1Address) return null

    const cacheKey = `${token0Address}-${token1Address}`
    if (poolAddressCache.has(cacheKey)) {
      return poolAddressCache.get(cacheKey)
    }

    const key = `${token0Address}<>${token1Address}`
    const keyInverted = `${token1Address}<>${token0Address}`
    if (PRESET_POOLS[key]) return parseAddress(PRESET_POOLS[key])
    if (PRESET_POOLS[keyInverted]) return parseAddress(PRESET_POOLS[keyInverted])

    const result = await fetch(
      `/api/poolAddress?token0=${token0Address}&token1=${token1Address}&chainId=${get(chainIdAtom)}`,
    )
    if (result.ok) {
      const { data } = await result.json()
      const poolAddress = parseAddress(data)
      poolAddressCache.set(cacheKey, poolAddress)

      return poolAddress
    }

    return null
  })
}, isEqual)
