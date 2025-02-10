import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, BoxProps, Button, FlexGap, Text } from '@pancakeswap/uikit'
import { WalletDisclaimer } from 'components/Card/WalletDisclaimer'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import styled from 'styled-components'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import { LiquidityList } from './LiquidityList'

const ContentContainer = styled(Box)<{ $isBottomRounded?: boolean }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme, $isBottomRounded }) =>
    $isBottomRounded ? `0 0 ${theme.radii.card} ${theme.radii.card}` : '0'};
`

const StyledCardFooter = styled(Box)`
  padding: 24px;

  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface CardContentProps extends BoxProps {}
export const CardContent = (props: CardContentProps) => {
  const { t } = useTranslation()
  const isWalletConnected = useAtomValue(isConnectedAtom)
  const liquidityLength: number = 1

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        {!isWalletConnected && <WalletDisclaimer p="64px" text={t('Connect wallet to view your liquidity')} />}

        {isWalletConnected && liquidityLength === 0 && (
          <FlexGap flexDirection="column" alignItems="center" gap="16px" p="24px">
            <img src="/images/green-box.png" alt="Empty Box" width={96} />

            <Text color="textSubtle">{t('No liquidity found')}</Text>
          </FlexGap>
        )}

        {isWalletConnected && liquidityLength > 0 && <LiquidityList />}
      </ContentContainer>

      {isWalletConnected && (
        <StyledCardFooter>
          <Link href="/liquidity/add">
            <Button width="100%" endIcon={<AddIcon color="invertedContrast" />}>
              {t('Add Liquidity')}
            </Button>
          </Link>
        </StyledCardFooter>
      )}
    </>
  )
}
