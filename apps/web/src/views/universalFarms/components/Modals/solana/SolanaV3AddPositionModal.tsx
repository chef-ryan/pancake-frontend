import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { TokenInfo, wSolToSolToken } from '@pancakeswap/solana-core-sdk'
import { Percent, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import {
  ArrowForwardIcon,
  AutoColumn,
  Button,
  Card,
  CardBody,
  Column,
  Flex,
  FlexGap,
  IconButton,
  ModalV2,
  MotionModal,
  PreTitle,
  RowBetween,
  SwapHorizIcon,
  Text,
  TokenLogo,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { formatPercent } from '@pancakeswap/utils/formatFractions'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { Bound } from '@pancakeswap/widgets-internal'
import BN from 'bn.js'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { getCurrencyLogoSrcs } from 'components/TokenImage'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useAddLiquidityAmount } from 'hooks/solana/useAddLiquidityAmount'
import { useAddLiquidityCallback } from 'hooks/solana/useAddLiquidityCallback'
import { useLiquidityAmount, useLiquidityDepositRatio } from 'hooks/solana/useLiquidityAmount'
import { useLiquidityUsdValue } from 'hooks/solana/useLiquidityUsdValue'
import { usePriceRange } from 'hooks/solana/usePriceRange'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useUnifiedCurrencyBalance } from 'hooks/useUnifiedCurrencyBalance'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3Pool } from 'state/pools/solana'
import styled from 'styled-components'
import { maxUnifiedAmountSpend } from 'utils/maxAmountSpend'
import { calculateSolanaTickLimits, getTickAtLimitStatus } from 'views/PoolDetail/utils'
import { SolanaLiquiditySlippageButton } from 'views/Swap/components/SlippageButton'
import { NonEVMChainId } from '@pancakeswap/chains'
import { SolanaV3PoolInfoHeader } from './PooInfoHeader'
import { PriceRangeBar } from './PriceRangeBar'

export type SolanaV3AddPositionModalProps = {
  isOpen: boolean
  onClose: () => void
  pool: SolanaV3PoolInfo
  position: SolanaV3PositionDetail
}

