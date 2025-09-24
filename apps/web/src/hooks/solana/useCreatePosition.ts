import { useCallback } from 'react'
import BN from 'bn.js'
import { isSolWSol } from '@pancakeswap/sdk'
import { TxVersion } from '@pancakeswap/solana-core-sdk'
import { UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Bound } from 'config/constants/types'
import { CurrencyField as Field } from 'utils/types'
import { SolanaV3Pool } from 'state/pools/solana'
import BigNumber from 'bignumber.js'
import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'

import { useRaydium } from './useRaydium'
import type { CreatePoolBuildData } from './useCreateClmmPool'

type Ticks = { [Bound.LOWER]?: number; [Bound.UPPER]?: number }

type AmountMap = { [key in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> }

type Params = {
  poolInfo?: SolanaV3Pool
  ticks: Ticks
  independentField: Field
  dependentField: Field
  parsedAmounts: AmountMap
  createBuildData?: CreatePoolBuildData
}

export function useCreatePosition() {
  const raydium = useRaydium()
  const [solanaSlippageBps] = useSolanaUserSlippage()
  const { computeBudgetConfig } = useSolanaPriorityFee()

  return useCallback(
    async ({ poolInfo, ticks, independentField, dependentField, parsedAmounts, createBuildData }: Params) => {
      if (!raydium?.clmm || !poolInfo) return { txId: '' }
      const tickLower = ticks[Bound.LOWER]
      const tickUpper = ticks[Bound.UPPER]
      if (!tickLower || !tickUpper) {
        return { txId: '' }
      }
      const isSorted = parsedAmounts[Field.CURRENCY_A]?.currency.wrapped.address === poolInfo.mintA.address
      const slippageMultiplier = new BigNumber(10000 + (Number(solanaSlippageBps) || 0)).div(10000).toNumber()

      const dependentRaw = parsedAmounts[dependentField]?.quotient ?? 0
      const otherAmountMaxWithSlippage = new BN(
        new BigNumber(dependentRaw.toString())
          .multipliedBy(slippageMultiplier)
          .integerValue(BigNumber.ROUND_CEIL)
          .toFixed(0),
      )

      const buildData = await raydium.clmm.openPositionFromBase({
        poolInfo,
        poolKeys: createBuildData?.extInfo.address,
        ownerInfo: {
          useSOLBalance: isSolWSol(poolInfo.mintA as UnifiedCurrency) || isSolWSol(poolInfo.mintB as UnifiedCurrency),
        },
        tickLower: Math.min(tickLower, tickUpper),
        tickUpper: Math.max(tickLower, tickUpper),
        base: independentField === Field.CURRENCY_A ? (isSorted ? 'MintA' : 'MintB') : isSorted ? 'MintB' : 'MintA',
        baseAmount: new BN(parsedAmounts[independentField]?.quotient ?? 0),
        otherAmountMax: otherAmountMaxWithSlippage,
        txVersion: TxVersion.V0,
        nft2022: true,
        computeBudgetConfig,
      })

      if (!buildData) {
        return { txId: '' }
      }
      if (createBuildData) {
        createBuildData.builder.addInstruction({
          ...buildData.builder.AllTxData,
        })

        const { execute } = await createBuildData.builder.sizeCheckBuildV0()
        return execute({ sequentially: true })
      }
      const res = await buildData.simulate()
      console.log('simulation result: ', res, buildData)
      return buildData.execute()
    },
    [raydium?.clmm],
  )
}
