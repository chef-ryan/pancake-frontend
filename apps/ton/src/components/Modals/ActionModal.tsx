import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Box, FlexGap, Grid, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import styled from 'styled-components'
import { networkAtom } from 'ton/atom/networkAtom'
import { truncateHash } from 'utils'
import { getBlockExplorerLink } from 'utils/getBlockExploreLink'

const StyledFlexColumn = styled(FlexGap).attrs({ flexDirection: 'column' })`
  text-align: center;
`

const GridColumn = styled(FlexGap)`
  align-items: center;
  justify-content: center;
`

export enum ActionType {
  TransactionSubmitted = 'TransactionSubmitted',
  TransactionComplete = 'TransactionComplete',
  ConfirmSupply = 'ConfirmSupply',
}

const iconByActionType = {
  [ActionType.TransactionSubmitted]: {
    src: '/images/up-arrow-animated.gif',
    alt: 'Up Arrow',
  },
  [ActionType.TransactionComplete]: {
    src: '/images/green-tick-animated.gif',
    alt: 'Green Tick',
  },
}

interface ActionProps {
  currency0?: Currency
  currency1?: Currency
  amount0?: string
  amount1?: string

  hash?: string
  type?: ActionType
}

export const ActionModal = ({ currency0, currency1, amount0, amount1, hash, type }: ActionProps) => {
  const { t } = useTranslation()
  const network = useAtomValue(networkAtom)

  return (
    <StyledFlexColumn gap="8px">
      <Grid gridTemplateColumns={['1fr 1fr 1fr']}>
        <GridColumn>
          <Box>
            <CurrencyLogo currency={currency0} size="40px" />
            <FlexGap justifyContent="center" alignItems="center" gap="4px">
              <NumberDisplay value={amount0} fontSize="24px" bold />
              <Text fontSize="24px" bold>
                {currency0?.symbol}
              </Text>
            </FlexGap>
          </Box>
        </GridColumn>
        {type && (
          <GridColumn>
            <Box>
              <img src={iconByActionType[type].src} alt={iconByActionType[type].alt} width="80px" />
            </Box>
          </GridColumn>
        )}
        <GridColumn>
          <Box>
            <CurrencyLogo currency={currency1} size="40px" />
            <FlexGap justifyContent="center" alignItems="center" gap="4px">
              <NumberDisplay value={amount1} fontSize="24px" bold />
              <Text fontSize="24px" bold>
                {currency1?.symbol}
              </Text>
            </FlexGap>
          </Box>
        </GridColumn>
      </Grid>

      {hash && (
        <Box m="24px 0 4px">
          <Text color="primary60">
            <Link href={getBlockExplorerLink(hash, 'transaction', network)} target="_blank">
              {t('View on explorer:')} {truncateHash(hash)}
            </Link>
          </Text>
        </Box>
      )}
    </StyledFlexColumn>
  )
}
