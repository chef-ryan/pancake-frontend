import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useRouter } from 'next/router'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import type { IFOUserStatus } from '../../hooks/ifo/useIFOUserStatus'
import useIfo from '../../hooks/useIfo'
import IfoPoolInfoDisplay from './IfoPoolInfoDisplay'

export const IfoPoolLive: React.FC<{
  pid: number
  ifoStatus: IFOStatus
  userStatus?: IFOUserStatus
}> = ({ ifoStatus, pid, userStatus }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { config, info, pools } = useIfo()
  const status = info?.status
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const ifoId = config?.id
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)
  if (status === 'coming_soon') {
    return null
  }

  const handleDepositClick = () => {
    if (ifoId) {
      const { ifo, ...restQuery } = router.query
      router.push({
        pathname: '/ifo/deposit/[ifoId]/[poolIndex]',
        query: { ifoId, poolIndex: pid, ...restQuery },
      })
    }
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
      <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
        {stakeCurrency?.symbol} {t('Pool')}
      </Text>
      <FlexGap justifyContent="space-between" alignItems="center">
        <CurrencyLogo currency={stakeCurrency} size="40px" />
        {userHasStaked ? (
          <Button variant="secondary" scale="sm" onClick={handleDepositClick} disabled={status !== 'live'}>
            <AddIcon color="primary" />
          </Button>
        ) : (
          <Button scale="sm" onClick={handleDepositClick} disabled={status !== 'live'}>
            {t('Deposit')}
          </Button>
        )}
      </FlexGap>

      <IfoPoolInfoDisplay pid={pid} ifoStatus={ifoStatus} userStatus={userStatus} variant="live" />
    </FlexGap>
  )
}

export default IfoPoolLive
