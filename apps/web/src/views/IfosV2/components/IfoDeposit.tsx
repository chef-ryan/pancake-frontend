import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import ConnectW3WButton from 'components/ConnectW3WButton'
import { logGTMIfoConnectWalletEvent } from 'utils/customGTMEventTracking'
import { useAccount } from 'wagmi'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { Divider } from './IfoCards/Divider'
import { IfoDepositForm } from './IfoCards/IfoDepositForm'
import { StakedDisplay } from './IfoCards/StakedDisplay'
import { IfoRibbon } from './IfoCards/IfoRibbon'
import { useIFOCurrencies } from '../hooks/ifo/useIFOCurrencies'
import { useIFOStatus } from '../hooks/ifo/useIFOStatus'
import { useIFOUserStatus } from '../hooks/ifo/useIFOUserStatus'
import useIfo from '../hooks/useIfo'
import { useIfoDisplay } from '../hooks/useIfoDisplay'

const Header = styled(CardHeader)<{ $bannerUrl: string }>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 64px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ $bannerUrl }) => `url('${$bannerUrl}')`};
`

const StyledCard = styled(Card)`
  width: 100%;
  margin: 0 auto;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 737px;
  }
`

export const IfoDeposit: React.FC<{ pid: number }> = ({ pid }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()
  const stakeCurrency = pid === 0 ? stakeCurrency0 : stakeCurrency1
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const userStatus = pid === 0 ? userStatus0 : userStatus1
  const [ifoStatus0, ifoStatus1] = useIFOStatus()
  const ifoStatus = pid === 0 ? ifoStatus0 : ifoStatus1
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { info, pools, config } = useIfo()
  const { pools: displayPools } = useIfoDisplay()
  const { status } = info
  const poolInfo = pools?.[pid]
  const raiseAmountText = displayPools?.[pid]?.raiseAmountText
  const pricePerToken = poolInfo?.price
  const bannerUrl = config?.bannerUrl ?? ''

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
    <StyledCard>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $bannerUrl={bannerUrl} />
        <IfoRibbon />
        <CardBody>
          <FlexGap flexDirection="column" gap="8px">
            {userHasStaked ? (
              <StakedDisplay userStatus={userStatus} pid={pid} />
            ) : (
              <FlexGap flexDirection="column" gap="8px">
                <FlexGap alignItems="center" gap="4px">
                  <CurrencyLogo currency={stakeCurrency} size="24px" />
                  <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                    {stakeCurrency?.symbol} {t('Pool')}
                  </Text>
                </FlexGap>
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
        </CardBody>
      </Box>
    </StyledCard>
  )
}

export default IfoDeposit
