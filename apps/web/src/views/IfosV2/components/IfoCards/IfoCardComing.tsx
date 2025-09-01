import { Box, CardBody, FlexGap } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { ClaimedCard } from './ClaimedCard'
import { IfoSaleInfoCard } from './IfoSaleInfoCard'
import { IfoSaleDetailCard } from './IfoSaleDetailCard'
import { IfoStakeActionCard } from './IfoStakeActionCard'
import { IfoVestingCard } from './IfoVestingCard'
import { VestingScheduleCard } from './VestingScheduleCard'
import type { PoolInfo } from '../../hooks/ifo/useIFOPoolInfo'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'

interface IfoCardProps {
  pool0Info?: PoolInfo
  pool1Info?: PoolInfo
  userStatus0?: IFOUserStatus
  userStatus1?: IFOUserStatus
  ifoStatus0: IFOStatus
  ifoStatus1: IFOStatus
}

const SaleInfoWrapper = styled(FlexGap)`
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

export const IfoCardComing: React.FC<IfoCardProps> = ({
  pool0Info,
  pool1Info,
  userStatus0,
  userStatus1,
  ifoStatus0,
  ifoStatus1,
}) => (
  <CardBody>
    {pool0Info && <ClaimedCard userStatus={userStatus0} pid={pool0Info.pid} />}
    {pool1Info && <ClaimedCard userStatus={userStatus1} pid={pool1Info.pid} />}
    <SaleInfoWrapper gap="16px">
      <Box>
        <IfoSaleInfoCard />
      </Box>
      <Box>
        <IfoSaleDetailCard />
      </Box>
    </SaleInfoWrapper>
    <FlexGap flexDirection="column" gap="16px">
      {pool0Info && <IfoStakeActionCard pid={pool0Info.pid} userStatus={userStatus0} ifoStatus={ifoStatus0} />}
      {pool1Info && <IfoStakeActionCard pid={pool1Info.pid} userStatus={userStatus1} ifoStatus={ifoStatus1} />}
    </FlexGap>
    <IfoVestingCard />
    <VestingScheduleCard />
  </CardBody>
)
