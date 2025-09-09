import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { logGTMIfoConnectWalletEvent } from 'utils/customGTMEventTracking'
import type { IFOStatus } from '../../hooks/ifo/useIFOStatus'
import type { IFOUserStatus } from '../../ifov2.types'
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
  const isComingSoon = status === 'coming_soon'
  const poolInfo = pools?.[pid]
  const stakeCurrency = poolInfo?.stakeCurrency
  const ifoId = config?.id
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)
  const { address: account } = useAccount()
  if (isComingSoon) {
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

  const handleConnectWallet = () => {
    logGTMIfoConnectWalletEvent(isComingSoon)
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
      <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
        {stakeCurrency?.symbol} {t('Pool')}
      </Text>
      <FlexGap alignItems="center" width="100%" gap="8px">
        <CurrencyLogo currency={stakeCurrency} size="40px" />
        {!account ? (
          <ConnectWalletButton scale="sm" onClickCapture={handleConnectWallet} style={{ marginLeft: 'auto' }} />
        ) : userHasStaked ? (
          <Button
            variant="secondary"
            scale="sm"
            onClick={handleDepositClick}
            disabled={status !== 'live'}
            style={{
              height: '40px',
              marginLeft: 'auto',
            }}
            padding="11px 12px 13px 12px"
          >
            <AddIcon color="primary" />
          </Button>
        ) : (
          <Button
            scale="sm"
            onClick={handleDepositClick}
            style={{
              height: '40px',
              flex: 1,
            }}
            disabled={status !== 'live'}
          >
            {t('Deposit %symbol%', { symbol: stakeCurrency?.symbol })}
          </Button>
        )}
      </FlexGap>

      <IfoPoolInfoDisplay pid={pid} ifoStatus={ifoStatus} userStatus={userStatus} variant="live" />
    </FlexGap>
  )
}

export default IfoPoolLive
