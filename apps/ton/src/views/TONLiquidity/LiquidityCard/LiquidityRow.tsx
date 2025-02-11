import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, Button, Flex, FlexGap, MinusIcon, Text } from '@pancakeswap/uikit'
import { LightCard } from 'components/Card'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { Collapse } from 'components/widgets/swap-v2/Collapse'
import { LP_TOKEN_DECIMALS } from 'config/constants/tokens'
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
  token0?: string
  token1?: string
  balance?: bigint
  amount0?: bigint
  amount1?: bigint
}

export const LiquidityRow = ({ token0, token1, balance = 0n, amount0 = 0n, amount1 = 0n }: LiquidityRowProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  return (
    <>
      <LightCard>
        <Collapse
          title={
            <FlexGap flexDirection="column" gap="2px">
              <Text>
                {token0}-{token1} LP
              </Text>

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
                <Text color="textSubtle">{t('Pooled %symbol%', { symbol: 'token0' })}</Text>
                <Text>{formatBalance(amount0, LP_TOKEN_DECIMALS)}</Text>
              </Flex>
              <Flex mt="5px" justifyContent="space-between">
                <Text color="textSubtle">{t('Pooled %symbol%', { symbol: 'token1' })}</Text>
                <Text>{formatBalance(amount1, LP_TOKEN_DECIMALS)}</Text>
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
