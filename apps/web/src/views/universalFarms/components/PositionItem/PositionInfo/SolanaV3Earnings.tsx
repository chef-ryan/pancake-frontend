import { useTranslation } from '@pancakeswap/localization'
import { AtomBoxProps, Box, Grid, Row, useMatchBreakpoints } from '@pancakeswap/uikit'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useSolanaV3RewardInfoFromSimulation } from 'views/universalFarms/hooks/useSolanaV3RewardInfoFromSimulation'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { DetailInfoLabel } from './styled'
import { EarningsWithToken } from './EarningsWithToken'

export const SolanaV3Earnings = ({
  pool,
  position,
  rowProps,
}: {
  pool: SolanaV3PoolInfo
  position: SolanaV3PositionDetail
  rowProps?: AtomBoxProps
}) => {
  const { t } = useTranslation()
  const { breakdownRewardInfo } = useSolanaV3RewardInfoFromSimulation({
    poolInfo: pool,
    position,
  })
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      <Grid gridGap="8px" alignItems="flex-start" gridTemplateColumns={isMobile ? '1fr' : 'auto 1fr'}>
        <DetailInfoLabel>{t('Farm Rewards')}:</DetailInfoLabel>
        <Grid gridTemplateColumns={isMobile ? '1fr 1fr' : '2fr 2fr'} gridGap="8px">
          {breakdownRewardInfo.rewards.map((r, index) => (
            <EarningsWithToken
              key={index}
              currency={convertRawTokenInfoIntoSPLToken(r.mint as TokenInfo)}
              earningsAmount={Number(r.amount)}
              earningsUsd={Number(r.amountUSD)}
              rowProps={{ justifyContent: 'space-between' }}
            />
          ))}
        </Grid>
      </Grid>
      <Grid gridGap="8px" alignItems="flex-start" gridTemplateColumns={isMobile ? '1fr' : 'auto 1fr'}>
        <DetailInfoLabel>{t('LP Fees')}: </DetailInfoLabel>
        <Grid gridTemplateColumns={isMobile ? '1fr 1fr' : '2fr 2fr'} gridGap="8px">
          {breakdownRewardInfo.fee.A?.mint ? (
            <EarningsWithToken
              currency={convertRawTokenInfoIntoSPLToken(breakdownRewardInfo.fee.A?.mint as TokenInfo)}
              earningsAmount={Number(breakdownRewardInfo.fee.A?.amount)}
              earningsUsd={Number(breakdownRewardInfo.fee.A?.amountUSD)}
              rowProps={{ justifyContent: 'space-between' }}
            />
          ) : null}
          {breakdownRewardInfo.fee.B?.mint ? (
            <EarningsWithToken
              currency={convertRawTokenInfoIntoSPLToken(breakdownRewardInfo.fee.B?.mint as TokenInfo)}
              earningsAmount={Number(breakdownRewardInfo.fee.B?.amount)}
              earningsUsd={Number(breakdownRewardInfo.fee.B?.amountUSD)}
              rowProps={{ justifyContent: 'space-between' }}
            />
          ) : null}
        </Grid>
      </Grid>
    </>
  )
}
