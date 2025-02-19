import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Contracts, Currency, TonContractNames, Trade, storeSwap } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { useUserAddress } from 'hooks/useUserAddress'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { TonContext } from 'ton/context/TonContext'
import { getJettonWalletAddress, parseAddress } from 'ton/utils/address'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getTransactionByBOC } from 'ton/utils/transaction'

interface SwapArgs {
  trade: Trade<Currency, Currency, TradeType>
  token0: Currency
  token1: Currency
  amount0: string
  minOut: string
}

export const useSwap = () => {
  const [tonUI] = useTonConnectUI()
  const userAddress = useUserAddress()
  const setTransactionModal = useSetAtom(setTransactionModalAtom)

  const getTxRequest = useCallback(
    async ({ amount0, minOut, token0, trade }: SwapArgs) => {
      const queryId = generateQueryId()
      const client = TonContext.instance.getClient()
      const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter].testnet.address)

      const userJettonWallet0 = await getJettonWalletAddress(client, userAddress, token0)
      const routerJettonWallet1 = await getJettonWalletAddress(client, routerAddress, trade.route.path[1])

      // multihops
      let lastSwapNext: any | null = null
      if (trade.route.path.length > 2) {
        const path = trade?.route.path
        for (let idx = path.length - 1; idx >= 2; idx--) {
          // eslint-disable-next-line no-await-in-loop
          const routerJettonWalletOut = await getJettonWalletAddress(client, routerAddress, path[idx])
          const next = {
            tokenAddress: routerJettonWalletOut,
            // todo:@eric
            minOut: toNano('0.01'),
            next: lastSwapNext,
          }
          lastSwapNext = next
        }
      }

      const forwardPayload = beginCell()
        .store(
          storeSwap({
            fromRealUser: userAddress,
            fromUserAddress: userAddress,
            minOut: toNano(minOut),
            refAddress: null,
            refMessageValue: 0n,
            tokenWallet: routerJettonWallet1,
            next: lastSwapNext,
          }),
        )
        .endCell()

      const payload = beginCell()
        .store(
          storeJettonTransferMessage({
            queryId,
            // input amount
            amount: toNano(amount0),
            destination: routerAddress,
            responseDestination: userAddress,
            customPayload: null,
            forwardAmount: toNano('0.5'),
            forwardPayload,
          }),
        )
        .endCell()

      return {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: userJettonWallet0.toString(),
            // Attached TON for fees, not the amount of jettons to transfer!
            // todo:@eric add estimate logic
            amount: toNano('0.6').toString(),
            payload: payload.toBoc().toString('base64'),
          },
        ],
      }
    },
    [userAddress],
  )

  const swap = useCallback(
    async ({ amount0, minOut, token0, token1, trade }: SwapArgs) => {
      setTransactionModal({
        type: ActionType.ConfirmSwap,
        isOpen: true,
        currency0: token0,
        currency1: token1,
        amount0,
        amount1: minOut,
      })

      const txRequest: SendTransactionRequest = await getTxRequest({
        amount0,
        minOut,
        token0,
        token1,
        trade,
      })
      const { boc } = await tonUI.sendTransaction(txRequest)

      if (boc) {
        setTransactionModal({
          type: ActionType.SwapSubmitted,
          isOpen: true,
          currency0: token0,
          currency1: token1,
          amount0,
          amount1: minOut,
        })
      }

      const hash = await getTransactionByBOC(userAddress, boc)
      if (hash) {
        setTransactionModal({
          type: ActionType.SwapCompleted,
          currency0: token0,
          currency1: token1,
          amount0,
          amount1: minOut,
          hash,
        })
      }
    },
    [userAddress, tonUI, getTxRequest, setTransactionModal],
  )

  return {
    swap,
  }
}
