import { useTranslation } from '@pancakeswap/localization'
import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import {
  Button,
  ButtonProps,
  ChevronDownIcon,
  Tag,
  Text,
  useMatchBreakpoints,
  WalletFilledV2Icon,
} from '@pancakeswap/uikit'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { setWalletModalAtom } from 'atoms/modals/walletModalAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import styled from 'styled-components'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'

const ConnectButton = styled(Button)`
  border-radius: 999px;
  height: 44px;
`

const ConnectedButton = styled(Button).attrs({ variant: 'tertiary' })`
  position: relative;
  border-radius: 999px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  padding: 0 8px;
  height: 44px;
`

const WalletCirclularIcon = styled(WalletFilledV2Icon)`
  background: ${({ theme }) => theme.colors.invertedContrast};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 4px;
`

const StyledTag = styled(Tag)`
  position: absolute;
  top: -8px;
  right: -8px;
  height: 20px;
`

export const ConnectWalletButton = (props: ButtonProps) => {
  const { t } = useTranslation()

  const [tonUI] = useTonConnectUI()
  const isConnected = useAtomValue(isConnectedAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setWalletModal = useSetAtom(setWalletModalAtom)

  const { isMobile } = useMatchBreakpoints()

  const handleConnect = useCallback(() => {
    tonUI.openModal()
  }, [tonUI])

  const openWalletModal = useCallback(() => {
    setWalletModal()
  }, [setWalletModal])

  if (isConnected) {
    return (
      <ConnectedButton onClick={openWalletModal} endIcon={<ChevronDownIcon color="textSubtle" />} {...props}>
        {chainId === TonChainId.Testnet && (
          <StyledTag variant="secondary" scale="sm" px="6px" py="0">
            <Text color="" fontSize="10px">
              {t('Testnet')}
            </Text>
          </StyledTag>
        )}
        <WalletCirclularIcon color="primary" />
      </ConnectedButton>
    )
  }

  return (
    <ConnectButton
      onClick={handleConnect}
      endIcon={!isMobile && <WalletFilledV2Icon color="invertedContrast" />}
      px={['12px', '12px', '16px']}
      {...props}
    >
      {t('Connect')}
    </ConnectButton>
  )
}
