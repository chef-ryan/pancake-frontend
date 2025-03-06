import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, Button, Flex, FlexGap, MinusIcon, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import BN from 'bignumber.js'
import { LightCard } from 'components/Card'
import { DoubleCurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { Collapse } from 'components/widgets/swap-v2/Collapse'
import { MAXIMUM_SIGNIFICANT_DIGITS } from 'config/constants/exchange'
import { ADDRESS_CONCAT_LENGTH, LP_TOKEN_DECIMALS } from 'config/constants/formatting'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { formatBigNumber } from 'ton/utils/formatting'
import { truncateHash } from 'utils'
import { getAddLiquidityLink, getRemoveLiquidityLink } from 'utils/getLink'
import { unwrappedToken } from 'utils/tokens/unwrappedToken'

const appearUpAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledButton = styled(Button).attrs({ variant: 'tertiary', scale: 'sm' })`
  width: 100%;
  font-size: 14px;
  height: 28px;
  padding-right: 8px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.radii['12px']};
  color: ${({ theme }) => theme.colors.primary60};

  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 16px;
    height: 32px;
  }
`

const AppearLightCard = styled(LightCard)`
  animation: ${appearUpAnimation} 0.4s ease-out forwards;
  will-change: transform, opacity;
`

interface LiquidityRowProps {
  token0: string
  token1: string
  amount0?: BN
  amount1?: BN
  balance?: BN
  userShare?: number
}

export const LiquidityRow = ({
  token0,
  token1,
  balance = BN(0),
  amount0 = BN(0),
  amount1 = BN(0),
  userShare = 0,
}: LiquidityRowProps) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const [isOpen, setIsOpen] = useState(false)

  const { data: currency0 } = useAtomValue(tokenByAddressQueryAtom(token0))
  const { data: currency1 } = useAtomValue(tokenByAddressQueryAtom(token1))

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  const [symbol0, symbol1] = useMemo(
    () => [
      unwrappedToken(currency0)?.symbol ?? currency0?.symbol ?? truncateHash(token0, ADDRESS_CONCAT_LENGTH),
      unwrappedToken(currency1)?.symbol ?? currency1?.symbol ?? truncateHash(token1, ADDRESS_CONCAT_LENGTH),
    ],
    [currency0, currency1, token0, token1],
  )

  if (!token0 || !token1) {
    return null
  }

  return (
    <>
      <AppearLightCard>
        <Collapse
          title={
            <FlexGap flexDirection="column" gap="2px">
              <FlexGap gap="8px">
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={28} overlap />
                <FlexGap flexDirection="column">
                  <Text>
                    {symbol0}-{symbol1} LP
                  </Text>
                  <NumberDisplay
                    value={formatBigNumber(balance, LP_TOKEN_DECIMALS).toString()}
                    maximumSignificantDigits={MAXIMUM_SIGNIFICANT_DIGITS}
                    small
                    bold
                    color="textSubtle"
                  />
                </FlexGap>
              </FlexGap>
            </FlexGap>
          }
          content={
            <Box mt="8px">
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle" fontSize={['14px', null, '16px']}>
                  {t('Pooled %symbol%', { symbol: symbol0 })}
                </Text>

                <Text fontSize={['14px', null, '16px']}>
                  {amount0.gt(0) ? formatBigNumber(amount0, LP_TOKEN_DECIMALS) : '-'}
                </Text>
              </Flex>
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle" fontSize={['14px', null, '16px']}>
                  {t('Pooled %symbol%', { symbol: symbol1 })}
                </Text>

                <Text fontSize={['14px', null, '16px']}>
                  {amount1.gt(0) ? formatBigNumber(amount1, LP_TOKEN_DECIMALS) : '-'}
                </Text>
              </Flex>
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle" fontSize={['14px', null, '16px']}>
                  {t('Your share in the pool')}
                </Text>
                {userShare ? (
                  <NumberDisplay
                    value={userShare}
                    suffix="%"
                    maximumSignificantDigits={6}
                    fontSize={['14px', null, '16px']}
                  />
                ) : (
                  '-'
                )}
              </Flex>
              <FlexGap mt="10px" justifyContent="space-between" gap={isMobile ? '8px' : '16px'}>
                <Link href={getAddLiquidityLink(currency0, currency1)} style={{ width: '100%' }}>
                  <StyledButton endIcon={<AddIcon color="primary60" />}>{t('Add')}</StyledButton>
                </Link>
                <Link href={getRemoveLiquidityLink(currency0, currency1)} style={{ width: '100%' }}>
                  <StyledButton endIcon={<MinusIcon color="primary60" />}>{t('Remove')}</StyledButton>
                </Link>
              </FlexGap>
            </Box>
          }
          isOpen={isOpen}
          onToggle={handleToggle}
        />
      </AppearLightCard>
    </>
  )
}
