import { ChainId } from '@pancakeswap/chains'
import { BinPoolManagerAbi, CLPoolManagerAbi } from '@pancakeswap/infinity-sdk'
import { InfinityBinPool, InfinityClPool } from '@pancakeswap/smart-router'
import { memoizeAsync } from '@pancakeswap/utils/memoize'
import BigNumber from 'bignumber.js'
import { fetchAllCampaignsByChainId } from 'hooks/infinity/useCampaigns'
import { getInfinityCakeAPR } from 'hooks/infinity/useInfinityCakeAPR'
import { getCakePriceFromOracle } from 'hooks/useCakePrice'
import groupBy from 'lodash/groupBy'
import { CakeAprValue } from 'state/farmsV4/atom'
import { getAllNetworkMerklApr, getCakeApr, getLpApr } from 'state/farmsV4/state/poolApr/fetcher'
import { PoolInfo } from 'state/farmsV4/state/type'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { isInfinityProtocol } from 'utils/protocols'
import { ContractFunctionReturnType } from 'viem'
import { Address } from 'viem/accounts'
import { createBatchProcessor, multicallBatcher } from './batchProcessor'
import { FarmInfo, isValidPoolKeyResult, parsePoolKeyResult, parseSlot0 } from './farm.util'

const fetchAllCampaigns = memoizeAsync(
  (chains: ChainId[]) => {
    return Promise.all(
      chains.map((chainId) => {
        return fetchAllCampaignsByChainId({
          chainId: Number(chainId),
        })
      }),
    )
  },
  {
    resolver: (chains) => {
      return chains.sort().join(',')
    },
  },
)

const getCakePrice = memoizeAsync(async () => {
  return BigNumber(await getCakePriceFromOracle())
})

async function batchFillInfinityCakeApr(pools: PoolInfo[]) {
  const chains = Array.from(new Set(pools.map((pool) => Number(pool.farm!.chainId))))
  const [allCampaigns, cakePrice] = await Promise.all([fetchAllCampaigns(chains), , getCakePrice()])
  for (const pool of pools) {
    const farm = pool.farm!
    const chainId = Number(farm.chainId)
    const campaigns = allCampaigns[chainId]
    const cakeApr = getInfinityCakeAPR({
      chainId: Number(farm.chainId),
      poolId: farm.id,
      cakePrice,
      campaigns,
      tvlUSD: `${farm.tvlUSD}`,
    })
    farm.cakeApr = cakeApr
  }
  return pools
}

async function batchFillCakeApr(pools: PoolInfo[]) {
  const cakePrice = await getCakePrice()
  const aprs = await Promise.all(
    pools.map(async (pool) => {
      return getCakeApr(pool!, cakePrice)
    }),
  )
  return pools.map((pool, index) => {
    const farm = pool.farm!
    const key = `${farm.chainId}:${farm.id}`
    const result = aprs[index]
    const apr = result[key] as CakeAprValue
    farm.cakeApr = apr
    return pool
  })
}

export const fillCakeApr = createBatchProcessor<PoolInfo, PoolInfo>({
  groupBy: (pools: PoolInfo[]) => {
    return groupBy(pools, (pool) => (isInfinityProtocol(pool.farm!.protocol) ? 'infinity' : 'other'))
  },
  groups: {
    infinity: batchFillInfinityCakeApr,
    other: batchFillCakeApr,
  },
})

export async function fillLpAprData(pools: PoolInfo[]) {
  const lpAprs = await Promise.allSettled(
    pools.map((pool) => {
      const farm = pool.farm!
      return getLpApr(
        {
          protocol: farm.protocol,
          chainId: farm.chainId,
          lpAddress: farm.id,
          poolId: farm.id,
        },
        true,
      )
    }),
  )

  pools.forEach((pool, index) => {
    const result = lpAprs[index]
    const farm = pool.farm!

    farm.lpApr = result.status === 'fulfilled' ? `${result.value}` : '0'
  })
}

export async function fillMerklAprData(pools: PoolInfo[]) {
  const aprs = await getAllNetworkMerklApr()
  pools.forEach((pool) => {
    const farm = pool.farm!
    const key = `${farm.chainId}-${farm.id}`
    const merklApr = aprs[key] || '0'
    // eslint-disable-next-line no-param-reassign
    farm.merklApr = merklApr
  })
}

type CLPoolCallsResult = [
  ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'poolIdToPoolKey'>,
  ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'getSlot0'>,
  ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'getLiquidity'>,
]

const resolveFarm = (farm: FarmInfo) => {
  return `${farm.chainId}:${farm.id}`
}

export const fillClPoolData = memoizeAsync(
  async (farm: FarmInfo) => {
    const chainId = farm.chainId as ChainId
    const poolId = farm.id as Address
    const poolManagerAddress = getPoolManagerAddress('CL', chainId)
    const contracts = [
      {
        address: poolManagerAddress,
        functionName: 'poolIdToPoolKey',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
      {
        address: poolManagerAddress,
        functionName: 'getSlot0',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
      {
        address: poolManagerAddress,
        functionName: 'getLiquidity',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
    ]
    const results = await multicallBatcher.fetch({
      chainId,
      params: {
        contracts,
        allowFailure: false,
      },
    })

    const [poolKey, slot0, liquidity] = results as CLPoolCallsResult
    const pool = farm.pool as InfinityClPool
    const parsedPoolKey = parsePoolKeyResult('CL', poolKey)
    const slot0Info = parseSlot0('CL', slot0)
    pool.fee = parsedPoolKey.fee
    pool.protocolFee = slot0Info.protocolFee
    pool.liquidity = liquidity
    pool.hooks = parsedPoolKey.hooks
    // eslint-disable-next-line no-param-reassign
    farm.feeTier = pool.fee
    return farm
  },
  {
    resolver: resolveFarm,
  },
)

type BinPoolCallsResult = [
  ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'poolIdToPoolKey'>,
  ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'getSlot0'>,
]

export const fillBinPoolData = memoizeAsync(
  async (farm: FarmInfo) => {
    const chainId = farm.chainId as ChainId
    const poolId = farm.id as Address
    const poolManagerAddress = getPoolManagerAddress('Bin', chainId)
    const calls = [
      {
        address: poolManagerAddress,
        functionName: 'poolIdToPoolKey',
        abi: BinPoolManagerAbi,
        args: [poolId],
      },
      {
        address: poolManagerAddress,
        functionName: 'getSlot0',
        abi: BinPoolManagerAbi,
        args: [poolId],
      },
    ]
    const results = await multicallBatcher.fetch({
      chainId,
      params: {
        contracts: calls,
        allowFailure: false,
      },
    })

    const newFarm = farm
    const [poolKey, slot0] = results as BinPoolCallsResult
    const pool = farm.pool as InfinityBinPool

    if (!isValidPoolKeyResult(poolKey)) throw new Error('Invalid pool key result')

    const parsedPoolKey = parsePoolKeyResult('Bin', poolKey)
    const slot0Info = parseSlot0('Bin', slot0)

    pool.fee = parsedPoolKey.fee
    pool.hooks = parsedPoolKey.hooks
    newFarm.feeTier = pool.fee
    pool.protocolFee = slot0Info.protocolFee
    return newFarm
  },
  {
    resolver: resolveFarm,
  },
)

export const fillOnchainPoolData = memoizeAsync(
  async (farm: FarmInfo) => {
    if (farm.protocol === 'infinityCl') {
      return fillClPoolData(farm)
    }
    if (farm.protocol === 'infinityBin') {
      return fillBinPoolData(farm)
    }
    return farm
  },
  {
    resolver: resolveFarm,
    isValid: () => true,
  },
)
