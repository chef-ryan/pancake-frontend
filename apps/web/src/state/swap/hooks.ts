import { Currency, Native, SOL, Trade, TradeType } from '@pancakeswap/sdk'
import { CAKE, STABLE_COIN, USDC, USDT } from '@pancakeswap/tokens'
import { PairDataTimeWindowEnum } from '@pancakeswap/uikit'
import replaceBrowserHistoryMultiple from '@pancakeswap/utils/replaceBrowserHistoryMultiple'
import { useQuery } from '@tanstack/react-query'
import { CHAIN_QUERY_NAME, getChainId } from 'config/chains'
import { DEFAULT_INPUT_CURRENCY } from 'config/constants/exchange'
import dayjs from 'dayjs'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useUnifiedNativeCurrency } from 'hooks/useNativeCurrency'
import { useAtom, useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { useCallback, useEffect, useState } from 'react'
import { ChartPeriod, chainIdToExplorerInfoChainName, explorerApiClient } from 'state/info/api/client'
import { isAddressEqual, safeGetAddress, safeGetUnifiedAddress } from 'utils'
import { NonEVMChainId, UnifiedChainId } from '@pancakeswap/chains'
import { useBridgeAvailableRoutes } from 'views/Swap/Bridge/hooks'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { Field, replaceSwapState } from './actions'
import { SwapState, swapReducerAtom } from './reducer'

export function useSwapState() {
  return useAtomValue(swapReducerAtom)
}

// TODO: update
const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade<Currency, Currency, TradeType>, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => isAddressEqual(token.address, checksummedAddress)) ||
    trade.route.pairs.some((pair) => isAddressEqual(pair.liquidityToken.address, checksummedAddress))
  )
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !Number.isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = safeGetAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

function getNativeCurrency(chainId?: UnifiedChainId) {
  if (!chainId) {
    return undefined
  }
  if (chainId === NonEVMChainId.SOLANA) {
    return SOL
  }
  return Native.onChain(chainId)
}

export function queryParametersToSwapState(
  parsedQs: ParsedUrlQuery,
  nativeSymbol?: string,
  defaultOutputCurrency?: string,
): SwapState {
  // Parse chains
  const inputChain = parsedQs.chain
  const outputChain = parsedQs.chainOut

  const inputChainId = typeof inputChain === 'string' ? getChainId(inputChain) : undefined
  const outputChainId = typeof outputChain === 'string' ? getChainId(outputChain) : undefined

  const recipient = validatedRecipient(parsedQs.recipient)

  // Parse currencies
  let inputCurrency =
    safeGetUnifiedAddress(inputChainId, parsedQs.inputCurrency) ||
    getNativeCurrency(inputChainId)?.symbol ||
    nativeSymbol ||
    DEFAULT_INPUT_CURRENCY
  let outputCurrency =
    typeof parsedQs.outputCurrency === 'string'
      ? safeGetUnifiedAddress(outputChainId, parsedQs.outputCurrency) ||
        getNativeCurrency(outputChainId)?.symbol ||
        nativeSymbol
      : defaultOutputCurrency
  if (inputCurrency === outputCurrency && inputChainId === outputChainId) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
      chainId: inputChainId,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
      chainId: outputChainId,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
    pairDataById: {},
    derivedPairDataById: {},
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveChainId()
  const [, dispatch] = useAtom(swapReducerAtom)
  const native = useUnifiedNativeCurrency()
  const { query, pathname, isReady } = useRouter()
  const [result, setResult] = useState<
    | {
        inputCurrencyId: string | undefined
        outputCurrencyId: string | undefined
        inputChainId: number | undefined
        outputChainId: number | undefined
      }
    | undefined
  >()

  const { data: supportedBridgeChains, isPending: isSupportedBridgePending } = useBridgeAvailableRoutes()

  useEffect(() => {
    if (!chainId || !native || !isReady) return

    const defaultOutputCurrency =
      CAKE[chainId]?.address ?? STABLE_COIN[chainId]?.address ?? USDC[chainId]?.address ?? USDT[chainId]?.address

    const parsed = queryParametersToSwapState(query, native.symbol, defaultOutputCurrency)

    let finalInputCurrencyId = parsed[Field.INPUT].currencyId
    let finalOutputCurrencyId = parsed[Field.OUTPUT].currencyId

    let finalInputChainId = parsed[Field.INPUT].chainId
    let finalOutputChainId = parsed[Field.OUTPUT].chainId

    if (isSupportedBridgePending && finalInputChainId !== finalOutputChainId) {
      return
    }

    const isNotTwapOrLimitPath = !['twap', 'limit'].some((p) => pathname.includes(p))

    // Set input currency to default (native currency) if chain is changed by user
    // and input currency is on different chain
    if (finalInputChainId && finalInputChainId !== chainId) {
      finalInputCurrencyId = native.symbol
      finalInputChainId = chainId

      const isOutputChainSupported =
        finalOutputChainId &&
        isNotTwapOrLimitPath &&
        supportedBridgeChains?.some(
          (route) => route.originChainId === finalInputChainId && route.destinationChainId === finalOutputChainId,
        )

      // If now input and output currencies are the same,
      // OR if output chain is NOT supported by the bridge,
      // set output currency to the default value
      if (
        !isOutputChainSupported ||
        (finalOutputCurrencyId === finalInputCurrencyId && finalOutputChainId === finalInputChainId)
      ) {
        finalOutputCurrencyId = defaultOutputCurrency
        finalOutputChainId = chainId
      }
    }

    if (finalOutputChainId && finalOutputChainId !== chainId) {
      const isOutputChainSupported =
        isNotTwapOrLimitPath &&
        supportedBridgeChains?.some(
          (route) =>
            route.originChainId === (finalInputChainId || chainId) && route.destinationChainId === finalOutputChainId,
        )

      if (!isOutputChainSupported) {
        finalOutputCurrencyId = defaultOutputCurrency
        finalOutputChainId = chainId
      }
    }

    // If input and output currencies are the same, set output currency to native currency (other default currency)
    if (finalInputCurrencyId === finalOutputCurrencyId && finalOutputChainId === finalInputChainId) {
      if (finalOutputCurrencyId !== native.symbol) {
        finalOutputCurrencyId = native.symbol
      } else {
        finalOutputCurrencyId = defaultOutputCurrency
      }
    }

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: finalInputCurrencyId,
        outputCurrencyId: finalOutputCurrencyId,
        inputChainId: finalInputChainId || chainId,
        outputChainId: finalOutputChainId || chainId,
        recipient: null,
      }),
    )

    setResult({
      inputCurrencyId: finalInputCurrencyId,
      outputCurrencyId: finalOutputCurrencyId,
      inputChainId: finalInputChainId || chainId,
      outputChainId: finalOutputChainId || chainId,
    })
  }, [dispatch, chainId, query, native, isReady, pathname, supportedBridgeChains, isSupportedBridgePending])

  return result
}

