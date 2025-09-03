import { FlexGap } from '@pancakeswap/uikit'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import { ClaimDisplay } from './ClaimDisplay'
import { Divider } from './Divider'
import IfoPoolInfoDisplay from './IfoPoolInfoDisplay'

export const IfoPoolFinished: React.FC<{
  pid: number
  userStatus: IFOUserStatus | undefined
  ifoStatus: IFOStatus
}> = ({ userStatus, ifoStatus, pid }) => {
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  return (
    <FlexGap flexDirection="column" gap="8px">
      <ClaimDisplay userStatus={userStatus} pid={pid} />

      {userHasStaked && <Divider />}
      <IfoPoolInfoDisplay pid={pid} userStatus={userStatus} ifoStatus={ifoStatus} variant="finished" />
    </FlexGap>
  )
}

export default IfoPoolFinished
