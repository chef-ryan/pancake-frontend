import { Box, Card, CardBody, CardHeader, FlexGap, Spinner } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

import { useMemo } from 'react'
import { useIFOStatus } from '../../hooks/ifo/useIFOStatus'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import { useIFOPoolInfo } from '../../hooks/ifo/useIFOPoolInfo'
import { useIFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { Footer } from '../Footer'
import { ClaimedCard } from './ClaimedCard'
import { IfoRibbon } from './IfoRibbon'
import { IfoSaleInfoCard } from './IfoSaleInfoCard'
import { IfoStakeActionCard } from './IfoStakeActionCard'
import { IfoVestingCard } from './IfoVestingCard'

export const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const Header = styled(CardHeader)<{
  $isCurrent?: boolean
  $bannerUrl: string
}>`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: ${({ $isCurrent }) => ($isCurrent ? '64px' : '112px')};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: ${({ theme }) => theme.colors.dropdown};
  background-image: ${({ $bannerUrl }) => `url('${$bannerUrl}')`};
`

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  margin: 8px 0 0 0;
`

export const IfoCurrentCard = ({ ifoId, bannerUrl }: { ifoId: string; bannerUrl: string }) => {
  const { info } = useIfo()
  const { status, duration, startTimestamp, endTimestamp } = info
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const { offeringCurrency } = useIFOCurrencies()
  const hasUserStaked = userStatus0?.stakedAmount?.greaterThan(0) || userStatus1?.stakedAmount?.greaterThan(0)
  const isClaimed = useMemo(() => {
    if (!userStatus0 && !userStatus1) return false
    if (userStatus0?.claimableAmount?.greaterThan(0) && userStatus1?.claimableAmount?.greaterThan(0))
      return userStatus0.claimed && userStatus1.claimed
    return userStatus0?.claimed || userStatus1?.claimed
  }, [userStatus0, userStatus1])

  if (!status || !offeringCurrency) {
    return <Spinner />
  }

  return (
    <Card style={{ width: '100%' }}>
      <Box className="sticky-header" position="sticky" bottom="48px" width="100%" zIndex={6}>
        <Header $isCurrent $bannerUrl={bannerUrl} />
        <IfoRibbon
          startTime={startTimestamp}
          plannedStartTime={startTimestamp}
          ifoStatus={status}
          endTime={endTimestamp}
          hasUserStaked={hasUserStaked}
          isClaimed={isClaimed}
        />
        <IfoCard />
      </Box>
      <Footer />
    </Card>
  )
}

export const IfoCard: React.FC = () => {
  const { data: poolInfo } = useIFOPoolInfo()
  const { pool0Info, pool1Info } = poolInfo ?? {}
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const [ifoStatus0, ifoStatus1] = useIFOStatus()

  return (
    <CardBody>
      {pool0Info && <ClaimedCard userStatus={userStatus0} pid={pool0Info.pid} />}
      {pool1Info && <ClaimedCard userStatus={userStatus1} pid={pool1Info.pid} />}
      <IfoSaleInfoCard />
      <FlexGap flexDirection="column" gap="16px">
        {pool0Info && <IfoStakeActionCard pid={pool0Info.pid} userStatus={userStatus0} ifoStatus={ifoStatus0} />}
        {pool1Info && <IfoStakeActionCard pid={pool1Info.pid} userStatus={userStatus1} ifoStatus={ifoStatus1} />}
      </FlexGap>
      <IfoVestingCard />
    </CardBody>
  )
}
