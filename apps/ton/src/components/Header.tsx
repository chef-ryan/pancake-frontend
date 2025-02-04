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
import styled from 'styled-components'
import { networkAtom } from 'ton/atom/networkAtom'
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

  return (
    <StyledHeader>
      <Flex alignItems="center">
        <LogoIcon width={24} />

        <Flex ml="-4px" alignItems="center">
          {/* TODO: Move images to assets */}
          <img src="/images/ton-logo.png" alt="TON" width={26} />
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
        <IconButton variant="text" scale="sm">
          <ShareIcon width={24} color="textSubtle" />
        </IconButton>
      </FlexGap>

      <SettingsModal isOpen={isOpen} onDismiss={onDismiss} />
    </StyledHeader>
  )
}
