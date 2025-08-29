import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import ConnectW3WButton from 'components/ConnectW3WButton'
import useTheme from 'hooks/useTheme'
import { useMemo } from 'react'
import { logGTMIfoConnectWalletEvent } from 'utils/customGTMEventTracking'
import { useAccount } from 'wagmi'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { ClaimDisplay } from './ClaimDisplay'
import { Divider } from './Divider'
import { IfoDepositForm } from './IfoDepositForm'
import { PreSaleInfoCard } from './PreSaleInfoCard'
import { StakedDisplay } from './StakedDisplay'

export const IfoStakeActionCard: React.FC<{
  pid: number
  userStatus: IFOUserStatus | undefined
  ifoStatus: IFOStatus
}> = ({ userStatus, ifoStatus, pid }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { theme, isDark } = useTheme()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()

  const stakeCurrency = pid === 0 ? stakeCurrency0 : stakeCurrency1
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { info } = useIfo()
  const { status, raiseAmounts, pricePerTokens } = info

  const [raiseAmount, pricePerToken] = useMemo(() => {
    if (pid === 0) {
      return [raiseAmounts[0], pricePerTokens[0]]
    }

    return [raiseAmounts[1], pricePerTokens[1]]
  }, [pid, raiseAmounts, pricePerTokens])

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )

  const handleConnectWallet = (e) => {
    logGTMIfoConnectWalletEvent(status === 'coming_soon')
  }

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background}>
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          {status === 'finished' ? (
            <ClaimDisplay userStatus={userStatus} pid={pid} />
          ) : userStatus?.stakedAmount?.greaterThan(0) ? (
            <StakedDisplay userStatus={userStatus} pid={pid} />
          ) : (
            <FlexGap flexDirection="column" gap="8px">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {stakeCurrency?.symbol} {t('Pool')}
              </Text>
              {account ? (
                status === 'coming_soon' ? (
                  <PreSaleInfoCard />
                ) : (
                  <IfoDepositForm userStatus={userStatus} pid={pid} />
                )
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
      </CardBody>
    </Card>
  )
}
