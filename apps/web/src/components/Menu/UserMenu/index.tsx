import { useTranslation } from '@pancakeswap/localization'
import { Box, UserMenu as UIKitUserMenu, UserMenuVariant, useModal } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useAirdropModalStatus from 'components/GlobalCheckClaimStatus/hooks/useAirdropModalStatus'
import Trans from 'components/Trans'
import { WalletContent, WalletModal } from 'components/WalletModal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import { useDomainNameForAddress } from 'hooks/useDomain'
import { useCallback, useEffect, useState } from 'react'
import { useProfile } from 'state/profile/hooks'
import { usePendingTransactions } from 'state/transactions/hooks'
import { logGTMDisconnectWalletEvent } from 'utils/customGTMEventTracking'
import { useAccount } from 'wagmi'

const UserMenuItems = () => {
  const { t } = useTranslation()
  const { chainId, isWrongNetwork } = useActiveChainId()
  const { logout } = useAuth()
  const { address: account, connector } = useAccount()
  const { hasPendingTransactions } = usePendingTransactions()
  const { isInitialized, isLoading, profile } = useProfile()
  const { shouldShowModal } = useAirdropModalStatus()

  // Use our new WalletModal component
  const [onPresentWalletModal] = useModal(<WalletModal account={account} onDismiss={() => {}} />)
  const hasProfile = isInitialized && !!profile

  const onClickWalletMenu = useCallback((): void => {
    onPresentWalletModal()
  }, [onPresentWalletModal])

  const handleClickDisconnect = useCallback(() => {
    logGTMDisconnectWalletEvent(chainId, connector?.name, account)
    logout()
  }, [logout, connector?.name, account, chainId])

  return (
    <>
      <WalletContent account={account} onDismiss={() => {}} />
      {/* <WalletUserMenuItem isWrongNetwork={isWrongNetwork} onPresentWalletModal={onClickWalletMenu} />
      <UserMenuDivider />
      <NextLink href={`/profile/${account?.toLowerCase()}`} passHref>
        <UserMenuItem disabled={isWrongNetwork || chainId !== ChainId.BSC}>{t('Your NFTs')}</UserMenuItem>
      </NextLink>
      {shouldShowModal && <ClaimYourNFT />}
      <ProfileUserMenuItem
        isLoading={isLoading}
        hasProfile={hasProfile}
        disabled={isWrongNetwork || chainId !== ChainId.BSC}
      />
      <UserMenuDivider />
      <UserMenuItem as="button" onClick={handleClickDisconnect}>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          {t('Disconnect')}
          <LogoutIcon />
        </Flex>
      </UserMenuItem> */}
    </>
  )
}

const UserMenu = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { domainName, avatar } = useDomainNameForAddress(account)
  const { isWrongNetwork } = useActiveChainId()
  const { hasPendingTransactions, pendingNumber } = usePendingTransactions()
  const { profile } = useProfile()
  const avatarSrc = profile?.nft?.image?.thumbnail ?? avatar
  const [userMenuText, setUserMenuText] = useState<string>('')
  const [userMenuVariable, setUserMenuVariable] = useState<UserMenuVariant>('default')

  useEffect(() => {
    if (hasPendingTransactions) {
      setUserMenuText(t('%num% Pending', { num: pendingNumber }))
      setUserMenuVariable('pending')
    } else {
      setUserMenuText('')
      setUserMenuVariable('default')
    }
  }, [hasPendingTransactions, pendingNumber, t])

  if (account) {
    return (
      <UIKitUserMenu
        account={domainName || account}
        ellipsis={!domainName}
        avatarSrc={avatarSrc}
        text={userMenuText}
        variant={userMenuVariable}
        popperStyle={{
          minWidth: '357px',
        }}
      >
        {({ isOpen }) => (isOpen || true ? <UserMenuItems /> : null)}
      </UIKitUserMenu>
    )
  }

  if (isWrongNetwork) {
    return (
      <UIKitUserMenu text={t('Network')} variant="danger">
        {({ isOpen }) => (isOpen ? <UserMenuItems /> : null)}
      </UIKitUserMenu>
    )
  }

  return (
    <ConnectWalletButton scale="sm">
      <Box display={['none', null, null, 'block']}>
        <Trans>Connect Wallet</Trans>
      </Box>
      <Box display={['block', null, null, 'none']}>
        <Trans>Connect</Trans>
      </Box>
    </ConnectWalletButton>
  )
}

export default UserMenu
