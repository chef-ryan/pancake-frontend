import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, Button, Flex, FlexGap, MinusIcon, Text } from '@pancakeswap/uikit'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { LightCard } from 'components/Card'
import { DisplayLoader } from 'components/Misc/DisplayLoader'
import { DoubleCurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { Collapse } from 'components/widgets/swap-v2/Collapse'
import { ADDRESS_CONCAT_LENGTH, LP_TOKEN_DECIMALS } from 'config/constants/formatting'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { formatBalance } from 'ton/utils/formatting'

const StyledButton = styled(Button).attrs({ variant: 'tertiary', scale: 'sm' })`
  width: 100%;
  border-radius: ${({ theme }) => theme.radii['12px']};
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  color: ${({ theme }) => theme.colors.primary60};
`

interface LiquidityRowProps {
  token0: string
  token1: string
  balance?: bigint
  amount0?: bigint
  amount1?: bigint

  loading: boolean
}

export const LiquidityRow = ({
  token0,
  token1,
  balance = 0n,
  amount0 = 0n,
  amount1 = 0n,
  loading,
}: LiquidityRowProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const { data: currency0 } = useAtomValue(tokenByAddressQueryAtom(token0))
  const { data: currency1 } = useAtomValue(tokenByAddressQueryAtom(token1))

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  if (!token0 || !token1) {
    return null
  }

  const symbol0 =
    currency0?.symbol ?? `${token0.slice(0, ADDRESS_CONCAT_LENGTH)}...${token0.slice(-ADDRESS_CONCAT_LENGTH)}`
  const symbol1 =
    currency1?.symbol ?? `${token1.slice(0, ADDRESS_CONCAT_LENGTH)}...${token1.slice(-ADDRESS_CONCAT_LENGTH)}`

  return (
    <>
      <LightCard>
        <Collapse
          title={
            <FlexGap flexDirection="column" gap="2px">
              <FlexGap gap="8px">
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} />
                <Text>
                  {symbol0}-{symbol1} LP
                </Text>
              </FlexGap>

              <NumberDisplay
                value={formatBalance(balance, LP_TOKEN_DECIMALS).toString()}
                maximumSignificantDigits={4}
                small
                bold
                color="textSubtle"
              />
            </FlexGap>
          }
          content={
            <Box mt="8px">
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle">{t('Pooled %symbol%', { symbol: symbol0 })}</Text>
                <DisplayLoader loading={loading}>
                  <Text>{amount0 > 0n ? formatBalance(amount0, LP_TOKEN_DECIMALS) : '-'}</Text>
                </DisplayLoader>
              </Flex>
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle">{t('Pooled %symbol%', { symbol: symbol1 })}</Text>
                <DisplayLoader loading={loading}>
                  <Text>{amount1 > 0n ? formatBalance(amount1, LP_TOKEN_DECIMALS) : '-'}</Text>
                </DisplayLoader>
              </Flex>
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle">{t('Your share in the pool')}</Text>
                <Text>-%</Text>
              </Flex>
              <FlexGap mt="10px" justifyContent="space-between" gap="16px">
                <Link href={`/liquidity/add/${token0}/${token1}`} style={{ width: '100%' }}>
                  <StyledButton endIcon={<AddIcon color="primary60" />}>{t('Add')}</StyledButton>
                </Link>
                <Link href={`/liquidity/remove/${token0}/${token1}`} style={{ width: '100%' }}>
                  <StyledButton endIcon={<MinusIcon color="primary60" />}>{t('Remove')}</StyledButton>
                </Link>
              </FlexGap>
            </Box>
          }
          isOpen={isOpen}
          onToggle={handleToggle}
        />
      </LightCard>
    </>
  )
}
