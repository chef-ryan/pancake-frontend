import { useTranslation } from '@pancakeswap/localization'
import { Heading, ModalV2, MotionModal, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { GrabberBar } from 'components/Misc/GrabberBar'
import { SlippageSettings } from './SlippageSettings'
import { TransactionDeadlineSettings } from './TransactionDeadlineSettings'

interface SettingsModalProps {
  isOpen: boolean
  onDismiss?: () => void
}
export const SettingsModal = ({ isOpen, onDismiss }: SettingsModalProps) => {
  const { t } = useTranslation()
  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd

  return (
    <ModalV2 title="Settings" isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Settings')}
        onDismiss={onDismiss}
        headerBorderColor="transparent"
        minWidth="400px"
        overrideHeaderContent={isSmallScreen ? <GrabberBar mt="2px" /> : null}
        bodyPadding="0 24px 24px"
      >
        {isSmallScreen && <Heading mb="24px">{t('Settings')}</Heading>}

        <Text color="secondary" fontSize="12px" textTransform="uppercase" bold>
          {t('Slippage and Deadline')}
        </Text>

        <SlippageSettings mt="8px" />
        <TransactionDeadlineSettings mt="16px" />
      </MotionModal>
    </ModalV2>
  )
}
