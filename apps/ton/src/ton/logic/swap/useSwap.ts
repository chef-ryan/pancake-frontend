import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Contracts, Currency, TonContractNames, Trade, storeSwap } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, TonConnectUIError, UserRejectsError, useTonConnectUI } from '@tonconnect/ui-react'
import { setErrorMsgModalAtom } from 'atoms/modals/errorMsgModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { getJettonWalletAddress, useJettonWalletAddress } from 'ton/atom/jettonWalletAddressAtom'
import { parseAddress } from 'ton/utils/address'
import { parseUnits } from 'ton/utils/formatting'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getTransactionByBOC } from 'ton/utils/transaction'

const GAS = toNano('0.6')
const FORWARD_GAS = toNano('0.5')

interface SwapArgs {
  trade?: Trade<Currency, Currency, TradeType> | null
  token0?: Currency
  token1?: Currency
  amount0: string
  minOut?: string
}

export const useSwap = ({ amount0, minOut, token0, token1, trade }: SwapArgs) => {
  const { t } = useTranslation()
  const [tonUI] = useTonConnectUI()
  const userAddress = useUserAddress()
  const chainId = useAtomValue(chainIdAtom)

  const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter][chainId].address)
  const userJettonWallet0 = useJettonWalletAddress(token0?.wrapped.address, userAddress)
  const routerJettonWallet0 = useJettonWalletAddress(token0?.wrapped.address, routerAddress)
  const routerJettonWallet1 = useJettonWalletAddress(trade?.route.path[1].wrapped.address, routerAddress)

  const setTransactionModal = useSetAtom(setTransactionModalAtom)
  const setErrorMsgModal = useSetAtom(setErrorMsgModalAtom)

  const getTxRequest = useCallback(async () => {
    const queryId = generateQueryId()
    if (!routerJettonWallet1 || !routerJettonWallet0 || !trade || !token0) {
      return undefined
    }
    if (!token0.isNative && !userJettonWallet0) {
      return undefined
    }

    // multihops
    let lastSwapNext: any | null = null
    if (trade.route.path.length > 2) {
      const path = trade?.route.path
      for (let idx = path.length - 1; idx >= 2; idx--) {
        // eslint-disable-next-line no-await-in-loop
        const routerJettonWalletOut = await getJettonWalletAddress(path[idx].wrapped.address, routerAddress)
        const next = {
          tokenAddress: routerJettonWalletOut,
          minOut: idx === path.length - 1 && minOut ? parseUnits(minOut, token1?.decimals) : 1n,
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
          minOut: 1n,
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
          amount: parseUnits(amount0, token0.decimals),
          destination: routerAddress,
          responseDestination: userAddress,
          customPayload: null,
          forwardAmount: FORWARD_GAS,
          forwardPayload,
        }),
      )
      .endCell()

    return {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: token0.isNative ? routerJettonWallet0.toString() : userJettonWallet0!.toString(),
          // Attached TON for fees, not the amount of jettons to transfer!
          // todo:@eric add estimate logic
          amount: token0.isNative ? (parseUnits(amount0, token0.decimals) + FORWARD_GAS).toString() : GAS.toString(),
          payload: payload.toBoc().toString('base64'),
        },
      ],
    }
  }, [
    minOut,
    token1?.decimals,
    userAddress,
    amount0,
    routerAddress,
    routerJettonWallet0,
    routerJettonWallet1,
    trade,
    userJettonWallet0,
    token0,
  ])

  const swap = useCallback(async () => {
    try {
      setTransactionModal({
        type: ActionType.ConfirmSwap,
        isOpen: true,
        currency0: token0,
        currency1: token1,
        amount0,
        amount1: minOut,
      })

      const txRequest: SendTransactionRequest | undefined = await getTxRequest()
      if (!txRequest) {
        return
      }
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
    } catch (e) {
      let msg = typeof e === 'string' ? e : (e as Error)?.message
      if (e instanceof UserRejectsError || e instanceof TonConnectUIError) {
        msg = t('Transaction rejected')
      }
      setErrorMsgModal({
        isOpen: true,
        msg,
      })
    }
  }, [amount0, minOut, token0, token1, setErrorMsgModal, t, userAddress, tonUI, getTxRequest, setTransactionModal])

  return { swap }
}
