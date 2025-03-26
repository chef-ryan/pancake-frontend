import { useTranslation } from '@pancakeswap/localization'
import {
  CogIcon,
  Flex,
  FlexGap,
  IconButton,
  LinkExternal,
  LogoIcon,
  OpenNewIcon,
  ShareIcon,
  Text,
  ThemeSwitcher,
  useMatchBreakpoints,
  useModalV2,
} from '@pancakeswap/uikit'
import { bridgeLink } from 'config/constants/endpoints'
import { useTheme } from 'next-themes'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Logo } from './Logo'
import { SettingsModal } from './Modals/SettingsModal'

const StyledHeader = styled.header`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 16px 24px;
  align-items: center;
`

const StyledLinkExternal = styled(LinkExternal)`
  color: ${({ theme }) => theme.colors.textSubtle};
  gap: 4px;
  cursor: pointer;
`

export const Header = () => {
  const { t } = useTranslation()

  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  const { resolvedTheme, setTheme } = useTheme()
  const isDark = useMemo(() => resolvedTheme === 'dark', [resolvedTheme])

  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd

  const shareData = useMemo(
    () => ({
      title: t('TON | PancakeSwap'),
      text: t('Trade on PancakeSwap TON'),
      url: window.location.href,
    }),
    [t],
  )

  const handleShareClick = useCallback(() => {
    if (navigator.canShare?.(shareData)) {
      navigator.share(shareData)
    }
  }, [shareData])

  return (
    <StyledHeader>
      <Flex alignItems="center">
        <LogoIcon width={24} />

        <Flex ml="-4px" alignItems="center">
          <Logo />
          <Text ml="8px">TON</Text>
        </Flex>
      </Flex>

      <FlexGap gap="16px" alignItems="center">
        <StyledLinkExternal href={bridgeLink} showExternalIcon={false}>
          <span>{t('Get TON')}</span>
          <OpenNewIcon color="textSubtle" />
        </StyledLinkExternal>

        {!isSmallScreen && <ThemeSwitcher isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />}
        <IconButton variant="text" scale="sm" onClick={() => setIsOpen(true)}>
          <CogIcon width={24} color="textSubtle" />
        </IconButton>
        {navigator.canShare?.(shareData) && (
          <IconButton variant="text" scale="sm" onClick={handleShareClick}>
            <ShareIcon width={24} color="textSubtle" />
          </IconButton>
        )}
      </FlexGap>

      <SettingsModal isOpen={isOpen} onDismiss={onDismiss} />
    </StyledHeader>
  )
}
