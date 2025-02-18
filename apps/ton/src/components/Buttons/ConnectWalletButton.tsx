import { useTranslation } from '@pancakeswap/localization'
import { Button, ButtonProps, ChevronDownIcon, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { setWalletModalAtom } from 'atoms/modals/walletModalAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import styled from 'styled-components'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'

const ConnectButton = styled(Button)`
  border-radius: 999px;
  height: 44px;
`

const ConnectedButton = styled(Button).attrs({ variant: 'tertiary' })`
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

export const ConnectWalletButton = (props: ButtonProps) => {
  const { t } = useTranslation()

  const [tonUI] = useTonConnectUI()
  const isConnected = useAtomValue(isConnectedAtom)
  const setWalletModal = useSetAtom(setWalletModalAtom)

  const handleConnect = useCallback(() => {
    tonUI.openModal()
  }, [tonUI])

  const openWalletModal = useCallback(() => {
    setWalletModal()
  }, [setWalletModal])

  if (isConnected) {
    return (
      <ConnectedButton onClick={openWalletModal} endIcon={<ChevronDownIcon color="textSubtle" />} {...props}>
        <WalletCirclularIcon color="primary" />
      </ConnectedButton>
    )
  }

  return (
    <ConnectButton onClick={handleConnect} endIcon={<WalletFilledV2Icon color="invertedContrast" />} {...props}>
      {t('Connect')}
    </ConnectButton>
  )
}