type useFetchPairPricesParams = {
  token0Address: string
  token1Address: string
  timeWindow: PairDataTimeWindowEnum
  currentSwapPrice: {
    [key: string]: number
  }
}

const timeWindowToPeriod = (timeWindow: PairDataTimeWindowEnum): ChartPeriod => {
  switch (timeWindow) {
    case PairDataTimeWindowEnum.HOUR:
      return '1H'
    case PairDataTimeWindowEnum.DAY:
      return '1D'
    case PairDataTimeWindowEnum.WEEK:
      return '1W'
    case PairDataTimeWindowEnum.MONTH:
      return '1M'
    case PairDataTimeWindowEnum.YEAR:
      return '1Y'
    default:
      throw new Error('Invalid time window')
  }
}

export const usePairRate = ({
  token0Address,
  token1Address,
  timeWindow,
  currentSwapPrice,
}: useFetchPairPricesParams) => {
  const { chainId } = useActiveChainId()

  const chainName = chainIdToExplorerInfoChainName[chainId]

  return useQuery({
    queryKey: ['pair-rate', { token0Address, token1Address, chainId, timeWindow }],
    enabled: Boolean(token0Address && token1Address && chainId && chainName),
    queryFn: async ({ signal }) => {
      return explorerApiClient
        .GET('/cached/tokens/chart/{chainName}/rate', {
          signal,
          params: {
            path: {
              chainName,
            },

            query: {
              period: timeWindowToPeriod(timeWindow),
              tokenA: token0Address,
              tokenB: token1Address,
            },
          },
        })
        .then((res) => res.data)
    },
    select: useCallback(
      (data_) => {
        if (!data_) {
          throw new Error('No data')
        }
        const hasSwapPrice = currentSwapPrice && currentSwapPrice[token0Address] > 0

        const formatted = data_.map((d) => ({
          time: dayjs(d.bucket as string).toDate(),
          open: d.open ? +d.open : 0,
          close: d.close ? +d.close : 0,
          low: d.low ? +d.low : 0,
          high: d.high ? +d.high : 0,
          value: d.close ? +d.close : 0,
        }))
        if (hasSwapPrice) {
          return [...formatted, { time: new Date(), value: currentSwapPrice[token0Address] }]
        }
        return formatted
      },
      [currentSwapPrice, token0Address],
    ),
  })
}
