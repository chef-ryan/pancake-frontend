import { Address } from '@ton/core'
import { PRESET_POOLS } from 'config/presetPools'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'
import { parseAddress } from 'ton/utils/address'
import { jettonMasterContractAtom } from '../contracts/jettonMasterContractAtom'

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

    const router = get(routerContractAtom)
    const jettonMaster0 = get(jettonMasterContractAtom(token0Address))
    const jettonMaster1 = get(jettonMasterContractAtom(token1Address))

    const [jettonWalletAddress0, jettonWalletAddress1] = await Promise.all([
      jettonMaster0.getGetWalletAddress(parseAddress(router.address.toString())),
      jettonMaster1.getGetWalletAddress(parseAddress(router.address.toString())),
    ])

    const poolAddress = await router.getGetPoolAddress(jettonWalletAddress0, jettonWalletAddress1)
    poolAddressCache.set(cacheKey, poolAddress)
    return poolAddress
  })
}, isEqual)
