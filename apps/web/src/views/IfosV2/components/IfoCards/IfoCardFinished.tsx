import { CardBody, FlexGap } from '@pancakeswap/uikit'
import { ClaimedCard } from './ClaimedCard'
import { IfoSaleInfoCard } from './IfoSaleInfoCard'
import { IfoPoolFinished } from './IfoPoolFinished'
import { IfoVestingCard } from './IfoVestingCard'
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

export const IfoCardFinished: React.FC<IfoCardProps> = ({
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
    <IfoSaleInfoCard />
    <FlexGap flexDirection="column" gap="16px">
      {pool0Info && <IfoPoolFinished pid={pool0Info.pid} userStatus={userStatus0} ifoStatus={ifoStatus0} />}
      {pool1Info && <IfoPoolFinished pid={pool1Info.pid} userStatus={userStatus1} ifoStatus={ifoStatus1} />}
    </FlexGap>
    <IfoVestingCard />
  </CardBody>
)
