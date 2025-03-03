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
  Tag,
  Text,
  useModalV2,
} from '@pancakeswap/uikit'
import { bridgeLink } from 'config/constants/endpoints'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { networkAtom } from 'ton/atom/networkAtom'
import { Logo } from './Logo'
import { SettingsModal } from './Modals/SettingsModal'

const StyledHeader = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 24px;
  align-items: center;
`

const StyledLinkExternal = styled(LinkExternal)`
  color: ${({ theme }) => theme.colors.textSubtle};
  gap: 4px;
  cursor: pointer;
`

interface HeaderProps {
  showBridgeLink?: boolean
}
export const Header = ({ showBridgeLink }: HeaderProps) => {
  const { t } = useTranslation()
  const network = useAtomValue(networkAtom)

  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  const shareData = useMemo(
    () => ({
      title: window.document.title,
      text: t('Trade on PancakeSwap TON'),
      url: window.location.href,
    }),
    [t],
  )

  const handleShareClick = useCallback(() => {
    if (navigator.canShare(shareData)) {
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
          {network === 'testnet' && (
            <Tag variant="textSubtle" scale="sm" px="8px" ml="8px">
              {t('testnet')}
            </Tag>
          )}
        </Flex>
      </Flex>

      <FlexGap gap="16px" alignItems="center">
        {showBridgeLink && (
          <>
            <StyledLinkExternal href={bridgeLink} showExternalIcon={false}>
              <span>{t('Get TON')}</span>
              <OpenNewIcon color="textSubtle" />
            </StyledLinkExternal>
          </>
        )}

        <IconButton variant="text" scale="sm" onClick={() => setIsOpen(true)}>
          <CogIcon width={24} color="textSubtle" />
        </IconButton>
        {navigator.canShare(shareData) && (
          <IconButton variant="text" scale="sm" onClick={handleShareClick}>
            <ShareIcon width={24} color="textSubtle" />
          </IconButton>
        )}
      </FlexGap>

      <SettingsModal isOpen={isOpen} onDismiss={onDismiss} />
    </StyledHeader>
  )
}
