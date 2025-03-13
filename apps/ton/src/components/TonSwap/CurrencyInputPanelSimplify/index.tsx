import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Currency, Pair } from '@pancakeswap/ton-v2-sdk'
import {
  Box,
  ChevronDownIcon,
  domAnimation,
  Flex,
  LazyAnimatePresence,
  Loading,
  Skeleton,
  Text,
  useMatchBreakpoints,
  useModal,
} from '@pancakeswap/uikit'
import { formatNumber as formatBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { CurrencyLogo, SwapUIV2 } from 'components/widgets'
import { useStablePrice } from 'hooks/useStablePrice'
import { useAtomValue } from 'jotai'
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { CurrencySelectButton } from 'styles/inputStyles'
import { addressAtom } from 'ton/atom/addressAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { formatBalance } from 'ton/utils/formatting'

import { gasConstantsAtom } from 'ton/atom/gasConstantsAtom'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { FONT_SIZE, LOGO_SIZE, useFontSize } from './state'

const SymbolText = styled(Text)`
  font-size: ${FONT_SIZE.LARGE}px;
`

const formatDollarAmount = (amount: number) => {
  if (amount > 0 && amount < 0.01) {
    return '<0.01'
  }
  return formatBalanceNumber(amount)
}

const useSizeAdaption = (value: string, currencySymbol?: string, otherCurrencySymbol?: string) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const tokenImageRef = useRef<HTMLImageElement>(null)
  const symbolRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Linked font sizes are for Symbol and Logo only and not Input
  const { symbolFontSize, logoFontSize, setFontSizesBySymbol } = useFontSize(
    currencySymbol ?? '',
    otherCurrencySymbol ?? '',
  )

  const { isMobile, isXs, isSm } = useMatchBreakpoints()

  const shortedSymbol = useMemo(() => {
    const CUTOFF_FONT_SIZE = isMobile ? { left: 3, right: 3 } : { left: 5, right: 4 }

    if (currencySymbol && currencySymbol.length > 8) {
      return `${currencySymbol.slice(0, CUTOFF_FONT_SIZE.left)}...${currencySymbol.slice(
        currencySymbol.length - CUTOFF_FONT_SIZE.right,
        currencySymbol.length,
      )}`
    }
    return currencySymbol
  }, [currencySymbol, isMobile])

  useEffect(() => {
    if (!inputRef.current || !symbolRef.current || !wrapperRef.current || !tokenImageRef.current) return

    const inputElement = inputRef.current

    const wrapperWidth = wrapperRef.current.offsetWidth

    const fontWidth = 8 // consider for calculation an approx width of a character in large font size

    const valueIsPercentWidthOfWrapper = (value.length * fontWidth * 100) / wrapperWidth

    // Breakpoints of valueIsPercentWidthOfWrapper. Calibrated for ~4 character symbols
    const BREAKPOINT = isXs
      ? {
          ONE: 25,
          TWO: 30,
          THREE: 37,
          FOUR: 45,
        }
      : isSm
      ? {
          ONE: 35,
          TWO: 40,
          THREE: 44,
          FOUR: 50,
        }
      : {
          ONE: 40,
          TWO: 45,
          THREE: 50,
          FOUR: 57,
        }

    // Since the breakpoints are calibrated for 4 character symbols, we need to adjust for longer symbols
    const symbolExcessLength = shortedSymbol && shortedSymbol.length > 4 ? shortedSymbol?.length - 2 : 0

    if (valueIsPercentWidthOfWrapper >= BREAKPOINT.FOUR - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.SMALL}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.SMALL, LOGO_SIZE.SMALL)
    } else if (valueIsPercentWidthOfWrapper >= BREAKPOINT.THREE - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.MEDIUM}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.SMALL, LOGO_SIZE.MEDIUM)
    } else if (valueIsPercentWidthOfWrapper >= BREAKPOINT.TWO - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.LARGE}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.MEDIUM, LOGO_SIZE.LARGE)
    } else if (valueIsPercentWidthOfWrapper >= BREAKPOINT.ONE - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.X_LARGE}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.MEDIUM, LOGO_SIZE.X_LARGE)
    } else {
      inputElement.style.fontSize = `${FONT_SIZE.MAX}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.LARGE, LOGO_SIZE.MAX)
    }
  }, [value, currencySymbol, setFontSizesBySymbol, otherCurrencySymbol, isXs, isSm, shortedSymbol])

  useEffect(() => {
    const symbolElement = symbolRef.current
    if (!symbolElement) return

    symbolElement.style.fontSize = `${symbolFontSize}px`
  }, [symbolFontSize, currencySymbol, otherCurrencySymbol])

  useEffect(() => {
    const logoElement = tokenImageRef.current
    if (!logoElement) return

    logoElement.style.width = `${logoFontSize}px`
    logoElement.style.height = `${logoFontSize}px`
  }, [logoFontSize, currencySymbol, otherCurrencySymbol])

  return { shortedSymbol, inputRef, symbolRef, wrapperRef, tokenImageRef }
}

interface CurrencyInputPanelProps {
  field?: string // Example: 'INPUT', 'OUTPUT'

  value: string | undefined
  onUserInput: (value: string, e?: ChangeEvent<HTMLInputElement>) => void
  onInputBlur?: () => void

  onPercentInput?: (percent: number) => void // TODO: Remove
  onMax?: () => void // TODO: Remove

  showQuickInputButton?: boolean
  showMaxButton: boolean
  // maxAmount?: CurrencyAmount<Currency>
  lpPercent?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  pair?: Pair | null
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  beforeButton?: React.ReactNode
  disabled?: boolean
  disabledToolTips?: string
  error?: boolean | string
  showUSDPrice?: boolean
  tokensToShow?: Currency[]
  currencyLoading?: boolean
  inputLoading?: boolean
  title?: React.ReactNode

  hideBalance?: boolean
  isUserInsufficientBalance?: boolean
  overrideBalance?: bigint
}
const CurrencyInputPanelSimplify = memo(function CurrencyInputPanel({
  field,
  value,
  onUserInput,
  onInputBlur,

  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  beforeButton,
  otherCurrency,
  id,
  showCommonBases,
  commonBasesType,
  showSearchInput,
  disabled,
  disabledToolTips,
  error,
  showUSDPrice,
  tokensToShow,
  currencyLoading,
  inputLoading,
  title,
  isUserInsufficientBalance,
  overrideBalance,
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()
  const account = useAtomValue(addressAtom)
  const { data: selectedCurrencyBalance_ } = useAtomValue(balanceAtom(currency))
  const GAS_CONSTANTS = useAtomValue(gasConstantsAtom)

  const selectedCurrencyBalance = overrideBalance ?? selectedCurrencyBalance_

  const [isInputFocus, setIsInputFocus] = useState(false)
  const stablePrice = useStablePrice(currency)
  const amountInDollar = useMemo(
    () => parseFloat(stablePrice?.toSignificant(currency?.decimals) ?? '0') * parseFloat(value ?? '0'),
    [currency?.decimals, stablePrice, value],
  )

  const handleUserInput = useCallback(
    (v: string, e?: ChangeEvent<HTMLInputElement>, currency_?: Currency) => {
      const cursor = e?.target.selectionStart
      const c = currency_ ?? currency
      onUserInput(c ? limitNumber(v, c?.decimals) : v, e)
      setTimeout(() => {
        if (cursor) {
          e.target.setSelectionRange(cursor, cursor)
        }
      }, 0)
    },
    [onUserInput, currency],
  )

  const handleCurrencySelect = useCallback(
    (c: Currency) => {
      onCurrencySelect?.(c)
      if (value) handleUserInput(value, undefined, c)
    },
    [value, onCurrencySelect, handleUserInput],
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      field={field}
      onCurrencySelect={handleCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
      showSearchInput={showSearchInput}
      tokensToShow={tokensToShow}
      mode={id}
      showCurrencyInHeader
    />,
  )

  const { shortedSymbol, inputRef, wrapperRef, tokenImageRef, symbolRef } = useSizeAdaption(
    value ?? '',
    currency?.symbol,
    otherCurrency?.symbol,
  )

  const handleUserInputBlur = useCallback(() => {
    onInputBlur?.()
    setTimeout(() => setIsInputFocus(false), 300)
  }, [onInputBlur])

  const handleUserInputFocus = useCallback(() => {
    setIsInputFocus(true)
  }, [])

  const onCurrencySelectClick = useCallback(() => {
    if (!disableCurrencySelect) {
      onPresentCurrencyModal()
    }
  }, [onPresentCurrencyModal, disableCurrencySelect])

  const balance = useMemo(() => {
    if (hideBalance || !currency) {
      return undefined
    }
    const amount = CurrencyAmount.fromRawAmount(currency as any, selectedCurrencyBalance)
    return formatNumber(formatAmount(amount, 6) ?? 0)
  }, [selectedCurrencyBalance, currency, hideBalance])

  const balanceExcludingGas = useMemo(
    () =>
      currency?.isNative
        ? selectedCurrencyBalance - GAS_CONSTANTS.swapTonToJetton.forwardGasAmount
        : selectedCurrencyBalance,
    [currency?.isNative, selectedCurrencyBalance, GAS_CONSTANTS],
  )

  const onMax = useCallback(() => {
    handleUserInput(formatBalance(balanceExcludingGas, currency?.decimals))
  }, [balanceExcludingGas, currency, handleUserInput])

  const onPercentInput = useCallback(
    (percent: number) => {
      if (balanceExcludingGas) {
        const val = (balanceExcludingGas * BigInt(percent)) / 100n
        handleUserInput(formatBalance(val, currency?.decimals))
      }
    },
    [balanceExcludingGas, currency, handleUserInput],
  )

  const topEle = useMemo(
    () => (
      <Flex justifyContent="space-between" alignItems="center" width="100%" position="relative">
        {title}
        <LazyAnimatePresence mode="wait" features={domAnimation}>
          {account ? (
            !isInputFocus || !onMax ? (
              <SwapUIV2.WalletAssetDisplay
                isUserInsufficientBalance={isUserInsufficientBalance}
                balance={balance}
                onMax={onMax}
              />
            ) : (
              <SwapUIV2.AssetSettingButtonList onPercentInput={onPercentInput} />
            )
          ) : null}
        </LazyAnimatePresence>
      </Flex>
    ),
    [account, balance, isInputFocus, isUserInsufficientBalance, onMax, onPercentInput, title],
  )

  const leftEle = useMemo(
    () => (
      <Flex alignItems="center">
        {beforeButton}
        <CurrencySelectButton
          className="open-currency-select-button"
          data-dd-action-name="Select currency"
          selected={!!currency}
          onClick={onCurrencySelectClick}
        >
          <Flex alignItems="center" justifyContent="space-between">
            {currency ? (
              <CurrencyLogo
                imageRef={tokenImageRef}
                currency={currency}
                size={`${LOGO_SIZE.MAX}px`}
                style={{
                  marginRight: '8px',
                }}
              />
            ) : currencyLoading ? (
              <Skeleton width="40px" height="40px" variant="circle" />
            ) : null}
            {currencyLoading ? null : (
              <Flex alignItems="start" flexDirection="column">
                <Flex alignItems="center" justifyContent="space-between">
                  <SymbolText id="pair" bold ref={symbolRef}>
                    {(currency && currency.symbol && shortedSymbol) || t('Select a currency')}
                  </SymbolText>
                  {!currencyLoading && !disableCurrencySelect && <ChevronDownIcon />}
                </Flex>
              </Flex>
            )}
          </Flex>
        </CurrencySelectButton>
      </Flex>
    ),
    [
      beforeButton,
      currency,
      currencyLoading,
      disableCurrencySelect,
      onCurrencySelectClick,
      shortedSymbol,
      symbolRef,
      t,
      tokenImageRef,
    ],
  )

  const bottomEle = useMemo(
    () =>
      inputLoading || (showUSDPrice && Number.isFinite(amountInDollar)) ? (
        <Box position="absolute" bottom="12px" right="0px">
          <Flex justifyContent="flex-end" mr="1rem">
            <Flex maxWidth={['120px', '160px', '200px', '240px']}>
              {inputLoading ? (
                <Loading width="14px" height="14px" />
              ) : showUSDPrice && Number.isFinite(amountInDollar) ? (
                <>
                  <Text fontSize="14px" color="textSubtle" ellipsis>
                    {`~${amountInDollar && formatDollarAmount(amountInDollar)}`}
                  </Text>
                  <Text ml="4px" fontSize="14px" color="textSubtle">
                    USD
                  </Text>
                </>
              ) : null}
            </Flex>
          </Flex>
        </Box>
      ) : null,
    [amountInDollar, inputLoading, showUSDPrice],
  )

  return (
    <SwapUIV2.CurrencyInputPanelSimplify
      id={id}
      disabled={disabled}
      disabledToolTips={disabledToolTips}
      error={error as boolean}
      value={value}
      onInputBlur={handleUserInputBlur}
      onInputFocus={handleUserInputFocus}
      onUserInput={handleUserInput}
      loading={inputLoading}
      inputRef={inputRef}
      wrapperRef={wrapperRef}
      top={topEle}
      inputLeft={leftEle}
      bottom={bottomEle}
    />
  )
})

const limitNumber = (val: string, decimal: number) => {
  const [integer, fraction] = val.split('.')
  if (!fraction) {
    return val
  }
  if (decimal <= 0) {
    return integer
  }
  if (fraction.length > decimal) {
    return `${integer}.${fraction.slice(0, decimal)}`
  }
  return val
}

export default CurrencyInputPanelSimplify
