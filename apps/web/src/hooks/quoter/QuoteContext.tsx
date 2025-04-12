import { ChainId } from '@pancakeswap/chains'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { createContext, useContext } from 'react'
import {
  useUserInfinitySwapEnable,
  useUserSplitRouteEnable,
  useUserStableSwapEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'
import { useMulticallGasLimit } from './useMulticallGasLimit'

export interface QuoteContext {
  multicallGasLimit?: bigint
  singleHopOnly?: boolean
  split?: boolean
  v2Swap?: boolean
  v3Swap?: boolean
  infinitySwap?: boolean
  stableSwap?: boolean
  maxHops: number
  chainId: number
}

const QuoteContext = createContext<QuoteContext>({
  multicallGasLimit: undefined,
  singleHopOnly: false,
  split: false,
  v2Swap: true,
  v3Swap: true,
  infinitySwap: true,
  stableSwap: true,
  maxHops: 3,
  chainId: ChainId.BSC,
})

export const QuoteContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { chainId } = useActiveChainId()
  const limit = useMulticallGasLimit()

  const [singleHopOnly] = useUserSingleHopOnly()
  const [split] = useUserSplitRouteEnable()
  const [v2Swap] = useUserV2SwapEnable()
  const [v3Swap] = useUserV3SwapEnable()
  const [infinitySwap] = useUserInfinitySwapEnable()
  const [stableSwap] = useUserStableSwapEnable()

  return (
    <QuoteContext.Provider
      value={{
        multicallGasLimit: limit,
        singleHopOnly,
        split,
        v2Swap,
        v3Swap,
        infinitySwap,
        stableSwap,
        maxHops: 3,
        chainId,
      }}
    >
      {children}
    </QuoteContext.Provider>
  )
}

export const useQuoteContext = () => {
  const context = useContext(QuoteContext)
  if (!context) {
    throw new Error('useQuoteContext must be used within a QuoteProvider')
  }
  return context
}
