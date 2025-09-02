import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import ConnectW3WButton from 'components/ConnectW3WButton'
import { logGTMIfoConnectWalletEvent } from 'utils/customGTMEventTracking'
import { useAccount } from 'wagmi'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { useIfoDisplay } from '../../hooks/useIfoDisplay'
import { Divider } from './Divider'
import { IfoDepositForm } from './IfoDepositForm'
import { StakedDisplay } from './StakedDisplay'

export const IfoPoolLive: React.FC<{
  pid: number
  userStatus: IFOUserStatus | undefined
  ifoStatus: IFOStatus
}> = ({ userStatus, ifoStatus, pid }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()

  const stakeCurrency = pid === 0 ? stakeCurrency0 : stakeCurrency1
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { info, pools } = useIfo()
  const { pools: displayPools } = useIfoDisplay()
  const { status } = info
  const poolInfo = pools?.[pid]
  const raiseAmountText = displayPools?.[pid]?.raiseAmountText
  const pricePerToken = poolInfo?.price

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )

  const handleConnectWallet = () => {
    logGTMIfoConnectWalletEvent(status === 'coming_soon')
  }

  if (status === 'coming_soon') {
    return null
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
      {userHasStaked ? (
        <StakedDisplay userStatus={userStatus} pid={pid} />
      ) : (
        <FlexGap flexDirection="column" gap="8px">
          <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
            {stakeCurrency?.symbol} {t('Pool')}
          </Text>
          {account ? (
            <IfoDepositForm userStatus={userStatus} pid={pid} />
          ) : (
            <ConnectW3WButton width="100%" onClick={handleConnectWallet} />
          )}
        </FlexGap>
      )}

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
        <Text>{raiseAmountText}</Text>
      </FlexGap>
      {status === 'live' && (
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

export default IfoPoolLive
