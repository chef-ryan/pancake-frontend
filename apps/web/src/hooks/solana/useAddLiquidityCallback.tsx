import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { useCallback } from 'react'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { confirmTransaction, TxVersion } from '@pancakeswap/solana-core-sdk'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'
import { retry, RetryableError } from 'state/multicall/retry'
import useSolanaTxError from '../../components/WalletModalV2/hooks/useSolanaTxError'
import { useRaydium } from './useRaydium'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export type AddLiquidityCallbackProps = {
  params: {
    poolInfo: SolanaV3Pool
    position: SolanaV3PositionDetail
    liquidity: BN
    amountMaxA: string
    amountMaxB: string
  }
  onSent: (txId: string) => void
  onError: (error: any) => void
  onFinally?: () => void
  onConfirmed?: () => void
}

export const useAddLiquidityCallback = () => {
  const raydium = useRaydium()
  const { computeBudgetConfig } = useSolanaPriorityFee()
  const [slippage] = useSolanaUserSlippage()
  const { executeSolanaTransaction, handleSolanaError } = useSolanaTxError()
  const connection = useSolanaConnectionWithRpcAtom()

  const retryWaitForSolanaTransaction = useCallback(
    async (txId?: string) => {
      if (!txId) return undefined
      const waitTx = async () => {
        try {
          await confirmTransaction(connection, txId)
        } catch (error) {
          throw new RetryableError()
        }
      }
      const { promise } = retry(waitTx, { n: 5, minWait: 3000, maxWait: 5000 })
      return promise
    },
    [connection],
  )

  return useCallback(
    async ({ params, onSent, onError, onFinally, onConfirmed }: AddLiquidityCallbackProps) => {
      const { poolInfo, position, liquidity, amountMaxA, amountMaxB } = params
      if (!raydium || !position) return

      const [_amountMaxA, _amountMaxB] = [
        new BN(new BigNumber(amountMaxA).multipliedBy(10 ** poolInfo.mintA.decimals).toFixed(0)),
        new BN(new BigNumber(amountMaxB).multipliedBy(10 ** poolInfo.mintB.decimals).toFixed(0)),
      ]

      const { execute } = await raydium.clmm.increasePositionFromLiquidity({
        poolInfo,
        poolKeys: raydium.clmm.getClmmKeysFromPoolInfo(poolInfo),
        ownerPosition: position,
        ownerInfo: {
          useSOLBalance: true,
        },
        liquidity,
        amountMaxA: _amountMaxA,
        amountMaxB: _amountMaxB,
        checkCreateATAOwner: true,
        computeBudgetConfig,
        txVersion: TxVersion.V0,
      })

      // eslint-disable-next-line consistent-return
      return (
        executeSolanaTransaction(async () => {
          const { txId, signedTx } = await execute()
          onSent?.(txId)
          return { hash: txId }
        })
          // .then(async ({ hash }) => {
          //   await retryWaitForSolanaTransaction(hash)
          //   return { hash }
          // })
          .catch((e) => {
            handleSolanaError(e)
            onError?.(e)
            return { hash: '' }
          })
          .finally(() => {
            onFinally?.()
            return { hash: '' }
          })
      )
    },
    [raydium, computeBudgetConfig, executeSolanaTransaction, handleSolanaError],
  )
}
