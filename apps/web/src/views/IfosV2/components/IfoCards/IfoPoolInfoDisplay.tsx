import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { useIfoDisplay } from '../../hooks/useIfoDisplay'

interface IfoPoolInfoDisplayProps {
  pid: number
  ifoStatus: IFOStatus
  userStatus?: IFOUserStatus
  variant: 'live' | 'finished'
  feeTier?: string
  cakeToBurn?: string
}

const IfoPoolInfoDisplay: React.FC<IfoPoolInfoDisplayProps> = ({
  pid,
  ifoStatus,
  userStatus,
  variant,
  feeTier,
  cakeToBurn,
}) => {
  const { t } = useTranslation()
  const { info, pools } = useIfo()
  const { offeringCurrency } = info
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const { pools: displayPools } = useIfoDisplay()
  const raiseAmountText = displayPools?.[pid]?.raiseAmountText
  const pricePerToken = poolInfo?.price
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)
  const showExtraInfo = variant === 'live' && userHasStaked

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )

  return (
    <>
      <FlexGap justifyContent="space-between" mt="8px">
        <Text color="textSubtle">{t('Sale Price per token')}</Text>
        <Text>
          {pricePerToken?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
        </Text>
      </FlexGap>
      <FlexGap justifyContent="space-between">
        <Text color="textSubtle">{t('Target Raise')}</Text>
        <Text>{raiseAmountText}</Text>
      </FlexGap>
      {showExtraInfo && (
        <>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Total committed')}</Text>
            <Text>
              {ifoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Deposit Amount')}</Text>
            <Text>
              {userStatus?.stakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
        </>
      )}
      {variant === 'finished' && (
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('Total committed')}</Text>
          <Text>
            {ifoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
          </Text>
        </FlexGap>
      )}
      {!showExtraInfo && feeTier && (
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('Fee Tier')}</Text>
          <Text>{feeTier}</Text>
        </FlexGap>
      )}
      {!showExtraInfo && cakeToBurn && (
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('CAKE to burn:')}</Text>
          <Text>{cakeToBurn}</Text>
        </FlexGap>
      )}
      <FlexGap justifyContent="space-between">
        <Text color="textSubtle">{t('Status')}</Text>
        <FlexGap flexDirection="column" alignItems="flex-end">
          <FlexGap gap="3px">
            <Text>
              {ifoStatus.progress.toFixed(2)} % {ifoStatus.progress.greaterThan(1) && '🎉'}
            </Text>
          </FlexGap>
          {ifoStatus.progress.greaterThan(1) && (
            <FlexGap gap="3px">
              <Text>{t('Oversubscribed')}</Text>
              <FlexGap ref={targetRef}>
                <InfoIcon width="14px" color="textSubtle" />
                {tooltipVisible && tooltip}
              </FlexGap>
            </FlexGap>
          )}
        </FlexGap>
      </FlexGap>
      {showExtraInfo && feeTier && (
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('Fee Tier')}</Text>
          <Text>{feeTier}</Text>
        </FlexGap>
      )}
      {showExtraInfo && cakeToBurn && (
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('CAKE to burn:')}</Text>
          <Text>{cakeToBurn}</Text>
        </FlexGap>
      )}
    </>
  )
}

export default IfoPoolInfoDisplay