export const SolanaV3AddPositionModal: React.FC<SolanaV3AddPositionModalProps> = ({
  isOpen,
  onClose,
  pool,
  position,
}) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { solanaAccount } = useAccountActiveChain()
  const [fields, setFields] = useState<[string, string]>(['', ''])
  const [sending, setIsSending] = useState(false)
  const poolInfo = pool.rawPool
  const addLiquidity = useAddLiquidityCallback()
  const currency0 = useMemo(
    () => convertRawTokenInfoIntoSPLToken(wSolToSolToken(poolInfo.mintA as TokenInfo)),
    [poolInfo.mintA],
  )
  const currency1 = useMemo(
    () => convertRawTokenInfoIntoSPLToken(wSolToSolToken(poolInfo.mintB as TokenInfo)),
    [poolInfo.mintB],
  )
  const currency0Balance = useUnifiedCurrencyBalance(currency0)
  const currency1Balance = useUnifiedCurrencyBalance(currency1)

  const { amount0, amount1 } = useLiquidityAmount({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  })

  const [focusSide, setFocusSide] = useState<0 | 1 | null>(null)

  const {
    amount0: amount0Add,
    amount1: amount1Add,
    amountSlippage0: amount0AddWithSlippage,
    amountSlippage1: amount1AddWithSlippage,
    liquidity: liquidityAdd,
  } = useAddLiquidityAmount({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    side: focusSide,
    amount: focusSide !== null ? fields[focusSide] : '0',
  })

  useEffect(() => {
    setFields(['', ''])
    setIsSending(false)
  }, [isOpen])

  useEffect(() => {
    if (focusSide === null) return
    const [field0, field1] = fields
    if (focusSide === 1 && amount0AddWithSlippage?.toExact() !== field0) {
      setFields((prev) => [amount0AddWithSlippage?.toExact() ?? '', prev[1]])
    }
    if (focusSide === 0 && amount1AddWithSlippage?.toExact() !== field1) {
      setFields((prev) => [prev[0], amount1AddWithSlippage?.toExact() ?? ''])
    }
  }, [amount0AddWithSlippage, amount1AddWithSlippage, fields[0], fields[1]])

  const handleConfirm = useCallback(async () => {
    if (!liquidityAdd || !amount0AddWithSlippage || !amount1AddWithSlippage) return

    setIsSending(true)
    try {
      await addLiquidity({
        params: {
          poolInfo,
          position,
          liquidity: liquidityAdd,
          amountMaxA: amount0AddWithSlippage.toExact(),
          amountMaxB: amount1AddWithSlippage.toExact(),
        },
        onSent: () => {
          setIsSending(false)
          setFields(['', ''])
          onClose()
        },
        onError: (e: any) => {
          console.error('Add liquidity error:', e)
          setIsSending(false)
        },
        onFinally: () => {
          setIsSending(false)
        },
      })
    } catch (e) {
      console.error(e)
      setIsSending(false)
    }
  }, [addLiquidity, poolInfo, position, liquidityAdd, amount0Add, amount1Add, onClose])

  const handleFieldAInput = useCallback(
    (value: string) => {
      if (value === fields[0]) return
      setFields((prev) => [value, prev[1]])
      setFocusSide(0)
    },
    [fields[0]],
  )
  const handleFieldBInput = useCallback(
    (value: string) => {
      if (value === fields[1]) return
      setFields((prev) => [prev[0], value])
      setFocusSide(1)
    },
    [fields[1]],
  )

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onClose} closeOnOverlayClick>
      <MotionModal
        title={t('Add Liquidity')}
        minWidth={[null, null, '500px']}
        headerPadding="12px 24px"
        headerBorderColor="transparent"
        bodyPadding={isMobile ? '0 16px 16px' : '0 24px 24px'}
        onDismiss={onClose}
      >
        <AutoColumn gap="16px">
          <SolanaV3PoolInfoHeader poolInfo={poolInfo} currency0={currency0} currency1={currency1} position={position} />

          <PriceRangeCard poolInfo={poolInfo} position={position} />

          <PreTitle textTransform="uppercase">{t('Amount of liquidity to add')}</PreTitle>

          <Flex justifyContent="space-between" alignItems="center">
            <Text>{t('Slippage Tolerance')}</Text>
            <SolanaLiquiditySlippageButton />
          </Flex>
          <StyledInputCard gap="0px">
            <CurrencyInputPanelSimplify
              customChainId={NonEVMChainId.SOLANA}
              showUSDPrice
              currency={currency0}
              title={<>&nbsp;</>}
              wrapperProps={{ backgroundColor: 'cardSecondary' }}
              id="add-liquidity-input-tokena"
              showMaxButton
              disabled={position.liquidity.isZero() ? amount0Add?.equalTo(0) : amount0?.equalTo(0)}
              disableCurrencySelect
              defaultValue={amount0?.equalTo(0) ? '' : fields[0] ?? '0'}
              onUserInput={handleFieldAInput}
              onPercentInput={(percent) => {
                setFocusSide(0)
                if (percent === 100) {
                  const max = maxUnifiedAmountSpend(currency0Balance)
                  if (max) {
                    handleFieldAInput(max.toExact() ?? '')
                  }
                } else {
                  handleFieldAInput(currency0Balance?.multiply(new Percent(percent, 100)).toExact() ?? '')
                }
              }}
              maxAmount={currency0Balance}
              onMax={() => {
                const max = maxUnifiedAmountSpend(currency0Balance)
                if (max) {
                  handleFieldAInput(max.toExact() ?? '')
                }
              }}
            />
            <hr />
            <CurrencyInputPanelSimplify
              title={<>&nbsp;</>}
              customChainId={NonEVMChainId.SOLANA}
              showUSDPrice
              currency={currency1}
              wrapperProps={{ backgroundColor: 'cardSecondary' }}
              id="add-liquidity-input-tokenb"
              showMaxButton
              disabled={position.liquidity.isZero() ? amount1Add?.equalTo(0) : amount1?.equalTo(0)}
              disableCurrencySelect
              defaultValue={amount1?.equalTo(0) ? '' : fields[1] ?? '0'}
              onUserInput={handleFieldBInput}
              onPercentInput={(percent) => {
                setFocusSide(1)
                if (percent === 100) {
                  const max = maxUnifiedAmountSpend(currency1Balance)
                  if (max) {
                    handleFieldBInput(max.toExact() ?? '')
                  }
                } else {
                  handleFieldBInput(currency1Balance?.multiply(new Percent(percent, 100)).toExact() ?? '')
                }
              }}
              maxAmount={currency1Balance}
              onMax={() => {
                const max = maxUnifiedAmountSpend(currency1Balance)
                if (max) {
                  handleFieldBInput(max.toExact() ?? '')
                }
              }}
            />
          </StyledInputCard>

          <PositionChanges
            poolInfo={poolInfo}
            position={position}
            liquidityAdd={liquidityAdd}
            amount0Add={amount0Add}
            amount1Add={amount1Add}
          />

          <Button width="100%" disabled={!liquidityAdd} isLoading={sending} onClick={handleConfirm}>
            {sending ? t('Confirming...') : t('Add')}
          </Button>
        </AutoColumn>
      </MotionModal>
    </ModalV2>
  )
}

