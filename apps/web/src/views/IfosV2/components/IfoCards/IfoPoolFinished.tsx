import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { ClaimDisplay } from './ClaimDisplay'
import { Divider } from './Divider'

export const IfoPoolFinished: React.FC<{
  pid: number
  userStatus: IFOUserStatus | undefined
  ifoStatus: IFOStatus
}> = ({ userStatus, ifoStatus, pid }) => {
  const { t } = useTranslation()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()

  const stakeCurrency = pid === 0 ? stakeCurrency0 : stakeCurrency1
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { info, pools } = useIfo()
  const { status } = info
  const poolInfo = pools?.[pid]
  const raiseAmount = poolInfo?.raise
  const pricePerToken = poolInfo?.price

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )

  if (status === 'coming_soon') {
    return null
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
      <ClaimDisplay userStatus={userStatus} pid={pid} />

      {userHasStaked && <Divider />}
      <FlexGap justifyContent="space-between" mt="8px">
        <Text color="textSubtle">
          {t('Sale Price per')} {offeringCurrency?.symbol ?? ''}
        </Text>
        <Text>
          {pricePerToken?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
        </Text>
      </FlexGap>
      <FlexGap justifyContent="space-between">
        <Text color="textSubtle">{t('Target Raise')}</Text>
        <Text>
          {raiseAmount?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
        </Text>
      </FlexGap>
      {(status === 'live' || status === 'finished') && (
        <>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Total committed')}</Text>
            <Text>
              {ifoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
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
        </>
      )}
    </FlexGap>
  )
}

export default IfoPoolFinished
