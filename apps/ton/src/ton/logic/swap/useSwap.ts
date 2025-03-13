import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, Trade, storeSwap } from '@pancakeswap/ton-v2-sdk'
import { useAsyncConfirmPriceImpactWithoutFee } from '@pancakeswap/widgets-internal'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell } from '@ton/core'
import { SendTransactionRequest, TonConnectUIError, UserRejectsError, useTonConnectUI } from '@tonconnect/ui-react'
import { setConfirmSwapModalAtom } from 'atoms/modals/confirmSwapModalAtom'
import { setErrorMsgModalAtom } from 'atoms/modals/errorMsgModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from 'config/constants/exchange'
import { useLatestTxReceipt } from 'hooks/useLatestTxReceipt'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'
import { gasConstantsAtom } from 'ton/atom/gasConstantsAtom'

import { useJettonWalletAddress } from 'ton/atom/jettonWalletAddressAtom'
import { parseUnits } from 'ton/utils/formatting'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getJettonWalletAddress } from 'ton/utils/jettonWalletAddress'
import { checkTransactionApplied, getTransactionByBOC } from 'ton/utils/transaction'
import { logGTMClickSwapConfirmEvent, logGTMClickSwapEvent, logGTMSwapTxSentEvent } from 'utils/customGTMEventTracking'
import { computeTradePriceBreakdown } from 'utils/exchange'

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

  const GAS_CONSTANTS = useAtomValue(gasConstantsAtom)
  const routerAddress = useAtomValue(routerContractAtom).address

  const userJettonWallet0 = useJettonWalletAddress(token0?.wrapped.address, userAddress)
  const routerJettonWallet0 = useJettonWalletAddress(token0?.wrapped.address, routerAddress)
  const routerJettonWallet1 = useJettonWalletAddress(trade?.route.path[1].wrapped.address, routerAddress)

  const setTransactionModal = useSetAtom(setTransactionModalAtom)
  const setErrorMsgModal = useSetAtom(setErrorMsgModalAtom)

  const [, setLatestTxReceipt] = useLatestTxReceipt()

  const getTxRequest = useCallback(async () => {
    const queryId = generateQueryId()
    if (!routerJettonWallet1 || !routerJettonWallet0 || !trade || !token0) {
      return undefined
    }
    if (!token0.isNative && !userJettonWallet0) {
      return undefined
    }

    const isTonToJetton = token0.isNative

    // multihops
    let lastSwapNext: any | null = null
    if (trade.route.path.length > 2) {
      const path = trade?.route.path
      for (let idx = path.length - 1; idx >= 2; idx--) {
        const currency = path[idx]
        // eslint-disable-next-line no-await-in-loop
        const routerJettonWalletOut = await getJettonWalletAddress(routerAddress, currency.wrapped.address)
        const next = {
          tokenAddress: routerJettonWalletOut,
          minOut: idx === path.length - 1 && minOut ? parseUnits(minOut, currency?.decimals) : 1n,
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
          forwardAmount: isTonToJetton
            ? GAS_CONSTANTS.swapTonToJetton.forwardGasAmount
            : GAS_CONSTANTS.swapJettonToJetton.forwardGasAmount,
          forwardPayload,
        }),
      )
      .endCell()

    return {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: isTonToJetton ? routerJettonWallet0.toString() : userJettonWallet0!.toString(),
          // Attached TON for fees, not the amount of jettons to transfer
          amount: (isTonToJetton
            ? parseUnits(amount0, token0.decimals) + GAS_CONSTANTS.swapTonToJetton.forwardGasAmount
            : GAS_CONSTANTS.swapJettonToJetton.gasAmount
          ).toString(),
          payload: payload.toBoc().toString('base64'),
        },
      ],
    }
  }, [
    routerJettonWallet1,
    routerJettonWallet0,
    trade,
    token0,
    userJettonWallet0,
    userAddress,
    minOut,
    amount0,
    routerAddress,
    GAS_CONSTANTS.swapTonToJetton.forwardGasAmount,
    GAS_CONSTANTS.swapJettonToJetton.forwardGasAmount,
    GAS_CONSTANTS.swapJettonToJetton.gasAmount,
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
        return Promise.reject()
      }
      const { boc } = await tonUI.sendTransaction(txRequest, { modals: [] })

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
        // dont await, just let it go
        checkTransactionApplied({ hash })
          .then(() => {
            setLatestTxReceipt({ hash })
          })
          .catch((e) => console.error(e))
      }
      return Promise.resolve()
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e as Error)?.message
      if (e instanceof UserRejectsError || e instanceof TonConnectUIError || msg.includes('Reject request')) {
        setErrorMsgModal({
          isOpen: true,
          msg: t('Transaction rejected'),
        })
      }
      return Promise.reject()
    }
  }, [
    amount0,
    setLatestTxReceipt,
    minOut,
    token0,
    token1,
    setErrorMsgModal,
    t,
    userAddress,
    tonUI,
    getTxRequest,
    setTransactionModal,
  ])

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
    let resolve = (_value: any) => {}
    let reject = () => {}
    const pm = new Promise((resolve_, reject_) => {
      resolve = resolve_
      reject = reject_
    })
    if (!token0 || !token1) {
      reject()
      return pm
    }
    if (!(await swapPreflightCheck())) {
      reject()
      return pm
    }
    logGTMClickSwapEvent()
    const onConfirm = async () => {
      try {
        const res = await swap()
        resolve(res)
      } catch (e) {
        reject()
      }
    }
    const onClose = () => {
      reject()
    }

    setSwapConfirmModal({
      isOpen: true,
      inputCurrency: token0,
      outputCurrency: token1,
      trade,
      refreshTrade,
      onConfirm,
      onClose,
    })
    return pm
  }, [token0, token1, setSwapConfirmModal, trade, refreshTrade, swap, swapPreflightCheck])

  return { swap, confirmSwap }
}
