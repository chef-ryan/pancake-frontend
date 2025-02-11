// import testnetPools from 'public/lists/pools-testnet.json'

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpAccountByPoolsAtom } from 'ton/atom/liquidity/lpAccountByPoolsQueryAtom'
import { lpBalanceByPoolsQueryAtom } from 'ton/atom/liquidity/lpBalanceByPoolsQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonNetworks } from 'ton/ton.enums'

const PRESET_POOLS = {
  [TonNetworks.Mainnet]: [],
  [TonNetworks.Testnet]: {
    // SYRUP-PAN
    'kQArzX0-In2BjRhaq5pB2vmZH80saystVwwbPIpEyGrh723F<>kQABtdKCYuAAIrEAD4LbONdybLTYsYleyYhsy6CfsXkkP0tg':
      'EQB53lcd4hlB4VuZ2mTSjcZd1JSJJ1iY-kN9SIPIL9RrQU5B',
  },
}

export const useUserPools = () => {
  const network = useAtomValue(networkAtom)
  const { data: pools, ...rest } = useAtomValue(lpBalanceByPoolsQueryAtom(Object.values(PRESET_POOLS[network])))
  const tokenPairs = useMemo(() => Object.keys(PRESET_POOLS[network]).map((key) => key.split('<>')), [network])

  // Combine token pairs with their pool addresses considering they're in same order
  const basicPoolsData = useMemo(
    () =>
      tokenPairs
        .map(([token0, token1], index) => ({
          poolAddress: PRESET_POOLS[network][`${token0}<>${token1}`],
          token0,
          token1,
          balance: pools?.[index]?.balance,
        }))
        .filter((pool) => pool.balance && pool.balance > 0n),
    [pools, tokenPairs, network],
  )

  const { data: lpAccounts } = useAtomValue(lpAccountByPoolsAtom(basicPoolsData.map((pool) => pool.poolAddress)))

  // Combine LpAccount data with poolsData
  const poolsData = useMemo(() => {
    if (!lpAccounts) return basicPoolsData

    return basicPoolsData.map((pool, index) => ({
      ...pool,
      amount0: lpAccounts[index]?.amount0,
      amount1: lpAccounts[index]?.amount1,
    }))
  }, [basicPoolsData, lpAccounts])

  console.log('useUserPools', poolsData)

  return { data: poolsData, ...rest }
}
