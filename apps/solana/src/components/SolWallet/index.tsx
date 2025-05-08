import { WALLET_STORAGE_KEY } from '@/hooks/app/useInitConnection'
import { useEvent } from '@/hooks/useEvent'
import useResponsive from '@/hooks/useResponsive'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import { encodeStr } from '@/utils/common'
import { Box, HStack, Image, Text, useDisclosure } from '@chakra-ui/react'
import {
  Button,
  Flex,
  LogoutIcon,
  ModalV2,
  RefreshIcon,
  useModal,
  useModalV2,
  UserMenu,
  UserMenuDivider,
  UserMenuItem,
  WarningIcon
} from '@pancakeswap/uikit'
import { Wallet, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import WalletRecentTransactionBoard from '../WalletRecentTransactionBoard'
import SelectWalletModal from './SelectWalletModal'
import WalletModal, { WalletView } from './WalletModal'

const UserMenuItems: React.FC<{
  onPresentWalletModal: () => void
  onPresentTransactionModal: () => void
}> = ({ onPresentWalletModal, onPresentTransactionModal }) => {
  const { t } = useTranslation()
  const { disconnect } = useWallet()

  return (
    <>
      <UserMenuItem as="button" onClick={onPresentWalletModal}>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          {t('Wallet')}
          {/* {hasLowNativeBalance && <WarningIcon color="warning" width="24px" />} */}
        </Flex>
      </UserMenuItem>
      {/* <UserMenuItem as="button" onClick={onPresentTransactionModal}>
        {t('Recent Transactions')}
      </UserMenuItem> */}
      <UserMenuDivider />
      <UserMenuItem as="button" onClick={disconnect}>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          {t('Disconnect')}
          <LogoutIcon />
        </Flex>
      </UserMenuItem>
    </>
  )
}

export default function SolWallet() {
  const { wallets, select, disconnect, connected, connecting, wallet } = useWallet()
  const { t } = useTranslation()
  const publicKey = useAppStore((s) => s.publicKey)
  const { isMobile } = useResponsive()
  const { setVisible, visible } = useWalletModal()
  const { isOpen: isWalletDrawerShown, onOpen, onClose } = useDisclosure()

  const handleClose = useCallback(() => setVisible(false), [setVisible])
  const handleOpen = useCallback(() => setVisible(true), [setVisible])

  const handleSelectWallet = useEvent((wallet_: Wallet) => {
    select(wallet_.adapter.name)
    handleClose()
    setTimeout(() => {
      // remove before connected
      localStorage.removeItem(WALLET_STORAGE_KEY)
    }, 0)
  })

  const { isOpen: isTransactionModalOpen, setIsOpen: setTransactionModalOpen, onDismiss: dismissTransactionModal } = useModalV2()
  const { isOpen: isWalletModalOpen, setIsOpen: setWalletModalOpen, onDismiss: dismissWalletModal } = useModalV2()

  if (connected)
    return (
      <>
        <UserMenu account={publicKey?.toBase58()} variant="default">
          {({ isOpen }) =>
            isOpen ? (
              <UserMenuItems
                onPresentWalletModal={() => setWalletModalOpen(true)}
                onPresentTransactionModal={() => setTransactionModalOpen(true)}
              />
            ) : (
              <></>
            )
          }
        </UserMenu>
        <ModalV2 isOpen={isWalletModalOpen} onDismiss={dismissWalletModal} closeOnOverlayClick maxWidth="320px" minHeight="500px">
          <WalletModal initialView={WalletView.WALLET_INFO} onDismiss={dismissWalletModal} />
        </ModalV2>
        <ModalV2 isOpen={isTransactionModalOpen} onDismiss={dismissTransactionModal} closeOnOverlayClick maxWidth="320px" minHeight="500px">
          <WalletModal initialView={WalletView.TRANSACTIONS} onDismiss={dismissTransactionModal} />
        </ModalV2>
      </>
    )
  return (
    <Box>
      <Button isLoading={connecting} onClick={handleOpen} scale="sm" width="auto">
        <Box display={['none', null, null, 'block']}>{t('button.connect_wallet')}</Box>
        <Box display={['block', null, null, 'none']}>{t('button.connect')}</Box>
      </Button>
      <SelectWalletModal wallets={wallets} isOpen={visible} onClose={handleClose} onSelectWallet={handleSelectWallet} />
    </Box>
  )
}
