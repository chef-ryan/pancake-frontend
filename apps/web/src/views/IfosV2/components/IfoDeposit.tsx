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
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const userStatus = pid === 0 ? userStatus0 : userStatus1

  const { info, config } = useIfo()
  const { status } = info
  const bannerUrl = config?.bannerUrl ?? ''

  if (status === 'coming_soon' || !userStatus) {
    return null
  }

  return (
    <StyledCard>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $bannerUrl={bannerUrl} />
        <IfoRibbon />
        <CardBody>
          <IfoDepositCard pid={pid} />
        </CardBody>
      </Box>
    </StyledCard>
  )
}

const IfoDepositCard = ({ pid }: { pid: number }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const userStatus = pid === 0 ? userStatus0 : userStatus1

  const { pools, info } = useIfo()
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const { status } = info

  const handleConnectWallet = () => {
    logGTMIfoConnectWalletEvent(status === 'coming_soon')
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
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
    </FlexGap>
  )
}

export default IfoDeposit
