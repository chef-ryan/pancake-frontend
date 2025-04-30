import { useDisclosure } from '@/hooks/useDelayDisclosure'
import Gear from '@/icons/misc/Gear'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import { Box, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import { LogoIcon, LogoWithTextIcon } from '@pancakeswap/uikit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Desktop, Mobile } from '../MobileDesktop'
import SolWallet from '../SolWallet'
import AppVersion from './AppVersion'
import { MobileBottomNavbar } from './MobileBottomNavbar'
import { ColorThemeSettingField } from './components/ColorThemeSettingField'
import { DefaultExplorerSettingField } from './components/DefaultExplorerSettingField'
import DisclaimerModal from './components/DisclaimerModal'
import { LanguageSettingField } from './components/LanguageSettingField'
import { PriorityButton } from './components/PriorityButton'
import { RPCConnectionSettingField } from './components/RPCConnectionSettingField'
import { Divider } from './components/SettingFieldDivider'
import { SlippageToleranceSettingField } from './components/SlippageToleranceSettingField'
import { VersionedTransactionSettingField } from './components/VersionedTransactionSettingField'

export interface NavSettings {
  // colorTheme: 'dark' | 'light'
}

function AppNavLayout({
  children,
  overflowHidden,
  fullSize = false
}: {
  children: ReactNode
  /** use screen height */
  overflowHidden?: boolean
  /** no padding */
  fullSize?: boolean
}) {
  const { t } = useTranslation()
  const { pathname } = useRouter()

  return (
    <Flex direction="column" id="app-layout" height="full" overflow={overflowHidden ? 'hidden' : 'auto'}>
      <HStack
        className="navbar"
        flex="none"
        height={['64px', '56px']}
        px={['20px', '16px']}
        gap={['4px', '3vw', '6.1vw']}
        alignItems="center"
        justifyContent="space-between"
        borderBottom={`1px solid ${colors.cardBorder01}`}
        bgColor={colors.cardBg}
      >
        {/* logo */}
        <Desktop>
          <LogoWithTextIcon width="160px" className="desktop-icon" />
        </Desktop>
        <Mobile>
          <LogoIcon className="mobile-icon" />
        </Mobile>

        {/* nav routes */}
        <Desktop>
          <HStack flexGrow={1} justify="start" overflow={['auto', 'visible']} gap={[0, 0, '15px']}>
            <RouteLink href="/swap" isActive={pathname === '/swap'} title={t('swap.title')} />
            <RouteLink href="/liquidity-pools" isActive={pathname.includes('/liquidity')} title={t('liquidity.title')} />
            <RouteLink href="/positions" isActive={pathname === '/positions'} title={t('portfolio.title')} />
          </HStack>
        </Desktop>

        {/* wallet button */}
        <Flex gap={[0.5, 2]} align="center">
          <PriorityButton />
          <SettingsMenu />
          <SolWallet />
        </Flex>
      </HStack>

      <Box
        px={fullSize ? 0 : appLayoutPaddingX}
        pt={fullSize ? 0 : [0, 4]}
        flex={1}
        overflow={overflowHidden ? 'hidden' : 'auto'}
        display="flex"
        flexDirection="column"
        justifyItems="flex-start"
        sx={{
          scrollbarGutter: 'stable',
          contain: 'size',
          '& > *': {
            // for flex-col container
            flex: 'none'
          }
        }}
      >
        {children}
      </Box>
      <DisclaimerModal />
      <Mobile>
        <Box className="mobile_bottom_navbar" flex="none">
          <MobileBottomNavbar />
        </Box>
      </Mobile>
    </Flex>
  )
}

function RouteLink({
  href,
  isActive,
  title,
  external = false
}: {
  href: string
  isActive: boolean
  title: string | React.ReactNode
  external?: boolean
}) {
  return (
    <Link
      href={href}
      shallow
      {...(external
        ? {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        : {})}
    >
      <Text
        as="span"
        textColor={isActive ? colors.textSecondary : colors.textTertiary}
        fontSize="md"
        fontWeight={isActive ? 600 : 400}
        px={4}
        py={2}
        rounded="xl"
        transition="200ms"
        _hover={{ bg: colors.backgroundLight, color: colors.textSecondary }}
      >
        {title}
      </Text>
    </Link>
  )
}

function SettingsMenu() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const triggerRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Box
        w={10}
        h={10}
        p="0"
        onClick={() => onOpen()}
        _hover={{ bg: colors.backgroundLight }}
        rounded="full"
        display="grid"
        placeContent="center"
        cursor="pointer"
        ref={triggerRef}
      >
        <Gear />
      </Box>
      <SettingsMenuModalContent isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} />
    </>
  )
}

function SettingsMenuModalContent(props: { isOpen: boolean; triggerRef: React.RefObject<HTMLDivElement>; onClose: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const triggerPanelGap = 8
  const isMobile = useAppStore((s) => s.isMobile)
  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()

  return (
    <Modal size="lg" isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        css={{
          transform: (() => {
            const triggerRect = getTriggerRect()
            return (
              triggerRect
                ? `translate(${isMobile ? 0 : -(window.innerWidth - triggerRect.right)}px, ${
                    triggerRect.bottom + triggerPanelGap
                  }px) !important`
                : undefined
            ) as string | undefined
          })()
        }}
        ref={contentRef}
        marginTop={0}
        marginRight={['auto', 0]}
      >
        <ModalHeader>{t('setting_board.panel_title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SlippageToleranceSettingField />
          <Divider />
          <SlippageToleranceSettingField variant="liquidity" />
          <Divider />
          <VersionedTransactionSettingField />
          <Divider />
          <DefaultExplorerSettingField />
          <Divider />
          <LanguageSettingField />
          <Divider />
          <ColorThemeSettingField />
          <Divider />
          <RPCConnectionSettingField />
          <Divider />
          <AppVersion />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AppNavLayout
