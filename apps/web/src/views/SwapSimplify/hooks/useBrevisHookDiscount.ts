import { InfinityBinPool, InfinityClPool, Route, SmartRouter } from '@pancakeswap/smart-router'
import { useQueries } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import set from 'lodash/set'
import { useMemo } from 'react'
import { publicClient } from 'utils/viem'
import { Address, ContractFunctionParameters, zeroAddress } from 'viem'
import { parseAbi } from 'viem/utils'
import { useAccount } from 'wagmi'

const whiteListBrevisDiscountHooks = [
  '0x1A3DFBCAc585e22F993Cc8e09BcC0dB388Cc1Ca3',
  '0x1e9c64Cad39DDD36fB808E004067Cffc710EB71D',
  '0xF27b9134B23957D842b08fFa78b07722fB9845BD',
  '0x60FbCAfaB24bc117b6facECd00D3e8f56ca4D5e9',
  '0x0fcF6D110Cf96BE56D251716E69E37619932edF2',
  '0xDfdfB2c5a717AB00B370E883021f20C2fbaEd277',
].map((addr) => addr.toLowerCase())

export const useBrevisHookDiscount = (pools: Route['pools']) => {
  const { chainId } = useActiveChainId()
  const { address: account } = useAccount()
  const brevisHookPools = pools.filter(
    (pool) =>
      SmartRouter.isInfinityBinPool(pool) ||
      (SmartRouter.isInfinityClPool(pool) &&
        pool?.hooks &&
        whiteListBrevisDiscountHooks.includes(pool.hooks.toLowerCase())),
  ) as Array<InfinityBinPool | InfinityClPool>

  const queries = useMemo(() => {
    return brevisHookPools.map((pool) => ({
      queryKey: ['brevisHookDiscount', pool.id],
      queryFn: () => getBrevisHookDiscountData({ chainId, pool, account }),

      enabled: !!pool && !!chainId,
    }))
  }, [account, chainId, brevisHookPools])

  return useQueries({
    queries,
    combine(result) {
      return result.reduce((acc, item) => {
        if (item.data) {
          set(acc, item.data.hooks, {
            discountFee: item.data.discountFee,
            originalFee: item.data.originalFee,
          })
        }
        return acc
      }, {} as Record<Address, { discountFee: number; originalFee: number }>)
    },
  })
}

const getBrevisHookDiscountData = async ({
  chainId,
  pool,
  account,
}: {
  chainId: number | undefined
  pool: InfinityBinPool | InfinityClPool
  account: Address | undefined
}) => {
  if (!chainId || !pool.hooks) return undefined
  const client = publicClient({ chainId })
  const abi = parseAbi(['function getFee(address) public view returns (uint24)'])

  const userFeeCall = {
    address: pool.hooks,
    abi,
    functionName: 'getFee',
    args: [account ?? zeroAddress],
  } as const satisfies ContractFunctionParameters
  const noDiscountUserCall = {
    address: pool.hooks,
    abi,
    functionName: 'getFee',
    args: [zeroAddress],
  } as const satisfies ContractFunctionParameters

  const [discountFee, originalFee] = await client.multicall({
    contracts: [userFeeCall, noDiscountUserCall],
    allowFailure: false,
  })

  return {
    hooks: pool.hooks,
    discountFee,
    originalFee,
  }
}
