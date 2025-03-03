import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Contracts, Currency, TonContractNames, Trade, storeSwap } from '@pancakeswap/ton-v2-sdk'
import { useAsyncConfirmPriceImpactWithoutFee } from '@pancakeswap/widgets-internal'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, TonConnectUIError, UserRejectsError, useTonConnectUI } from '@tonconnect/ui-react'
import { setConfirmSwapModalAtom } from 'atoms/modals/confirmSwapModalAtom'
import { setErrorMsgModalAtom } from 'atoms/modals/errorMsgModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from 'config/constants/exchange'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { useJettonWalletAddress } from 'ton/atom/jettonWalletAddressAtom'
import { parseAddress } from 'ton/utils/address'
import { parseUnits } from 'ton/utils/formatting'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getJettonWalletAddress } from 'ton/utils/jettonWalletAddress'
import { getTransactionByBOC } from 'ton/utils/transaction'
import { logGTMClickSwapConfirmEvent, logGTMClickSwapEvent, logGTMSwapTxSentEvent } from 'utils/customGTMEventTracking'
import { computeTradePriceBreakdown } from 'utils/exchange'

const GAS = toNano('0.6')
const FORWARD_GAS = toNano('0.5')

interface SwapArgs {
  trade?: Trade<Currency, Currency, TradeType> | null
  refreshTrade: () => void
  token0?: Currency
  token1?: Currency
  amount0: string
  minOut?: string
}

export const useSwap = ({ amount0, minOut, token0, token1, trade, refreshTrade }: SwapArgs) => {
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
        const routerJettonWalletOut = await getJettonWalletAddress(routerAddress, path[idx].wrapped.address)
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
    logGTMClickSwapConfirmEvent()
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
      const { boc } = await tonUI.sendTransaction(txRequest, { modals: ['error'] })

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
        logGTMSwapTxSentEvent()
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

  const setSwapConfirmModal = useSetAtom(setConfirmSwapModalAtom)
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  const confirmPriceImpactWithoutFee = useAsyncConfirmPriceImpactWithoutFee(
    priceImpactWithoutFee,
    PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
    ALLOWED_PRICE_IMPACT_HIGH,
  )
  const swapPreflightCheck = useCallback(async () => {
    if (priceImpactWithoutFee) {
      const confirmed = await confirmPriceImpactWithoutFee()
      if (!confirmed) {
        return false
      }
    }
    return true
  }, [confirmPriceImpactWithoutFee, priceImpactWithoutFee])

  const confirmSwap = useCallback(async () => {
    if (!token0 || !token1) {
      return
    }
    if (!(await swapPreflightCheck())) {
      return
    }
    logGTMClickSwapEvent()
    setSwapConfirmModal({
      isOpen: true,
      inputCurrency: token0,
      outputCurrency: token1,
      trade,
      refreshTrade,
      onConfirm: swap,
    })
  }, [token0, token1, setSwapConfirmModal, trade, refreshTrade, swap, swapPreflightCheck])

  return { swap, confirmSwap }
}
