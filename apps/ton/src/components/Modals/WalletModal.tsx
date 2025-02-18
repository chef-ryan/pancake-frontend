import { useTranslation } from '@pancakeswap/localization'
import { Native } from '@pancakeswap/ton-v2-sdk'
import { Box, Button, Flex, FlexGap, Text, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { appModalAtom, resetAppModalAtom } from 'atoms/modals/appModalAtom'
import { setNetworkModalAtom } from 'atoms/modals/networkModalAtom'
import { setWalletModalAtom } from 'atoms/modals/walletModalAtom'
import { LightTertiaryCard } from 'components/Card'
import { Logo } from 'components/Logo'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import styled from 'styled-components'
import { TertiaryButton } from 'styles'
import { addressAtom } from 'ton/atom/addressAtom'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { formatBalance } from 'ton/utils/formatting'
import { truncateHash } from 'utils'

const WalletIconContainer = styled(Box)`
  background-color: ${({ theme }) => theme.colors.invertedContrast};
  padding: 4px;
  border-radius: 28px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`

const WalletBadge = styled(FlexGap)`
  align-items: center;
  border-radius: 999px;
  margin: 16px auto;
  padding: 2px 8px 2px 0;
  background-color: ${({ theme }) => theme.colors.tertiary};
`

export const WalletModal = () => {
  const { t } = useTranslation()
  const address = useAtomValue(addressAtom)
  const chainId = useAtomValue(chainIdAtom)

  const native = Native.onChain(chainId)
  const { data: nativeBalance } = useAtomValue(balanceAtom(native))

  const setAppModal = useSetAtom(appModalAtom)
  const setNetworkModal = useSetAtom(setNetworkModalAtom)

  const openDisconnectModal = useCallback(() => {
    setAppModal({
      title: (
        <Text fontSize="20px" width="100%" textAlign="center" bold>
          {t('Confirm Disconnection')}
        </Text>
      ),
      content: <ConfirmDisconnectModal />,
      isOpen: true,
      closeable: true,
    })
  }, [setAppModal, t])

  const openNetworkModal = useCallback(() => {
    setNetworkModal()
  }, [setNetworkModal])

  return (
    <FlexGap gap="8px" flexDirection="column">
      <LightTertiaryCard active={false}>
        <Flex alignItems="center" justifyContent="space-between">
          <FlexGap alignItems="center" gap="8px">
            <WalletIconContainer>
              <WalletFilledV2Icon color="primary" />
            </WalletIconContainer>
            <Text bold>{truncateHash(address, 4)}</Text>
          </FlexGap>
          <FlexGap gap="8px">
            <Text>{t('TON Network')}</Text>
            <Logo />
          </FlexGap>
        </Flex>
      </LightTertiaryCard>

      <Flex mt="16px" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">{t('%symbol% Balance', { symbol: native.symbol })}</Text>
        <Text>{formatBalance(nativeBalance, native.decimals)}</Text>
      </Flex>

      <FlexGap mt="16px" gap="8px" justifyContent="space-between" alignItems="center" flexDirection="column">
        <TertiaryButton onClick={openNetworkModal}>{t('Switch Network')}</TertiaryButton>

        <TertiaryButton onClick={openDisconnectModal}>{t('Disconnect')}</TertiaryButton>
      </FlexGap>
    </FlexGap>
  )
}

export const ConfirmDisconnectModal = () => {
  const { t } = useTranslation()
  const [tonUI] = useTonConnectUI()

  const address = useAtomValue(addressAtom)
  const setWalletModal = useSetAtom(setWalletModalAtom)
  const resetAppModal = useSetAtom(resetAppModalAtom)

  const openWalletModal = useCallback(() => {
    setWalletModal()
  }, [setWalletModal])

  const handleDisconnect = useCallback(() => {
    tonUI.disconnect()
    resetAppModal()
  }, [resetAppModal, tonUI])

  return (
    <FlexGap gap="8px" flexDirection="column" maxWidth={[null, null, null, '380px']} mx="auto">
      <Text textAlign="center" maxWidth="300px" mx="auto" bold>
        {t('Are you sure you want to disconnect this wallet?')}
      </Text>

      <WalletBadge gap="8px">
        <WalletIconContainer>
          <WalletFilledV2Icon color="primary" />
        </WalletIconContainer>
        <Text bold>{truncateHash(address, 4)}</Text>
      </WalletBadge>

      <Text textAlign="center">
        {t(
          'Disconnecting will remove access to your account, and you’ll need to reconnect to regain access to your features.',
        )}
      </Text>

      <Flex mt="16px">
        <Button width="100%" variant="secondary" onClick={openWalletModal}>
          {t('Back')}
        </Button>
        <Button width="100%" ml="8px" variant="primary" onClick={handleDisconnect}>
          {t('Proceed')}
        </Button>
      </Flex>
    </FlexGap>
  )
}
