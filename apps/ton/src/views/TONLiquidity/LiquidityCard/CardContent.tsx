import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, BoxProps, Button, FlexGap, LoadingDot, Text } from '@pancakeswap/uikit'
import { WalletDisclaimer } from 'components/Card/WalletDisclaimer'
import { DEFAULT_ADD_LIQUIDITY_CURRENCIES } from 'config/constants/commonBases'
import { useUserPools } from 'hooks/liquidity/useUserPools'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import styled from 'styled-components'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import { getAssetUrl } from 'utils'
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
  const chainId = useAtomValue(chainIdAtom)

  const { data: userPools, isFetched } = useUserPools()

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        {!isWalletConnected && <WalletDisclaimer p="64px" text={t('Connect wallet to view your liquidity')} />}

        {isWalletConnected && userPools.length === 0 && (
          <FlexGap flexDirection="column" alignItems="center" gap="16px" p="24px">
            <img src={getAssetUrl('green-box.png')} alt="Empty Box" width={96} />

            <Text color="textSubtle">{!isFetched ? <LoadingDot /> : t('No liquidity found')}</Text>
          </FlexGap>
        )}

        {isWalletConnected && userPools.length > 0 && <LiquidityList />}
      </ContentContainer>

      {isWalletConnected && (
        <StyledCardFooter>
          <Link
            href={`/liquidity/add/${DEFAULT_ADD_LIQUIDITY_CURRENCIES[chainId].currency0}/${DEFAULT_ADD_LIQUIDITY_CURRENCIES[chainId].currency1}`}
          >
            <Button width="100%" endIcon={<AddIcon color="invertedContrast" />}>
              {t('Add Liquidity')}
            </Button>
          </Link>
        </StyledCardFooter>
      )}
    </>
  )
}
