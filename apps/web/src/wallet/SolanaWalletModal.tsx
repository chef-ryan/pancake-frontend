/* eslint-disable  no-unused-expressions */
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  Collapse,
  Flex,
  FlexGap,
  Grid,
  Image,
  Link,
  LinkExternal,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalV2,
  Text,
  Toggle,
  useMatchBreakpoints,
  WalletFilledIcon,
} from '@pancakeswap/uikit'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { useAtom } from 'jotai'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { solanaWalletModalAtom } from './atoms/solanaWalletAtoms'
import DesktopIcon from './components/DesktopIcon'
import MobileIcon from './components/MobileIcon'
import QuestionToolTip from './components/QuestionToolTip'

const ColumnBox = styled(Box)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const WarningBox = styled(Box)`
  font-size: 14px;
`

const DisclaimerBox = styled(Box)`
  font-size: 14px;
`

const WalletListBox = styled(Box)`
  flex: 1;
`

const DividerBox = styled(Box)`
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px);
`

const InstructionFlex = styled(Flex)`
  font-size: 14px;
  text-align: start;
`

const ToggleRow = styled(FlexGap)`
  font-size: 14px;
`

const WalletGrid = styled(Grid)`
  row-gap: 10px;
  column-gap: 10px;
`

const NotInstalledGrid = styled(Grid)`
  row-gap: 12px;
`

const DividerHeader = styled(Flex)`
  font-size: 14px;
`

const WalletItemContainer = styled(FlexGap)<{ selectable: boolean }>`
  cursor: ${({ selectable }) => (selectable ? 'pointer' : 'not-allowed')};
`

const ToggleFooter = styled(Flex)`
  font-size: 14px;
`

export const SolanaWalletModal: React.FC = () => {
  const { wallets, select } = useWallet()
  const { isMobile } = useMatchBreakpoints()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useAtom(solanaWalletModalAtom)
  const [canShowUninstalledWallets, setCanShowUninstalledWallets] = useState(false)
  const [isWalletNotInstalled, setIsWalletNotInstalled] = useState(false)

  const onClose = useCallback(() => setIsOpen(false), [setIsOpen])
  const handleSelectWallet = useCallback(
    (wallet: Wallet) => {
      select(wallet.adapter.name)
      onClose()
    },
    [select, onClose],
  )

  const { recommendedWallets, notInstalledWallets } = splitWallets(wallets)

  const phantomWallet = recommendedWallets.find((w) => w.adapter.name === 'Phantom')

  const handleCloseComplete = useCallback(() => setIsWalletNotInstalled(false), [])

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onClose}>
      <Modal title={t('Connect your wallet to PancakeSwap')} onDismiss={onClose} onAnimationEnd={handleCloseComplete}>
        {isWalletNotInstalled ? (
          <ModalBody>
            <ColumnBox>
              <WarningBox color="warning" bg="warning10" p="16px" borderRadius="8px">
                {t('Oops... Looks like you don’t have Phantom installed!')}
              </WarningBox>
              <Flex justifyContent="center" mt="40px">
                <Image src={phantomWallet?.adapter.icon} width={100} height={100} />
              </Flex>
              <Flex justifyContent="center" mt="24px">
                <Box
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <Link external href="https://phantom.com">
                    <Button variant="primary" scale="md" mr="4px">
                      {t('Install Phantom')}
                      <LinkExternal color="invertedContrast" width="14px" ml="4px" />
                    </Button>
                  </Link>
                </Box>
              </Flex>
              <Flex alignItems="flex-start" flexDirection="column" color="textSubtle" px="12px" mt="48px">
                <Text>{t('How to install Phantom?')}</Text>
                <InstructionFlex flexDirection="column" alignItems="flex-start" pl="4px" mt="20px">
                  <FlexGap alignItems="center" gap="4px">
                    <MobileIcon />
                    <Text fontWeight="500">{t('On mobile:')}</Text>
                  </FlexGap>
                  <ul style={{ marginTop: '4px', paddingLeft: '40px' }}>
                    <li>{t('Download and open the wallet app instead')}</li>
                  </ul>
                </InstructionFlex>
                <InstructionFlex flexDirection="column" alignItems="flex-start" pl="4px" mt="20px">
                  <FlexGap alignItems="center" gap="4px">
                    <DesktopIcon />
                    <Text fontWeight="500">{t('On desktop:')}</Text>
                  </FlexGap>
                  <ul style={{ marginTop: '4px', paddingLeft: '40px' }}>
                    <li>{t('Install at link above then refresh this page')}</li>
                  </ul>
                </InstructionFlex>
              </Flex>
              <Flex flexDirection="column" px="12px" mt="48px">
                <Button
                  variant="tertiary"
                  width="100%"
                  onClick={() => {
                    if (!phantomWallet || phantomWallet.readyState === WalletReadyState.NotDetected) {
                      window.location.reload()
                    } else {
                      handleSelectWallet(phantomWallet)
                    }
                  }}
                  mb="8px"
                >
                  {t('I’ve already Installed, Refresh page')}
                </Button>
                <Button variant="tertiary" width="100%" onClick={() => setIsWalletNotInstalled(false)}>
                  {t('Go back')}
                </Button>
              </Flex>
            </ColumnBox>
          </ModalBody>
        ) : (
          <ModalBody>
            <ColumnBox>
              <DisclaimerBox mb="20px" color="text">
                {t(
                  'By connecting your wallet, you acknowledge that you have read, understand and accept the terms in the',
                )}{' '}
                <Link external href="https://pancakeswap.finance/terms-of-service">
                  {t('disclaimer')}
                </Link>
              </DisclaimerBox>
              <WalletListBox mb="24px">
                <Flex justifyContent="space-between" mb="8px" alignItems="center">
                  <Text fontSize="16px" color="text" bold mb="8px">
                    {t('Choose wallet')}
                  </Text>
                  {isMobile && (
                    <ToggleRow
                      color="textSubtle"
                      style={{
                        fontWeight: 500,
                      }}
                      justifyContent="space-between"
                      alignItems="center"
                      gap="4px"
                      mb="8px"
                    >
                      <Text>{t('Show uninstalled')}</Text>
                      <Toggle
                        checked={canShowUninstalledWallets}
                        scale="sm"
                        onChange={() => setCanShowUninstalledWallets(!canShowUninstalledWallets)}
                      />
                    </ToggleRow>
                  )}
                </Flex>
                <WalletGrid gridTemplateColumns={['1fr', '1fr 1fr']}>
                  {recommendedWallets.map((wallet) => (
                    <WalletItem
                      key={wallet.adapter.name}
                      selectable
                      wallet={wallet}
                      onClick={(w) => {
                        if (w.readyState === WalletReadyState.NotDetected && w.adapter.name === 'Phantom') {
                          setIsWalletNotInstalled(true)
                          return
                        }
                        handleSelectWallet(w)
                      }}
                    />
                  ))}
                </WalletGrid>
                <Collapse isOpen={canShowUninstalledWallets} mt="16px">
                  <DividerHeader color="textSubtle" my="12px" alignItems="center">
                    <DividerBox />
                    <Text mx="8px">Uninstalled wallets</Text>
                    <DividerBox />
                  </DividerHeader>
                  <NotInstalledGrid opacity={0.5} gridTemplateColumns="1fr 1fr">
                    {notInstalledWallets.map((wallet) => (
                      <WalletItem selectable={false} key={wallet.adapter.name} wallet={wallet} />
                    ))}
                  </NotInstalledGrid>
                </Collapse>
              </WalletListBox>
              {!isMobile && (
                <ToggleFooter
                  bg="rgba(171, 196, 255, 0.07)"
                  color="textSubtle"
                  style={{
                    fontWeight: 500,
                  }}
                  justifyContent="space-between"
                  borderRadius="16px"
                  py="16px"
                  px="20px"
                  mb="12px"
                >
                  <FlexGap alignItems="center" gap="4px">
                    <WalletFilledIcon width="24px" height="24px" color="textSubtle" />
                    <Text>{t('Show uninstalled wallets')}</Text>
                  </FlexGap>
                  <Toggle
                    checked={canShowUninstalledWallets}
                    scale="sm"
                    onChange={() => setCanShowUninstalledWallets(!canShowUninstalledWallets)}
                  />
                </ToggleFooter>
              )}
            </ColumnBox>
          </ModalBody>
        )}
      </Modal>
    </ModalV2>
  )
}

