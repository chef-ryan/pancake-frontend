import { WalletFilledV2Icon } from '@pancakeswap/uikit'
import { Box, BoxProps, Grid, GridItem, HStack, Spacer, StackProps, SystemStyleObject, Text, useDisclosure } from '@chakra-ui/react'
import { ApiV3Token, TokenInfo, SOL_INFO } from '@raydium-io/raydium-sdk-v2'
import { NumericFormat } from 'react-number-format'
import Decimal from 'decimal.js'
import { ReactNode, useEffect, useState, useRef, useMemo, useImperativeHandle, RefObject } from 'react'
import { t } from 'i18next'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { useAppStore, useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { trimTrailZero, formatCurrency, detectedSeparator } from '@/utils/numberish/formatter'

import Button from './Button'
import TokenAvatar from './TokenAvatar'
import TokenSelectDialog, { TokenSelectDialogProps } from './TokenSelectDialog'
import TokenUnknownAddDialog from './TokenSelectDialog/components/TokenUnknownAddDialog'
import TokenFreezeDialog from './TokenSelectDialog/components/TokenFreezeDialog'
import { TokenListHandles } from './TokenSelectDialog/components/TokenList'
import useResponsive from '@/hooks/useResponsive'
import { inputCard, inputFocusStyle } from '@/theme/cssBlocks'

const linkButtonStyle = {
  variant: 'link' as const,
  size: 'xs',
  color: colors.primary60,
  fontWeight: 600
}

export const DEFAULT_SOL_RESERVER = 0.01
export interface InputActionRef {
  refreshPrice: () => void
}
export interface TokenInputProps extends Pick<TokenSelectDialogProps, 'filterFn'> {
  id?: string
  name?: string
  /**
   * @default auto-detect if it's on pc, use md; if it's on mobile, use sm
   * md:
   * - input text size : 28px
   * - token symbol text size: 2xl
   * - token icon size: md
   * - opacity volume text size: sm
   * - downer & upper grid px: 18px
   * - downer darker grid py: 16px
   * - upper grid py: 12px
   *
   * sm:
   * - input text size : lg
   * - token symbol text size: lg
   * - token icon size: sm
   * - opacity volume text size: xs
   * - downer & upper grid px: 12px
   * - downer darker grid py: 14px
   * - upper grid py: 10px
   */
  size?: 'md' | 'sm'
  token?: TokenInfo | ApiV3Token | string
  /** <NumberInput> is disabled */
  readonly?: boolean
  loading?: boolean

  /** default is empty string */
  value?: string

  topLeftLabel?: ReactNode

  hideBalance?: boolean
  hideTokenIcon?: boolean
  hideControlButton?: boolean

  disableTotalInputByMask?: boolean
  renderMaskContent?: ReactNode
  renderMaskProps?: BoxProps

  disableSelectToken?: boolean
  disableClickBalance?: boolean
  forceBalanceAmount?: string | number
  maxMultiplier?: number | string
  solReserveAmount?: number | string
  renderTopRightPrefixLabel?: () => ReactNode

  width?: string
  height?: string
  sx?: SystemStyleObject
  ctrSx?: SystemStyleObject
  topBlockSx?: StackProps
  onChange?: (val: string) => void
  /** for library:fomik  */
  onTokenChange?: (token: TokenInfo | ApiV3Token) => void
  onFocus?: () => void

  defaultUnknownToken?: TokenInfo
  actionRef?: RefObject<InputActionRef>
}

/**
 * dirty component, inner has tokenPrice store state and balance store state and tokenMap store state(in `<TokenSelectDialog />`)
 */
function TokenInput(props: TokenInputProps) {
  const {
    id,
    name,
    size: inputSize,
    token: inputToken,
    hideBalance = false,
    hideTokenIcon = false,
    hideControlButton = false,
    disableTotalInputByMask,
    renderMaskContent,
    renderMaskProps,
    disableSelectToken,
    disableClickBalance,
    forceBalanceAmount,
    maxMultiplier,
    solReserveAmount = DEFAULT_SOL_RESERVER,
    renderTopRightPrefixLabel = () => <WalletFilledV2Icon color={colors.textSubtle} />,
    onChange,
    onTokenChange,
    onFocus,
    filterFn,
    topLeftLabel,
    readonly,
    value: inputValue,
    loading,
    width,
    topBlockSx,
    ctrSx,
    sx,
    defaultUnknownToken,
    actionRef
  } = props
  const { isMobile } = useResponsive()
  const setExtraTokenListAct = useTokenStore((s) => s.setExtraTokenListAct)
  const whiteListMap = useTokenStore((s) => s.whiteListMap)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpenUnknownTokenConfirm, onOpen: onOpenUnknownTokenConfirm, onClose: onCloseUnknownTokenConfirm } = useDisclosure()
  const { isOpen: isOpenFreezeTokenConfirm, onOpen: onOpenFreezeTokenConfirm, onClose: onCloseFreezeTokenConfirm } = useDisclosure()

  const sizes = useMemo(() => {
    const size = inputSize ?? isMobile ? 'sm' : 'md'
    return {
      inputText: size === 'sm' ? 'lg' : '28px',
      tokenSymbol: size === 'sm' ? 'lg' : '2xl',
      tokenIcon: size === 'sm' ? 'sm' : 'md',
      disableSelectTokenIconSize: size === 'sm' ? 'md' : '40px',
      opacityVolume: size === 'sm' ? 'xs' : 'sm',
      downerUpperGridPx: size === 'sm' ? '12px' : '18px',
      downerGridPy: size === 'sm' ? '14px' : '16px',
      upperGridPy: size === 'sm' ? '10px' : '12px'
    }
  }, [inputSize, isMobile])

  // price
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const token = typeof inputToken === 'string' ? tokenMap.get(inputToken) : inputToken
  const { data: tokenPrice, refreshPrice } = useTokenPrice({
    mintList: [token?.address]
  })

  const value = useMemo(
    () =>
      inputValue &&
      !String(inputValue).endsWith('.') &&
      token?.decimals != null &&
      new Decimal(inputValue).decimalPlaces() > token?.decimals
        ? new Decimal(inputValue).toDecimalPlaces(token?.decimals, Decimal.ROUND_DOWN).toString()
        : inputValue,
    [inputValue, token?.decimals]
  )
  const totalPrice = useMemo(() => {
    const price = tokenPrice[token?.address || '']?.value
    return price && value ? new Decimal(price ?? 0).mul(value).toString() : ''
  }, [token?.address, tokenPrice, value])

  // balance
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const { balanceMaxString, maxString, maxDecimal } = useMemo(() => {
    const balanceInfo = getTokenBalanceUiAmount({ mint: token?.address || '', decimals: token?.decimals })
    const balanceAmount = balanceInfo.amount
    const balanceMaxString_ = hideBalance
      ? null
      : trimTrailZero(balanceAmount.mul(maxMultiplier || 1).toFixed(token?.decimals ?? 6, Decimal.ROUND_FLOOR))
    const maxString_ = forceBalanceAmount ? trimTrailZero(String(forceBalanceAmount)) : balanceMaxString_
    const maxDecimal_ = forceBalanceAmount ? new Decimal(forceBalanceAmount) : balanceAmount
    return {
      balanceMaxString: balanceMaxString_,
      maxString: maxString_,
      maxDecimal: maxDecimal_
    }
  }, [forceBalanceAmount, getTokenBalanceUiAmount, hideBalance, maxMultiplier, token?.address, token?.decimals])

  const displayTokenSettings = useAppStore((s) => s.displayTokenSettings)

  const [unknownToken, setUnknownToken] = useState<TokenInfo | ApiV3Token>()
  const [freezeToken, setFreezeToken] = useState<TokenInfo | ApiV3Token>()

  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), [])

  const [isFocus, setIsFocus] = useState(false)
  const handleFocus = useEvent(() => {
    setIsFocus(true)
    if (value === '0') {
      onChange?.('')
    }
    onFocus?.()
  })
  const handleBlur = useEvent(() => {
    setIsFocus(false)
  })

  const getBalanceString = useEvent((amount: string) => {
    if (token?.address !== SOL_INFO.address || !balanceMaxString) return amount
    if (new Decimal(balanceMaxString).sub(amount).gte(solReserveAmount)) return amount
    let decimal = new Decimal(amount).sub(solReserveAmount)
    if (decimal.lessThan(0)) decimal = new Decimal(0)
    return trimTrailZero(decimal.toFixed(token.decimals))!
  })

  const handleClickMax = useEvent(() => {
    if (disableClickBalance) return
    if (!maxString) return
    handleFocus()
    onChange?.(getBalanceString(maxString))
  })

  const handleClickHalf = useEvent(() => {
    if (!maxString) return
    handleFocus()
    onChange?.(getBalanceString(maxDecimal.div(2).toString()))
  })

  const isUnknownToken = useEvent((token_: TokenInfo) => {
    const isUnknown = !token_.type || token_.type === 'unknown' || token_.tags.includes('unknown')
    const isTrusted = isUnknown && !!tokenMap.get(token_.address)?.userAdded
    const isUserAddedTokenEnable = displayTokenSettings.userAdded
    return isUnknown && (!isTrusted || !isUserAddedTokenEnable)
  })

  const isFreezeToken = useEvent((token_: TokenInfo | ApiV3Token) => {
    return token_?.tags.includes('hasFreeze') && !whiteListMap.has(token_.address)
  })

  const handleSelectToken = useEvent((token_: TokenInfo) => {
    const isFreeze = isFreezeToken(token_)
    if (isFreeze) {
      setFreezeToken(token_)
    }
    const shouldShowUnknownTokenConfirm = isUnknownToken(token_)
    if (shouldShowUnknownTokenConfirm) {
      setUnknownToken(token_)
      onOpenUnknownTokenConfirm()
      return
    }
    if (isFreeze) {
      if (name === 'swap') {
        onOpenFreezeTokenConfirm()
        return
      }
    }
    onTokenChange?.(token_)
    onClose()
  })

  const handleUnknownTokenConfirm = useEvent((token_: TokenInfo | ApiV3Token) => {
    setExtraTokenListAct({ token: { ...token_, userAdded: true } as TokenInfo, addToStorage: true, update: true })
    onCloseUnknownTokenConfirm()
    const isFreeze = isFreezeToken(token_)
    if (isFreeze) {
      if (name === 'swap') {
        onOpenFreezeTokenConfirm()
        return
      }
    }
    onTokenChange?.(token_)
    setTimeout(() => {
      onTokenChange?.(token_)
    }, 0)
    onClose()
  })

  const handleFreezeTokenConfirm = useEvent((token_: TokenInfo | ApiV3Token) => {
    onTokenChange?.(token_)
    onCloseFreezeTokenConfirm()
    onClose()
  })
  const tokenListRef = useRef<TokenListHandles>(null)
  const handleFreezeTokenCancel = useEvent(() => {
    onCloseFreezeTokenConfirm()
    if (tokenListRef.current) {
      tokenListRef.current.resetSearch()
    }
  })

  useEffect(() => {
    if (!defaultUnknownToken) return
    handleSelectToken(defaultUnknownToken)
  }, [handleSelectToken, defaultUnknownToken?.address])

  useImperativeHandle(actionRef, () => ({
    refreshPrice
  }))

  return (
    <Box position="relative" rounded={12} sx={ctrSx}>
      {disableTotalInputByMask ? (
        <Box
          rounded="inherit"
          position="absolute"
          inset={0}
          zIndex={1}
          display="grid"
          placeContent="center"
          bg="#0003"
          backdropFilter="blur(4px)"
          {...renderMaskProps}
        >
          {renderMaskContent}
        </Box>
      ) : null}
      <HStack
        pointerEvents={disableTotalInputByMask ? 'none' : 'initial'}
        px={sizes.downerUpperGridPx}
        py={sizes.upperGridPy}
        {...(topBlockSx || {})}
      >
        {/* top left label */}
        <Box fontSize="sm" fontWeight={500}>
          {topLeftLabel}
        </Box>
        <Spacer />

        {/* balance */}
        {!hideBalance && maxString && (
          <HStack spacing={0.5} color={colors.textSubtle} fontSize="xs" fontWeight={600}>
            {renderTopRightPrefixLabel()}
            <Text onClick={handleClickMax} cursor="pointer">
              {formatCurrency(maxString, { decimalPlaces: token?.decimals })}
            </Text>
          </HStack>
        )}

        {/* buttons */}
        {hideControlButton ? null : (
          <HStack>
            <Button disabled={disableClickBalance} onClick={handleClickMax} {...linkButtonStyle}>
              {t('input.max_button')}
            </Button>
            <Button disabled={disableClickBalance} onClick={handleClickHalf} {...linkButtonStyle}>
              50%
            </Button>
          </HStack>
        )}
      </HStack>

      <Grid
        {...inputCard}
        gridTemplate={`
        "token input" auto
        "token price" auto / auto 1fr
        `}
        columnGap={[2, 4]}
        alignItems="center"
        pointerEvents={disableTotalInputByMask ? 'none' : 'initial'}
        width={width}
        sx={sx}
        px={sizes.downerUpperGridPx}
        py={2}
        opacity={loading ? 0.8 : 1}
        boxShadow={isFocus ? inputFocusStyle.boxShadow : 'none'}
      >
        <GridItem area="token" color={colors.textSecondary} fontWeight={600} fontSize={sizes.tokenSymbol}>
          <HStack
            bg={disableSelectToken ? undefined : colors.backgroundLight}
            rounded={disableSelectToken ? undefined : 12}
            px={disableSelectToken ? undefined : 3}
            py={disableSelectToken ? undefined : 2.5}
            cursor={disableSelectToken ? undefined : 'pointer'}
            onClick={disableSelectToken ? undefined : onOpen}
          >
            {hideTokenIcon ? null : (
              <TokenAvatar token={token} size={disableSelectToken ? sizes.disableSelectTokenIconSize : sizes.tokenIcon} />
            )}
            <Text color={colors.textPrimary}>{token?.symbol || ' '}</Text>
            {disableSelectToken ? undefined : <ChevronDownIcon width={20} height={20} />}
          </HStack>
        </GridItem>

        <GridItem area="input" color={colors.textPrimary} fontWeight={600} fontSize={sizes.inputText}>
          <NumericFormat
            inputMode="decimal"
            decimalScale={token?.decimals}
            value={typeof value === 'undefined' ? '' : value}
            thousandSeparator={thousandSeparator}
            decimalSeparator={detectedSeparator}
            allowNegative={false}
            valueIsNumericString
            placeholder=""
            name={name}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={readonly || loading}
            min={0}
            id={id}
            onChange={(e) => {
              const targetValue = e?.currentTarget?.value.replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
              const rawValue = targetValue === detectedSeparator ? '0.' : targetValue.replace(detectedSeparator, '.')
              if (Number.isNaN(rawValue)) return
              onChange?.(rawValue)
            }}
            style={{
              textAlign: 'end',
              background: 'transparent',
              opacity: loading ? 0.2 : 1,
              width: width || '100%'
            }}
          />
        </GridItem>
        <GridItem area="price" color={colors.textTertiary} fontSize={sizes.opacityVolume}>
          <Text textAlign="right">~{formatCurrency(totalPrice, { symbol: '$', maximumDecimalTrailingZeroes: 5 })}</Text>
        </GridItem>
      </Grid>
      <TokenSelectDialog isOpen={isOpen} onClose={onClose} onSelectValue={handleSelectToken} filterFn={filterFn} ref={tokenListRef} />
      {unknownToken !== undefined && (
        <TokenUnknownAddDialog
          isOpen={isOpenUnknownTokenConfirm}
          onClose={onCloseUnknownTokenConfirm}
          token={unknownToken}
          onConfirm={handleUnknownTokenConfirm}
        />
      )}
      {freezeToken !== undefined && (
        <TokenFreezeDialog
          isOpen={isOpenFreezeTokenConfirm}
          onClose={handleFreezeTokenCancel}
          token={freezeToken}
          onConfirm={handleFreezeTokenConfirm}
        />
      )}
    </Box>
  )
}

export default TokenInput
