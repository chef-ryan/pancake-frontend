import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  BoxProps,
  Button,
  PencilIcon,
  RiskAlertIcon,
  Text,
  useMatchBreakpoints,
  useModalV2,
  useTooltip,
  WarningIcon,
} from '@pancakeswap/uikit'
import { SettingsModal } from 'components/Modals/SettingsModal'
import { useUserSlippage } from 'hooks/useUserSlippage'

import styled from 'styled-components'
import { basisPointsToPercent } from 'utils/exchange'

const TertiaryButton = styled(Button).attrs({ variant: 'tertiary', scale: 'sm' })<{ $color: string }>`
  height: unset;
  padding: 5px 8px;
  font-size: 14px;
  border-radius: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  color: ${({ $color }) => $color};
`

export const SlippageButton = (props: BoxProps) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const [slippage] = useUserSlippage()

  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  const isRiskyLow = typeof slippage === 'number' && slippage < 50
  const isRiskyHigh = typeof slippage === 'number' && slippage > 100
  const isRiskyVeryHigh = typeof slippage === 'number' && slippage > 2000

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    isRiskyLow
      ? t('Your transaction may fail. Reset settings to avoid potential loss')
      : isRiskyHigh
      ? t('Your transaction may be frontrun. Reset settings to avoid potential loss')
      : '',
    { placement: 'top' },
  )

  const color = isRiskyVeryHigh ? 'failure' : isRiskyLow || isRiskyHigh ? 'yellow' : 'primary60'

  return (
    <>
      <Box ref={!isMobile ? targetRef : undefined} {...props}>
        <TertiaryButton
          $color={color}
          startIcon={
            isRiskyVeryHigh ? (
              <RiskAlertIcon color={color} width={16} />
            ) : isRiskyLow || isRiskyHigh ? (
              <WarningIcon color={color} width={16} />
            ) : undefined
          }
          endIcon={<PencilIcon color={color} width={12} />}
          onClick={() => setIsOpen(true)}
        >
          <Text color={color} small bold>
            {typeof slippage === 'number' ? `${basisPointsToPercent(slippage).toFixed(2)}%` : slippage}
          </Text>
        </TertiaryButton>
      </Box>
      {(isRiskyLow || isRiskyHigh) && tooltipVisible && tooltip}
      <SettingsModal key="slippage_button_settings_modal" isOpen={isOpen} onDismiss={onDismiss} />
    </>
  )
}
