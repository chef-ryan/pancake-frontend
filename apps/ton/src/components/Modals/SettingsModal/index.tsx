import { useTranslation } from '@pancakeswap/localization'
import { Button, ChevronRightIcon, Heading, ModalV2, MotionModal, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { setRefundModalAtom } from 'atoms/modals/refundModalAtom'
import { LightGreyCard } from 'components/Card'
import { GrabberBar } from 'components/Misc/GrabberBar'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import styled from 'styled-components'
import { SlippageSettings } from './SlippageSettings'
import { TransactionDeadlineSettings } from './TransactionDeadlineSettings'

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

  return (
    <ModalV2 title={t('Settings')} isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Settings')}
        onDismiss={onDismiss}
        headerBorderColor="transparent"
        minWidth="400px"
        maxWidth={isSmallScreen ? '100%' : '460px'}
        overrideHeaderContent={isSmallScreen ? <GrabberBar mt="2px" /> : null}
        bodyPadding="0 24px 24px"
      >
        {isSmallScreen && <Heading mb="24px">{t('Settings')}</Heading>}

        <Text color="secondary" fontSize="12px" textTransform="uppercase" bold>
          {t('Slippage and Deadline')}
        </Text>

        <SlippageSettings mt="8px" />
        <TransactionDeadlineSettings mt="16px" />

        <LightGreyCard mt="24px">
          <Text textTransform="uppercase" color="secondary" small bold>
            {t('Failed Transactions Refund')}
          </Text>

          <Text mt="12px">
            {t(
              'Failed “Add Liquidity” transactions may introduce leftover tokens in the pool contract. To check and claim those tokens, enter the token pairs within the following page.',
            )}
          </Text>

          <TextButton mt="16px" endIcon={<ChevronRightIcon color="primary60" />} onClick={openRefundModal}>
            {t('Check and Refund')}
          </TextButton>
        </LightGreyCard>
      </MotionModal>
    </ModalV2>
  )
}
