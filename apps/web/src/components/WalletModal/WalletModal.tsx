import { getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import {
  ArrowForwardIcon,
  Box,
  Button,
  ButtonMenu,
  ButtonMenuItem,
  FlexGap,
  Heading,
  Modal,
  Skeleton,
  Text,
} from '@pancakeswap/uikit'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { useAddressBalance } from 'hooks/useAddressBalance'
import useAuth from 'hooks/useAuth'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import ReceiveModal from './ReceiveModal'
import { CopyAddress } from './WalletCopyButton'

interface WalletModalProps {
  account?: string
  onDismiss: () => void
}

const StyledModal = styled(Modal)`
  width: 100%;
  max-width: 400px;
  background: #27262c; /* Dark background */
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
`

const ModalHeader = styled(FlexGap)`
  padding: 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: none;
`

const AddressBox = styled(FlexGap)`
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const AddressLabel = styled(Text)`
  color: #b8a8ee; /* Light purple color */
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`

const AddressContainer = styled(FlexGap)`
  background-color: #353547; /* Darker background for address */
  border-radius: 16px;
  padding: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 16px;
`

const WalletIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  margin-right: 8px;
`

const TotalBalanceBox = styled(Box)`
  padding: 24px;
  text-align: left;
`

const TotalBalance = styled(Heading)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 8px;
`

const StyledButtonMenu = styled(ButtonMenu)`
  width: 100%;
  background-color: #27262c; /* Dark background */
  border-radius: 16px;
  padding: 0;
  margin: 0;
  border: none;
`

const StyledButtonMenuItem = styled(ButtonMenuItem)`
  height: 48px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  padding: 0 12px;

  &:hover:not(:disabled):not(:active) {
    background-color: #353547;
  }

  &.active {
    background-color: #b8a8ee; /* Light purple when active */
    color: #27262c; /* Dark text on active tab */
  }
`

const AssetList = styled(Box)`
  max-height: 440px;
  overflow-y: auto;
  padding: 0 8px;
`

const AssetItem = styled(FlexGap)`
  padding: 4px 4px;
  margin-bottom: 8px;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`

const TokenIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
  }
`

const ActionButtonsContainer = styled(FlexGap)`
  padding: 16px;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
`

const ActionButton = styled(Button)`
  width: 100%;
  border-radius: 16px;
  height: 48px;
  background: ${({ theme, variant }) => (variant === 'tertiary' ? 'transparent' : theme.colors.primary)};
  color: ${({ theme, variant }) => (variant === 'tertiary' ? theme.colors.primary : theme.colors.invertedContrast)};
  font-size: 16px;
  font-weight: 600;

  &:hover {
    opacity: 0.8;
  }
`

const BridgeButton = styled(ActionButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const DisconnectButton = styled(Button)`
  width: 100%;
  border-radius: 16px;
  height: 48px;
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;

  &:hover {
    opacity: 0.8;
  }
`

const WalletModal: React.FC<WalletModalProps> = ({ account, onDismiss }) => {
  // If no account is provided, show a message or redirect
  if (!account) {
    return null
  }
  return (
    <StyledModal title="" onDismiss={onDismiss} hideCloseButton>
      <WalletContent account={account} onDismiss={onDismiss} />
    </StyledModal>
  )
}

export const WalletContent = ({ account, onDismiss }: { account: string | undefined; onDismiss: () => void }) => {
  const { t } = useTranslation()
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const router = useRouter()

  const { logout } = useAuth()

  // Fetch balances using the hook we created
  const { balances, isLoading, totalBalanceUsd, getTopBalances } = useAddressBalance(account, {
    includeSpam: false,
    onlyWithPrice: true,
  })

  // Get top tokens by value
  const topTokens = getTopBalances(10)
  const handleLogout = () => {
    logout()
    onDismiss()
  }
  return (
    <Box minWidth="357px">
      <FlexGap mb="10px" gap="8px" justifyContent="space-between" alignItems="center" paddingRight="16px">
        <CopyAddress tooltipMessage={t('Copied')} account={account || ''} />
        <FlexGap>
          <Button scale="sm" variant="tertiary" onClick={handleLogout}>
            {t('Logout')}
          </Button>
        </FlexGap>
      </FlexGap>
      <Box padding="0 16px 16px">
        <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
          {t('My Wallet')}
        </Text>
        <AssetList>
          {isLoading ? (
            <FlexGap justifyContent="center" padding="40px" flexDirection="column" gap="8px">
              <Skeleton height="80px" width="100%" />
              <Skeleton height="80px" width="100%" />
              <Skeleton height="80px" width="100%" />
              <Skeleton height="80px" width="100%" />
            </FlexGap>
          ) : (
            topTokens.map((asset) => (
              <AssetItem key={asset.id}>
                <FlexGap alignItems="center">
                  <TokenIcon>
                    <CurrencyLogo
                      currency={
                        new Token(
                          asset.chainId,
                          asset.token.address.startsWith('0x')
                            ? (asset.token.address as `0x${string}`)
                            : (`0x${asset.token.address}` as `0x${string}`),
                          asset.token.decimals,
                          asset.token.symbol,
                          asset.token.name,
                        )
                      }
                      size="40px"
                    />
                  </TokenIcon>
                  <Box>
                    <FlexGap alignItems="center">
                      <Text bold fontSize="16px">
                        {asset.token.symbol}
                      </Text>
                      <Text ml="8px" color="textSubtle" fontSize="14px">
                        {asset.token.name}
                      </Text>
                    </FlexGap>

                    <Text fontSize="12px" color="textSubtle" textTransform="uppercase">
                      {getChainName(asset.chainId)} {t('Chain')}
                    </Text>
                  </Box>
                </FlexGap>
                <Box style={{ textAlign: 'right' }}>
                  <Text bold fontSize="16px">
                    {parseFloat(asset.quantity).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <Text color="success" fontSize="14px">
                    ${asset.price?.totalUsd ? formatAmount(asset.price.totalUsd) : '0.00'}
                  </Text>
                </Box>
              </AssetItem>
            ))
          )}
        </AssetList>
      </Box>
      <ActionButtonsContainer>
        <FlexGap gap="16px" width="100%">
          <ActionButton
            onClick={() => {
              router.push('/buy-crypto')
              onDismiss()
            }}
          >
            {t('Buy Crypto')}
          </ActionButton>
          <ActionButton onClick={() => setIsReceiveModalOpen(true)}>{t('Receive')}</ActionButton>
        </FlexGap>
        {isReceiveModalOpen && account && (
          <ReceiveModal account={account} onDismiss={() => setIsReceiveModalOpen(false)} isOpen={isReceiveModalOpen} />
        )}
        <Button
          variant="text"
          onClick={() => {
            router.push('/bridge')
            onDismiss()
          }}
        >
          {t('Bridge Crypto')}
          <ArrowForwardIcon color="primary" />
        </Button>
      </ActionButtonsContainer>{' '}
    </Box>
  )
}

export default WalletModal
