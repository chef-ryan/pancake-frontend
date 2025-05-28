import { getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import {
  ArrowForwardIcon,
  Box,
  Button,
  ButtonMenu,
  FlexGap,
  Modal,
  ModalHeader,
  ModalV2,
  Skeleton,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ASSETS_CDN } from 'config'
import { useAddressBalance } from 'hooks/useAddressBalance'
import useAuth from 'hooks/useAuth'
import useTheme from 'hooks/useTheme'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import { CopyAddress } from './WalletCopyButton'

interface WalletModalProps {
  isOpen: boolean
  account?: string
  onDismiss: () => void
  onReceiveClick: () => void
}

const StyledModal = styled(Modal)`
  width: 100%;
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  ${ModalHeader} {
    display: none;
  }
`

const TotalBalanceInteger = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const TotalBalanceDecimal = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`

const StyledButtonMenu = styled(ButtonMenu)`
  width: 100%;
  background-color: #27262c; /* Dark background */
  border-radius: 16px;
  padding: 0;
  margin: 0;
  border: none;
`

const AssetList = styled(Box)`
  max-height: 280px;
  overflow-y: auto;
  padding: 0 4px;
  ${({ theme }) => theme.mediaQueries.md} {
    max-height: 440px;
    padding: 0 8px;
  }
`

const AssetItem = styled(FlexGap)`
  padding: 4px 4px;
  margin-bottom: 8px;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`

const TokenIcon = styled(Box)`
  width: 40px;
  height: 40px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const ChainIconWrapper = styled(Box)`
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
`

const ActionButtonsContainer = styled(FlexGap)`
  padding: 8px 16px 16px 16px;
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

const OptionBox = styled(Box)`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 24px;
  padding: 16px;
  width: 45%;
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  text-align: center;
  cursor: pointer;
`

const WalletModal: React.FC<WalletModalProps> = ({ account, onDismiss, isOpen, onReceiveClick }) => {
  // If no account is provided, show a message or redirect
  if (!account) {
    return null
  }
  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <StyledModal title={undefined} onDismiss={onDismiss} hideCloseButton>
        <WalletContent account={account} onDismiss={onDismiss} onReceiveClick={onReceiveClick} />
      </StyledModal>
    </ModalV2>
  )
}

export const WalletContent = ({
  account,
  onDismiss,
  onReceiveClick,
}: {
  account: string | undefined
  onDismiss: () => void
  onReceiveClick: () => void
}) => {
  const { t } = useTranslation()

  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const { logout } = useAuth()
  const { theme } = useTheme()

  // Fetch balances using the hook we created
  const { balances, isLoading, totalBalanceUsd } = useAddressBalance(account, {
    includeSpam: false,
    onlyWithPrice: true,
  })
  const balanceDisplay = useMemo(() => {
    const display = formatAmount(totalBalanceUsd)?.split('.')
    return {
      integer: display?.[0] || '',
      decimal: display?.[1] || '',
    }
  }, [totalBalanceUsd])

  // Get top tokens by value
  const topTokens = balances
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
      <Box padding={isMobile ? '0 8px 8px' : '0 16px 16px'}>
        <FlexGap alignItems="center" gap="3px">
          <TotalBalanceInteger>${balanceDisplay.integer}</TotalBalanceInteger>
          <TotalBalanceDecimal>.{balanceDisplay.decimal}</TotalBalanceDecimal>
        </FlexGap>
        <Text fontSize="20px" textTransform="uppercase" fontWeight="bold" mb="8px">
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
          ) : topTokens.length === 0 ? null : (
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
                      src={asset.token.logoURI}
                      size="40px"
                    />
                    <ChainIconWrapper>
                      <img
                        src={`${ASSETS_CDN}/web/chains/svg/${asset.chainId}.svg`}
                        alt={getChainName(asset.chainId)}
                        width="12px"
                        height="12px"
                      />
                    </ChainIconWrapper>
                  </TokenIcon>
                  <Box>
                    <FlexGap alignItems="center">
                      <Text
                        bold
                        fontSize="16px"
                        style={{
                          maxWidth: '70px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.token.symbol}
                      </Text>
                      <Text
                        ml="8px"
                        color="textSubtle"
                        fontSize="14px"
                        style={{
                          maxWidth: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.token.name}
                      </Text>
                    </FlexGap>

                    <Text fontSize="12px" color="textSubtle" textTransform="uppercase">
                      {getChainName(asset.chainId)} {t('Chain')}
                    </Text>
                  </Box>
                </FlexGap>
                <Box style={{ textAlign: 'right' }}>
                  <Text bold fontSize="14px">
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
      {topTokens.length === 0 && !isLoading ? (
        <Box padding="24px 16px">
          <Text color="textSubtle" textAlign="center" mb="16px">
            {t("Looks like it's a new one, get it funded now:")}
          </Text>
          <FlexGap gap="16px" justifyContent="center" flexWrap="wrap">
            <OptionBox
              onClick={() => {
                router.push('/buy-crypto')
                onDismiss()
              }}
            >
              <Box mb="16px" mx="auto" width="60px" height="60px">
                <img src={`${ASSETS_CDN}/web/landing/trade-buy-crypto.png`} width="60px" alt="Buy Crypto" />
              </Box>
              <Text bold color="secondary" fontSize="16px" mb="8px">
                {t('Buy Crypto')}
              </Text>
              <Text fontSize="14px" color="textSubtle">
                {t('Purchase with credit card.')}
              </Text>
            </OptionBox>
            <OptionBox
              onClick={() => {
                onReceiveClick()
                onDismiss()
              }}
            >
              <Box mb="16px" mx="auto" width="60px" height="60px">
                <img src={`${ASSETS_CDN}/web/landing/earn-fixed-staking.png`} width="60px" alt="Receive Crypto" />
              </Box>
              <Text bold color="secondary" fontSize="16px" mb="8px">
                {t('Receive Crypto')}
              </Text>
              <Text fontSize="14px" color="textSubtle">
                {t('Transfer crypto from other wallet.')}
              </Text>
            </OptionBox>
          </FlexGap>
          <FlexGap justifyContent="center" alignItems="center" mt="24px">
            <Text bold color="primary" fontSize="16px">
              {t('Bridge Crypto')}
            </Text>
            <ArrowForwardIcon color="primary" />
          </FlexGap>
        </Box>
      ) : (
        <ActionButtonsContainer>
          <FlexGap gap="8px" width="100%">
            <ActionButton
              onClick={() => {
                router.push('/buy-crypto')
                onDismiss()
              }}
            >
              {t('Buy Crypto')}
            </ActionButton>
            <ActionButton
              onClick={(e) => {
                onReceiveClick()
              }}
            >
              {t('Receive')}
            </ActionButton>
          </FlexGap>

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
        </ActionButtonsContainer>
      )}
    </Box>
  )
}

export default WalletModal
