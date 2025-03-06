import { useTranslation } from '@pancakeswap/localization'
import {
  Button,
  ChevronRightIcon,
  Flex,
  FlexGap,
  Heading,
  ModalV2,
  MotionModal,
  PreTitle,
  Text,
  ThemeSwitcher,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { setRefundModalAtom } from 'atoms/modals/refundModalAtom'
import { LightGreyCard } from 'components/Card'
import { GrabberBar } from 'components/Misc/GrabberBar'
import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useTheme } from 'next-themes'
import { SlippageSettings } from './SlippageSettings'
import { TransactionDeadlineSettings } from './TransactionDeadlineSettings'
import { RoutingPreference } from './RoutingPreference'

const TextButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary60};
  font-weight: 600;
`

interface SettingsModalProps {
  isOpen: boolean
  onDismiss?: () => void
}
export const SettingsModal = ({ isOpen, onDismiss }: SettingsModalProps) => {
  const { t } = useTranslation()
  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd

  const setRefundModal = useSetAtom(setRefundModalAtom)

  const openRefundModal = useCallback(() => {
    onDismiss?.()
    setRefundModal()
  }, [onDismiss, setRefundModal])

  const { resolvedTheme, setTheme } = useTheme()
  const isDark = useMemo(() => resolvedTheme === 'dark', [resolvedTheme])

  return (
    <ModalV2 title={t('Settings')} isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Settings')}
        onDismiss={onDismiss}
        headerBorderColor="transparent"
        maxWidth={isSmallScreen ? '100%' : '460px'}
        overrideHeaderContent={isSmallScreen ? <GrabberBar mt="2px" /> : null}
        bodyPadding="16px 16px 32px"
      >
        <FlexGap gap="32px" flexDirection="column">
          {isSmallScreen && (
            <Flex justifyContent="space-between" alignItems="center">
              <Heading>{t('Settings')}</Heading>
              <ThemeSwitcher isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />
            </Flex>
          )}

          <FlexGap gap="16px" flexDirection="column">
            <PreTitle>{t('Slippage and Deadline')}</PreTitle>
            <SlippageSettings />
            <TransactionDeadlineSettings />
            <RoutingPreference />
            <LightGreyCard padding="12px">
              <PreTitle mb="8px">{t('Failed Transactions Refund')}</PreTitle>
              <Text fontSize="14px">
                {t(
                  'Failed “Add Liquidity” transactions may introduce leftover tokens in the pool contract. To check and claim those tokens, enter the token pairs within the following page.',
                )}
              </Text>
              <TextButton endIcon={<ChevronRightIcon color="primary60" />} onClick={openRefundModal}>
                {t('Check and Refund')}
              </TextButton>
            </LightGreyCard>
          </FlexGap>
        </FlexGap>
      </MotionModal>
    </ModalV2>
  )
}
