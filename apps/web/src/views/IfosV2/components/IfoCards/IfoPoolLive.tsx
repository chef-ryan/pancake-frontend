import { useTranslation } from '@pancakeswap/localization'
import { Button, FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useRouter } from 'next/router'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { useIfoDisplay } from '../../hooks/useIfoDisplay'

export const IfoPoolLive: React.FC<{
  pid: number
  ifoStatus: IFOStatus
  userStatus?: IFOUserStatus
}> = ({ ifoStatus, pid, userStatus }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { config, info, pools } = useIfo()
  const { pools: displayPools } = useIfoDisplay()
  const { status, offeringCurrency } = info
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const raiseAmountText = displayPools?.[pid]?.raiseAmountText
  const pricePerToken = poolInfo?.price
  const ifoId = config?.id
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )
  if (status === 'coming_soon') {
    return null
  }

  const handleDepositClick = () => {
    if (ifoId) {
      router.push(`/ifo/deposit/${ifoId}/${pid}`)
    }
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
      <FlexGap justifyContent="space-between" alignItems="center">
        <FlexGap alignItems="center" gap="4px">
          <CurrencyLogo currency={stakeCurrency} size="24px" />
          <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
            {stakeCurrency?.symbol} {t('Pool')}
          </Text>
        </FlexGap>
        <Button scale="sm" onClick={handleDepositClick} disabled={status !== 'live'}>
          {t('Deposit')}
        </Button>
      </FlexGap>

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
        <Text>{raiseAmountText}</Text>
      </FlexGap>
      {userHasStaked && (
        <FlexGap justifyContent="space-between">
          <Text color="textSubtle">{t('Deposit Amount')}</Text>
          <Text>
            {ifoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
          </Text>
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
    </FlexGap>
  )
}

export default IfoPoolLive