const StyledInputCard = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.colors.cardSecondary};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 16px;

  hr {
    height: 1px;
    width: calc(100% + 32px);
    border: none;
    background-color: ${({ theme }) => theme.colors.cardBorder};
    margin-left: -16px;
    margin-top: 16px;
    margin-bottom: 0;
  }
`

const PriceRangeCard: React.FC<{
  poolInfo: SolanaV3Pool
  position: SolanaV3PositionDetail
}> = ({ poolInfo, position }) => {
  const { theme } = useTheme()
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const [baseIn, setBaseIn] = useState(true)
  const { priceLower, priceUpper, priceLowerDiffPercent, priceUpperDiffPercent, currentPrice } = usePriceRange({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    baseIn,
  })

  const { ratio0, ratio1 } = useLiquidityDepositRatio({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  })

  const tickAtLimit = useMemo(() => {
    const tickLimits = calculateSolanaTickLimits(poolInfo?.config.tickSpacing)
    return getTickAtLimitStatus(position.tickLower, position.tickUpper, tickLimits)
  }, [poolInfo?.config.tickSpacing, position.tickLower, position.tickUpper])

  return (
    <Card background={theme.colors.cardSecondary}>
      <CardBody>
        <AutoColumn gap="8px">
          <PreTitle textTransform="uppercase">{`${t('price range')} (${t('Min')}-${t('Max')})`}</PreTitle>
          {priceLower && priceUpper && (
            <RowBetween>
              <Column>
                <Text fontSize="12px" bold>
                  {formatTickPrice(priceLower, tickAtLimit, Bound.LOWER, locale)}
                </Text>
                <Text fontSize="10px" color="textSubtle">
                  {formatPercent(priceLowerDiffPercent, 2)}%
                </Text>
              </Column>
              <Text fontSize="12px" color="textSubtle">
                -
              </Text>
              <Column justifyContent="flex-end">
                <Text fontSize="12px" bold>
                  {formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER, locale)}
                </Text>
                <Text fontSize="10px" color="textSubtle">
                  {formatPercent(priceUpperDiffPercent, 2)}%
                </Text>
              </Column>
            </RowBetween>
          )}
          <PriceRangeBar priceLowerDiffPercent={priceLowerDiffPercent} priceUpperDiffPercent={priceUpperDiffPercent} />
          <RowBetween>
            <Text fontSize="14px" color="textSubtle">
              {t('Current Price')}:
            </Text>
            <FlexGap gap="8px" alignItems="center">
              <Text fontSize="14px">{currentPrice ? formatNumber(currentPrice.toSignificant(6)) : '-'} </Text>
              <Text fontSize="14px" color="textSubtle">
                <Flex alignItems="center">
                  {t('of %quote% per %base%', {
                    quote: baseIn ? poolInfo.mintB.symbol : poolInfo.mintA.symbol,
                    base: baseIn ? poolInfo.mintA.symbol : poolInfo.mintB.symbol,
                  })}
                  <IconButton variant="text" scale="xs">
                    <SwapHorizIcon color="textSubtle" ml="2px" onClick={() => setBaseIn(!baseIn)} />
                  </IconButton>
                </Flex>
              </Text>
            </FlexGap>
          </RowBetween>
          {ratio0 && ratio1 && (
            <RowBetween>
              <Text fontSize="14px" color="textSubtle">
                {t('Deposit Ratio')}:
              </Text>
              <FlexGap gap="8px" alignItems="center">
                <Text fontSize="14px">
                  {`${formatPercent(ratio0, 2)}% ${poolInfo.mintA.symbol}`} /{' '}
                  {`${formatPercent(ratio1, 2)}% ${poolInfo.mintB.symbol}`}
                </Text>
              </FlexGap>
            </RowBetween>
          )}
        </AutoColumn>
      </CardBody>
    </Card>
  )
}

const Changes: React.FC<{
  from: React.ReactNode
  to: React.ReactNode | undefined
}> = ({ from, to }) => {
  return (
    <FlexGap gap="8px">
      {from}
      {to && (
        <>
          <ArrowForwardIcon color="textSubtle" />
          {to}
        </>
      )}
    </FlexGap>
  )
}

const PositionChanges: React.FC<{
  poolInfo: SolanaV3Pool
  position: SolanaV3PositionDetail
  amount0Add: UnifiedCurrencyAmount<UnifiedCurrency> | undefined
  amount1Add: UnifiedCurrencyAmount<UnifiedCurrency> | undefined
  liquidityAdd: BN | undefined
}> = ({ poolInfo, position, liquidityAdd, amount0Add, amount1Add }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const currency0 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintA as TokenInfo), [poolInfo?.mintA])
  const currency1 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintB as TokenInfo), [poolInfo?.mintB])
  const { amount0, amount1 } = useLiquidityAmount({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  })

  const { totalUsdValue } = useLiquidityUsdValue({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  })

  const { totalUsdValue: totalUsdValueAdd } = useLiquidityUsdValue({
    poolInfo,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: liquidityAdd,
  })
  return (
    <Card background={theme.colors.cardSecondary}>
      <CardBody>
        <AutoColumn gap="8px">
          <RowBetween>
            <PreTitle textTransform="uppercase">{t('Position')}</PreTitle>

            <Changes
              from={
                <Text fontSize="14px" color="textSubtle">
                  {t('Current')}
                </Text>
              }
              to={
                liquidityAdd ? (
                  <Text fontSize="14px" color="textSubtle">
                    {t('New Balance')}
                  </Text>
                ) : undefined
              }
            />
          </RowBetween>
          <RowBetween>
            <FlexGap gap="8px">
              <TokenLogo
                srcs={getCurrencyLogoSrcs(currency0)}
                sizes="xs"
                width={24}
                height={24}
                style={{ borderRadius: '50%' }}
              />
              <Text fontSize="14px" color="textSubtle">
                {currency0.symbol}
              </Text>
            </FlexGap>
            <Changes
              from={
                <Text fontSize="14px" color="textSubtle">
                  {formatNumber(amount0?.toExact() ?? 0)}
                </Text>
              }
              to={
                amount0Add && amount0 ? (
                  <Text fontSize="14px" color="textSubtle">
                    {formatNumber(amount0Add.add(amount0).toExact() ?? 0)}
                  </Text>
                ) : undefined
              }
            />
          </RowBetween>
          <RowBetween>
            <FlexGap gap="8px">
              <TokenLogo
                srcs={getCurrencyLogoSrcs(currency1)}
                sizes="xs"
                width={24}
                height={24}
                style={{ borderRadius: '50%' }}
              />
              <Text fontSize="14px" color="textSubtle">
                {currency1.symbol}
              </Text>
            </FlexGap>
            <Changes
              from={
                <Text fontSize="14px" color="textSubtle">
                  {formatNumber(amount1?.toExact() ?? 0)}
                </Text>
              }
              to={
                amount1Add && amount1 ? (
                  <Text fontSize="14px" color="textSubtle">
                    {formatNumber(amount1Add.add(amount1).toExact() ?? 0)}
                  </Text>
                ) : undefined
              }
            />
          </RowBetween>
          <RowBetween>
            <PreTitle textTransform="uppercase">{t('total position value (USD)')}</PreTitle>
            <Changes
              from={
                <Text fontSize="14px" color="textSubtle">
                  ~${formatNumber(totalUsdValue?.toNumber() ?? 0)}
                </Text>
              }
              to={
                totalUsdValueAdd && totalUsdValue ? (
                  <Text fontSize="14px" color="textSubtle">
                    ~${formatNumber(totalUsdValueAdd.plus(totalUsdValue).toNumber() ?? 0)}
                  </Text>
                ) : undefined
              }
            />
          </RowBetween>
        </AutoColumn>
      </CardBody>
    </Card>
  )
}
