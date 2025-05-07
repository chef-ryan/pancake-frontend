import { WALLET_STORAGE_KEY } from '@/hooks/app/useInitConnection'
import { useEvent } from '@/hooks/useEvent'
import useResponsive from '@/hooks/useResponsive'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import { encodeStr } from '@/utils/common'
import { Box, HStack, Image, Text, useDisclosure } from '@chakra-ui/react'
import { Button } from '@pancakeswap/uikit'
import { Wallet, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import WalletRecentTransactionBoard from '../WalletRecentTransactionBoard'
import SelectWalletModal from './SelectWalletModal'

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

  if (connected)
    return (
      <>
        <WalletRecentTransactionBoard
          wallet={wallet}
          address={publicKey?.toBase58() || ''}
          onDisconnect={disconnect}
          isOpen={isWalletDrawerShown}
          onClose={onClose}
        />
        <HStack
          gap="4px"
          py="1px"
          cursor="pointer"
          onClick={onOpen}
          backgroundColor={colors.tertiary}
          borderRadius="full"
          borderBottom="2px solid rgba(0, 0, 0, 0.20)"
          overflow="hidden"
        >
          {wallet && (
            <Box flex="none" rounded="full" overflow="hidden">
              <Image src={wallet.adapter.icon} width={['28px', '30px']} height={['28px', '30px']} />
            </Box>
          )}
          <Text fontWeight={600} fontSize="sm">
            {isMobile ? `${publicKey?.toBase58().substring(0, 3)}...` : encodeStr(publicKey?.toBase58(), 3)}
          </Text>
          <Box flex="none" mr="8px">
            <ChevronDownIcon strokeWidth={4} color={colors.textSubtle} width={12} height={12} />
          </Box>
        </HStack>
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
