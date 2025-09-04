import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
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

type InfoRowData = { left: ReactNode; right: ReactNode; display: boolean }

const InfoRow: React.FC<InfoRowData & { mt?: string }> = ({ left, right, display, mt }) =>
  display ? (
    <FlexGap justifyContent="space-between" mt={mt}>
      {left}
      {right}
    </FlexGap>
  ) : null

interface IfoPoolInfoDisplayProps {
  pid: number
  ifoStatus?: IFOStatus
  userStatus?: IFOUserStatus
  variant: 'live' | 'finished' | 'presale' | 'history'
}

const IfoPoolInfoDisplay: React.FC<IfoPoolInfoDisplayProps> = ({ pid, ifoStatus, userStatus, variant }) => {
  const { t } = useTranslation()
  const { pools } = useIfo()
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const { pools: displayPools } = useIfoDisplay()
  const raiseAmountText = displayPools?.[pid]?.raiseAmountText
  const pricePerToken = poolInfo?.price
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)
  const showExtraInfo = variant === 'live' && userHasStaked
  const feeTier = poolInfo?.feeTier !== undefined ? `${(poolInfo.feeTier * 100).toFixed(2)}%` : undefined
  const cakeToBurn = userStatus?.tax
    ? `${userStatus.tax.toSignificant(6)} ${userStatus.tax.currency.symbol}`
    : undefined

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )

  const list: InfoRowData[] = [
    {
      left: <StyledText color="textSubtle">{t('Sale Price per token')}</StyledText>,
      right: (
        <StyledText color="text">
          {pricePerToken?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
        </StyledText>
      ),
      display: true,
    },
    {
      left: <StyledText color="textSubtle">{t('Target Raise')}</StyledText>,
      right: <StyledText color="text">{raiseAmountText}</StyledText>,
      display: true,
    },
    {
      left: <StyledText color="textSubtle">{t('Total committed')}</StyledText>,
      right: (
        <StyledText color="text">
          {ifoStatus?.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
        </StyledText>
      ),
      display:
        variant !== 'presale' &&
        ((variant === 'live' && userHasStaked) || variant === 'finished' || variant === 'history'),
    },
    {
      left: <StyledText color="textSubtle">{t('Deposit Amount')}</StyledText>,
      right: (
        <StyledText color="text">
          {userStatus?.stakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
        </StyledText>
      ),
      display: Boolean(variant !== 'presale' && showExtraInfo),
    },
    {
      left: <StyledText color="textSubtle">{t('Fee Tier')}</StyledText>,
      right: <StyledText color="text">{feeTier}</StyledText>,
      display: variant !== 'presale' && !showExtraInfo && !!feeTier,
    },
    {
      left: <StyledText color="textSubtle">{t('CAKE to burn:')}</StyledText>,
      right: <StyledText color="text">{cakeToBurn}</StyledText>,
      display: variant !== 'presale' && !showExtraInfo && !!cakeToBurn,
    },
    {
      left: <StyledText color="textSubtle">{t('Status')}</StyledText>,
      right: (
        <FlexGap flexDirection="column" alignItems="flex-end">
          <FlexGap gap="3px">
            <StyledText color="text">
              {ifoStatus?.progress.toFixed(2)} % {ifoStatus?.progress?.greaterThan(1) && '🎉'}
            </StyledText>
          </FlexGap>
          {ifoStatus?.progress?.greaterThan(1) && (
            <FlexGap gap="3px">
              <StyledText color="text">{t('Oversubscribed')}</StyledText>
              <FlexGap ref={targetRef}>
                <InfoIcon width="14px" color="textSubtle" />
                {tooltipVisible && tooltip}
              </FlexGap>
            </FlexGap>
          )}
        </FlexGap>
      ),
      display: variant !== 'presale' && variant !== 'history',
    },
    {
      left: <StyledText color="textSubtle">{t('Fee Tier')}</StyledText>,
      right: <StyledText color="text">{feeTier}</StyledText>,
      display: Boolean(variant !== 'presale' && showExtraInfo && !!feeTier),
    },
    {
      left: <StyledText color="textSubtle">{t('CAKE to burn:')}</StyledText>,
      right: <StyledText color="text">{cakeToBurn}</StyledText>,
      display: Boolean(variant !== 'presale' && showExtraInfo && !!cakeToBurn),
    },
  ]

  return (
    <>
      {list.map((row, idx) => (
        <InfoRow key={idx} {...row} mt={idx === 0 ? '8px' : undefined} />
      ))}
    </>
  )
}

export default IfoPoolInfoDisplay
