import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { useCallback } from 'react'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { confirmTransaction, getTransferAmountFeeV2, TxVersion } from '@pancakeswap/solana-core-sdk'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'
import { retry, RetryableError } from 'state/multicall/retry'
import useSolanaTxError from '../../components/WalletModalV2/hooks/useSolanaTxError'
import { useSolanaEpochInfo } from './useSolanaEpochInfo'
import { useRaydium } from './useRaydium'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export type RemoveLiquidityCallbackProps = {
  params: {
    poolInfo: SolanaV3Pool
    position: SolanaV3PositionDetail
    liquidity: BN
    amountMinA: string
    amountMinB: string
    closePosition?: boolean
  }
  harvest?: boolean
  onSent: (txId: string) => void
  onError: (error: any) => void
  onFinally?: () => void
  onConfirmed?: () => void
}

export const useRemoveLiquidityCallback = () => {
  const raydium = useRaydium()
  const { data: epochInfo } = useSolanaEpochInfo()
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
    async ({ params, harvest, onSent, onError, onFinally, onConfirmed }: RemoveLiquidityCallbackProps) => {
      const { poolInfo, position, liquidity, amountMinA, amountMinB, closePosition: _closePosition } = params
      if (!raydium || !position) return

      const [_amountMinA, _amountMinB] = [
        new BN(
          new BigNumber(amountMinA)
            .multipliedBy(10000 - slippage)
            .dividedBy(10000)
            .multipliedBy(10 ** poolInfo.mintA.decimals)
            .toFixed(0),
        ),
        new BN(
          new BigNumber(amountMinB)
            .multipliedBy(10000 - slippage)
            .dividedBy(10000)
            .multipliedBy(10 ** poolInfo.mintB.decimals)
            .toFixed(0),
        ),
      ]

      const closePosition = _closePosition || position.liquidity.eq(liquidity)
      const { fee: feeA = new BN(0) } = getTransferAmountFeeV2(
        _amountMinA,
        poolInfo.mintA.extensions?.feeConfig,
        epochInfo!,
        false,
      )
      const { fee: feeB = new BN(0) } = getTransferAmountFeeV2(
        _amountMinB,
        poolInfo.mintB.extensions?.feeConfig,
        epochInfo!,
        false,
      )
      const { execute } = await raydium.clmm.decreaseLiquidity({
        poolInfo,
        poolKeys: raydium.clmm.getClmmKeysFromPoolInfo(poolInfo),
        ownerPosition: position,
        ownerInfo: {
          useSOLBalance: true,
          closePosition: !(harvest || !closePosition),
        },
        liquidity,
        amountMinA: _amountMinA.sub(feeA),
        amountMinB: _amountMinB.sub(feeB),
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