function WalletItem({
  selectable = true,
  wallet,
  onClick,
}: {
  selectable?: boolean
  wallet: Wallet
  onClick?: (wallet: Wallet) => void
}) {
  const { t } = useTranslation()
  return (
    <WalletItemContainer
      selectable={selectable}
      gap="8px"
      alignItems="center"
      borderRadius="16px"
      backgroundColor="secondary10"
      py="12px"
      px="12px"
      onClick={() => onClick?.(wallet)}
    >
      <Image src={wallet.adapter.icon} width={24} height={24} ml="4px" />
      <Text bold>{wallet.adapter.name}</Text>
      {wallet.adapter.name === 'Phantom' && (
        <FlexGap gap="4px" backgroundColor="backgroundAlt" px="8px" py="4px" borderRadius="8px" alignItems="center">
          <Text fontSize="12px" color="secondary">
            {t('Auto Confirm')}
          </Text>
          <QuestionToolTip
            label={
              <>
                {t('Auto-confirm is now available for all transactions on PancakeSwap.')}
                <LinkExternal href="https://phantom.com/learn/blog/auto-confirm" color="secondary" fontWeight="bold">
                  {t('Learn more')}
                </LinkExternal>
              </>
            }
            placement="top"
          />
        </FlexGap>
      )}
      {wallet.adapter.name === 'Solflare' && (
        <FlexGap gap="4px" backgroundColor="backgroundAlt" px="8px" py="4px" borderRadius="8px" alignItems="center">
          <Text fontSize="12px" color="secondary">
            {t('Auto Approve')}
          </Text>
          <QuestionToolTip
            label={t('Auto-approve is now available for all transactions on PancakeSwap.')}
            placement="top"
          />
        </FlexGap>
      )}
    </WalletItemContainer>
  )
}

function splitWallets(wallets: Wallet[]): { recommendedWallets: Wallet[]; notInstalledWallets: Wallet[] } {
  const uniqueWallets = Array.from(new Map(wallets.map((wallet) => [wallet.adapter.name, wallet])).values())
  const supportedWallets = uniqueWallets.filter((w) => w.readyState !== WalletReadyState.Unsupported)
  const recommendedWallets = supportedWallets.filter(
    (w) => w.readyState !== WalletReadyState.NotDetected && w.adapter.name !== 'Sollet',
  )
  const notInstalledWallets = supportedWallets.filter(
    (w) => w.readyState === WalletReadyState.NotDetected && w.adapter.name !== 'Phantom',
  )
  const solletWallet = supportedWallets.find((w) => w.adapter.name === 'Sollet')
  solletWallet && notInstalledWallets.push(solletWallet)
  const phantomWallet = supportedWallets.find((w) => w.adapter.name === 'Phantom')
  if (phantomWallet && phantomWallet.readyState === WalletReadyState.NotDetected) {
    recommendedWallets.unshift(phantomWallet)
  }
  return { recommendedWallets, notInstalledWallets }
}
