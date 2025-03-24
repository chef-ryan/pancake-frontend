import { useTranslation } from '@pancakeswap/localization'
import { Box, SortArrowIcon, Text, WaterDropletIcon } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import styled from 'styled-components'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import { ConnectWalletButton } from './Buttons/ConnectWalletButton'
import { NetworkButton } from './Buttons/NetworkButton'

const FloatingBox = styled(Box)`
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  z-index: 10;

  display: flex;
  justify-content: center;
  align-items: center;
`

const Navigation = styled(Box)`
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 24px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.invertedContrast};
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);

  width: 90%;

  ${({ theme }) => theme.mediaQueries.sm} {
    gap: 24px;
    padding: 12px 16px 12px 32px;
    justify-content: center;
    width: auto;
  }
`

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    text-decoration: none;
  }
`

const StyledText = styled(Text)`
  font-size: 13px;
`

export const FloatingNavigation = () => {
  const { t } = useTranslation()

  const router = useRouter()

  const isConnected = useAtomValue(isConnectedAtom)

  const isActive = useCallback((path: string) => router.pathname === path, [router.pathname])
  const getItemColor = useCallback((path: string) => (isActive(path) ? 'secondary' : 'textSubtle'), [isActive])

  return (
    <>
      <FloatingBox>
        <Navigation>
          <StyledLink href="/">
            <SortArrowIcon color={getItemColor('/')} width={24} style={{ transform: 'rotate(90deg)' }} />
            <StyledText color={getItemColor('/')} bold={isActive('/')}>
              {t('Swap')}
            </StyledText>
          </StyledLink>
          <StyledLink href="/liquidity">
            <WaterDropletIcon color={getItemColor('/liquidity')} width={16} height={22} />
            <StyledText mt="3px" color={getItemColor('/liquidity')} bold={isActive('/liquidity')}>
              {t('Liquidity')}
            </StyledText>
          </StyledLink>
          {!isConnected && <NetworkButton />}
          <ConnectWalletButton />
        </Navigation>
      </FloatingBox>
    </>
  )
}
