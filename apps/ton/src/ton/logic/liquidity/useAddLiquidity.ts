import { Currency, storeAddLiquidity } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { resetAppModalAtom } from 'atoms/modals/appModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'
import { TonContext } from 'ton/context/TonContext'
import { getCurrencyOrder, getJettonWalletAddress } from 'ton/utils/address'
import { formatBalance } from 'ton/utils/formatting'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getTransactionByBOC } from 'ton/utils/transaction'

interface AddLiquidityArgs {
  token0: Currency
  token1: Currency

  amount0: bigint
  amount1: bigint

  minLpOut: bigint
}

const GAS = toNano('0.6')

export const useAddLiquidity = () => {
  const [tonUI] = useTonConnectUI()

  const userAddress = useUserAddress()
  const routerAddress = useAtomValue(routerContractAtom).address

  const setTxnModal = useSetAtom(setTransactionModalAtom)
  const resetAppModal = useSetAtom(resetAppModalAtom)

  const addLiquidity = useCallback(
    async ({ token0, token1, minLpOut, amount0: amount0_, amount1: amount1_ }: AddLiquidityArgs) => {
      try {
        // Sort according to Native first and if both not native then use .sortsBefore
        const { currency0, currency1, isFlipped } = getCurrencyOrder(token0, token1)
        let amount0 = amount0_
        let amount1 = amount1_
        if (isFlipped) {
          amount0 = amount1_
          amount1 = amount0_
        }

        const formattedAmount0 = formatBalance(amount0, currency0.decimals)
        const formattedAmount1 = formatBalance(amount1, currency1.decimals)
        setTxnModal({
          type: ActionType.ConfirmLiquiditySupply,
          currency0,
          currency1,
          amount0: formattedAmount0,
          amount1: formattedAmount1,
          isOpen: true,
        })

        const client = TonContext.instance.getClient()

        const userJettonWallet0 = await getJettonWalletAddress(client, userAddress, currency0)
        const userJettonWallet1 = await getJettonWalletAddress(client, userAddress, currency1)
        const routerJettonWallet0 = await getJettonWalletAddress(client, routerAddress, currency0)
        const routerJettonWallet1 = await getJettonWalletAddress(client, routerAddress, currency1)

        const forwardPayload0 = beginCell()
          .store(
            storeAddLiquidity({
              minLPOut: minLpOut,
              tokenWallet: routerJettonWallet1,
            }),
          )
          .endCell()
        const payload0 = beginCell()
          .store(
            storeJettonTransferMessage({
              queryId: generateQueryId(),
              amount: amount0,
              destination: routerAddress,
              responseDestination: userAddress,
              customPayload: null,
              forwardAmount: toNano('0.3'),
              forwardPayload: forwardPayload0,
            }),
          )
          .endCell()

        const forwardPayload1 = beginCell()
          .store(
            storeAddLiquidity({
              minLPOut: minLpOut,
              tokenWallet: routerJettonWallet0,
            }),
          )
          .endCell()
        const payload1 = beginCell()
          .store(
            storeJettonTransferMessage({
              queryId: generateQueryId(),
              amount: amount1,
              destination: routerAddress,
              responseDestination: userAddress,
              customPayload: null,
              forwardAmount: toNano('0.3'),
              forwardPayload: forwardPayload1,
            }),
          )
          .endCell()

        const txRequest: SendTransactionRequest = {
          validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
          messages: [
            {
              address: currency0.isNative ? routerJettonWallet0.toString() : userJettonWallet0.toString(),
              amount: (GAS + (currency0.isNative ? amount0 : 0n)).toString(),
              payload: payload0.toBoc().toString('base64'),
            },
            {
              address: userJettonWallet1.toString(),
              amount: GAS.toString(),
              payload: payload1.toBoc().toString('base64'),
            },
          ],
        }

        const { boc } = await tonUI.sendTransaction(txRequest)
        if (boc) {
          setTxnModal({
            type: ActionType.TransactionSubmitted,
            currency0,
            currency1,
            amount0: formattedAmount0,
            amount1: formattedAmount1,
          })
        }
        const hash = await getTransactionByBOC(userAddress, boc)
        if (hash) {
          setTxnModal({
            type: ActionType.TransactionComplete,
            currency0,
            currency1,
            amount0: formattedAmount0,
            amount1: formattedAmount1,
            hash,
          })
        }
      } catch (e) {
        console.error(e)

        // Close the modal
        resetAppModal()
      }
    },
    [tonUI, userAddress, routerAddress, setTxnModal, resetAppModal],
  )

  return {
    addLiquidity,
  }
}
