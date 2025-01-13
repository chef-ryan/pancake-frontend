// import { TonConnectButton } from '@tonconnect/ui-react'

import { useTranslation } from '@pancakeswap/localization'
import { CogIcon, Flex, FlexGap, LinkExternal, LogoIcon, OpenNewIcon, ShareIcon, Tag, Text } from '@pancakeswap/uikit'
import { bridgeLink } from 'config/constants/endpoints'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'
import { networkAtom } from 'ton/atom/networkAtom'

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

  return (
    <StyledHeader>
      <Flex alignItems="center">
        <LogoIcon width={24} />

        <Flex ml="-4px" alignItems="center">
          {/* TODO: Move TON logo to assets */}
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
        <CogIcon width={24} color="textSubtle" />
        <ShareIcon width={24} color="textSubtle" />
      </FlexGap>
      {/* <TonConnectButton /> */}
    </StyledHeader>
  )
}
