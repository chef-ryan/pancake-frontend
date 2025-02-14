import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Box, FlexGap, Grid, Text } from '@pancakeswap/uikit'
import { AddCircleLoading } from 'components/Misc/AddCircleLoading'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import styled from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
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
  ConfirmRemoval = 'ConfirmRemoval',
}

const iconByActionType: {
  [key in ActionType]: { icon: string | JSX.Element; alt?: string }
} = {
  [ActionType.TransactionSubmitted]: {
    icon: '/images/up-arrow-animated.gif',
    alt: 'Up Arrow',
  },
  [ActionType.TransactionComplete]: {
    icon: '/images/green-tick-animated.gif',
    alt: 'Green Tick',
  },
  [ActionType.ConfirmSupply]: {
    icon: <AddCircleLoading />,
  },
  [ActionType.ConfirmRemoval]: {
    icon: <AddCircleLoading />,
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
  const userAddress = useAtomValue(addressAtom)

  return (
    <StyledFlexColumn gap="8px">
      <Grid gridTemplateColumns={['1fr 1fr 1fr']}>
        <GridColumn>
          <Box>
            <CurrencyLogo currency={currency0} size="40px" />
            <FlexGap justifyContent="center" alignItems="center" gap="4px">
              <NumberDisplay value={amount0} maximumSignificantDigits={6} fontSize="24px" bold />
              <Text fontSize="24px" bold>
                {currency0?.symbol}
              </Text>
            </FlexGap>
          </Box>
        </GridColumn>
        {type && (
          <GridColumn>
            <Box>
              {typeof iconByActionType[type].icon === 'string' ? (
                <img src={iconByActionType[type].icon as string} alt={iconByActionType[type].alt} width="80px" />
              ) : (
                iconByActionType[type].icon
              )}
            </Box>
          </GridColumn>
        )}
        <GridColumn>
          <Box>
            <CurrencyLogo currency={currency1} size="40px" />
            <FlexGap justifyContent="center" alignItems="center" gap="4px">
              <NumberDisplay value={amount1} maximumSignificantDigits={6} fontSize="24px" bold />
              <Text fontSize="24px" bold>
                {currency1?.symbol}
              </Text>
            </FlexGap>
          </Box>
        </GridColumn>
      </Grid>

      {hash ? (
        <Box m="24px 0 4px">
          <Text color="primary60">
            <Link href={getBlockExplorerLink(hash, 'transaction', network)} target="_blank">
              {t('View on explorer:')} {truncateHash(hash)}
            </Link>
          </Text>
        </Box>
      ) : type === ActionType.ConfirmSupply || type === ActionType.ConfirmRemoval ? (
        <Box m="24px 0 4px">
          <Text color="textSubtle">
            {t('Please approve this in your wallet %address%', { address: truncateHash(userAddress, 4) })}
          </Text>
        </Box>
      ) : (
        <></>
      )}
    </StyledFlexColumn>
  )
}
