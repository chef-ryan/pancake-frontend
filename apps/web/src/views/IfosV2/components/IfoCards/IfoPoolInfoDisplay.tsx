import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { useIfoDisplay } from '../../hooks/useIfoDisplay'

const StyledText = styled(Text)`
  font-size: 14px;
  font-family: Kanit;
  line-height: 150%;
`

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
  const { pools } = useIfo()
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
        <StyledText color="textSubtle">{t('Sale Price per token')}</StyledText>
        <StyledText color="text">
          {pricePerToken?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
        </StyledText>
      </FlexGap>
      <FlexGap justifyContent="space-between">
        <StyledText color="textSubtle">{t('Target Raise')}</StyledText>
        <StyledText color="text">{raiseAmountText}</StyledText>
      </FlexGap>
      {showExtraInfo && (
        <>
          <FlexGap justifyContent="space-between">
            <StyledText color="textSubtle">{t('Total committed')}</StyledText>
            <StyledText color="text">
              {ifoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
            </StyledText>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <StyledText color="textSubtle">{t('Deposit Amount')}</StyledText>
            <StyledText color="text">
              {userStatus?.stakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
            </StyledText>
          </FlexGap>
        </>
      )}
      {variant === 'finished' && (
        <FlexGap justifyContent="space-between">
          <StyledText color="textSubtle">{t('Total committed')}</StyledText>
          <StyledText color="text">
            {ifoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
          </StyledText>
        </FlexGap>
      )}
      {!showExtraInfo && feeTier && (
        <FlexGap justifyContent="space-between">
          <StyledText color="textSubtle">{t('Fee Tier')}</StyledText>
          <StyledText color="text">{feeTier}</StyledText>
        </FlexGap>
      )}
      {!showExtraInfo && cakeToBurn && (
        <FlexGap justifyContent="space-between">
          <StyledText color="textSubtle">{t('CAKE to burn:')}</StyledText>
          <StyledText color="text">{cakeToBurn}</StyledText>
        </FlexGap>
      )}
      <FlexGap justifyContent="space-between">
        <StyledText color="textSubtle">{t('Status')}</StyledText>
        <FlexGap flexDirection="column" alignItems="flex-end">
          <FlexGap gap="3px">
            <StyledText color="text">
              {ifoStatus.progress.toFixed(2)} % {ifoStatus.progress.greaterThan(1) && '🎉'}
            </StyledText>
          </FlexGap>
          {ifoStatus.progress.greaterThan(1) && (
            <FlexGap gap="3px">
              <StyledText color="text">{t('Oversubscribed')}</StyledText>
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
          <StyledText color="textSubtle">{t('Fee Tier')}</StyledText>
          <StyledText color="text">{feeTier}</StyledText>
        </FlexGap>
      )}
      {showExtraInfo && cakeToBurn && (
        <FlexGap justifyContent="space-between">
          <StyledText color="textSubtle">{t('CAKE to burn:')}</StyledText>
          <StyledText color="text">{cakeToBurn}</StyledText>
        </FlexGap>
      )}
    </>
  )
}

export default IfoPoolInfoDisplay
