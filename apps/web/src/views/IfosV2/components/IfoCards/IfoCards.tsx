import { Box, Card, CardHeader, Spinner } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

import { useMemo } from 'react'
import { useIFOStatus } from '../../hooks/ifo/useIFOStatus'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import { useIFOPoolInfo } from '../../hooks/ifo/useIFOPoolInfo'
import { useIFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import { Footer } from '../Footer'
import { IfoRibbon } from './IfoRibbon'
import { IfoCardComing } from './IfoCardComing'
import { IfoCardLive } from './IfoCardLive'
import { IfoCardFinished } from './IfoCardFinished'
import { IfoCardIdle } from './IfoCardIdle'

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

const IfoCard: React.FC = () => {
  const pools = useIFOPoolInfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]
  const [userStatus0, userStatus1] = useIFOUserStatus()
  const [ifoStatus0, ifoStatus1] = useIFOStatus()
  const { info } = useIfo()
  const { status: ifoStatus } = info

  const cardProps = {
    pool0Info,
    pool1Info,
    userStatus0,
    userStatus1,
    ifoStatus0,
    ifoStatus1,
  }

  switch (ifoStatus) {
    case 'coming_soon':
      return <IfoCardComing {...cardProps} />
    case 'live':
      return <IfoCardLive {...cardProps} />
    case 'finished':
      return <IfoCardFinished {...cardProps} />
    case 'idle':
    default:
      return <IfoCardIdle {...cardProps} />
  }
}
