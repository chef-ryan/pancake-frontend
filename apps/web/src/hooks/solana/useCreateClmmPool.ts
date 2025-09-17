import { useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import { TxVersion, type ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import { PancakeClmmProgramId } from '@pancakeswap/solana-clmm-sdk'
import Decimal from 'decimal.js'
import BN from 'bn.js'
import { Currency, CurrencyAmount, SPLToken } from '@pancakeswap/swap-sdk-core'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'
import { useRaydium } from './useRaydium'

type CreateArgs = {
  mintA: SPLToken
  mintB: SPLToken
  tradeFeeRate: number // basis points in 1e4 (e.g., 2500)
  initialPrice: number | string // price of A in terms of B
  // Optional: open position immediately after pool creation
  position?: {
    tickLower: number
    tickUpper: number
    amountA?: CurrencyAmount<Currency>
    amountB?: CurrencyAmount<Currency>
  }
}

export function useCreateClmmPool() {
  const raydium = useRaydium()
  const ammConfigs = useClmmAmmConfigs()

  return useCallback(
    async ({
      mintA,
      mintB,
      tradeFeeRate,
      initialPrice,
      position,
    }: CreateArgs): Promise<{ txId: string; pool?: ApiV3PoolInfoConcentratedItem; openPositionTxId?: string }> => {
      if (!raydium) throw new Error('Raydium client not ready')

      // Resolve AMM config by trade fee rate
      const cfg = Object.values(ammConfigs).find((c) => c.tradeFeeRate === tradeFeeRate)
      if (!cfg) throw new Error('Unsupported fee config')

      const programId = PancakeClmmProgramId['mainnet-beta']
      const createBuild = await raydium.clmm.createPool({
        programId,
        mint1: { ...mintA, name: mintA.name ?? '' },
        mint2: { ...mintB, name: mintB.name ?? '' },
        ammConfig: {
          ...cfg,
          id: new PublicKey(cfg.id),
          description: cfg.description ?? '',
        },
        initialPrice: new Decimal(initialPrice),
        forerunCreate: true,
        txVersion: TxVersion.V0,
      })
      const { extInfo } = createBuild
      if (!position) {
        const { txId } = await createBuild.execute()
        return { txId, pool: extInfo?.mockPoolInfo as any }
      }

      if (!extInfo?.mockPoolInfo || !extInfo?.address) {
        const { txId } = await createBuild.execute()
        return { txId, pool: extInfo?.mockPoolInfo as any }
      }

      const amountA = new BN(position.amountA?.quotient.toString() ?? '0')
      const amountB = new BN(position.amountB?.quotient.toString() ?? '0')
      const baseIsA = amountA.gt(new BN(0)) || !amountB.gt(new BN(0))
      const openBuild = await raydium.clmm.openPositionFromBase({
        poolInfo: extInfo.mockPoolInfo as any,
        poolKeys: extInfo.address as any,
        ownerInfo: { useSOLBalance: true },
        tickLower: Math.min(position.tickLower, position.tickUpper),
        tickUpper: Math.max(position.tickLower, position.tickUpper),
        base: baseIsA ? 'MintA' : 'MintB',
        baseAmount: baseIsA ? amountA : amountB,
        otherAmountMax: baseIsA ? amountB : amountA,
        txVersion: TxVersion.V0,
        nft2022: true,
      })

      createBuild.builder.addInstruction({ ...(openBuild.builder.AllTxData as any) })
      const { execute } = await createBuild.builder.sizeCheckBuildV0()
      await execute({ sequentially: true })
      return { txId: '', pool: extInfo.mockPoolInfo as any }
    },
    [ammConfigs, raydium],
  )
}
