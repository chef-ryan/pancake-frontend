import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Currency as EVMCurrency } from '@pancakeswap/swap-sdk-core'
import { Box, Column, FlexGap, Grid, Row, Text } from '@pancakeswap/uikit'
import { ConfirmModalState, SwapPendingModalContent } from '@pancakeswap/widgets-internal'
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
import { memo, useMemo } from 'react'

const StyledFlexColumn = styled(FlexGap).attrs({ flexDirection: 'column' })`
  text-align: center;
`

const GridColumn = styled(FlexGap)`
  align-items: center;
  justify-content: center;
`

export enum ActionType {
  AddLiquiditySubmitted = 'TransactionSubmitted',
  AddLiquidityComplete = 'TransactionComplete',
  ConfirmLiquiditySupply = 'ConfirmSupply',
  ConfirmLiquidityRemoval = 'ConfirmRemoval',
  ConfirmSwap = 'ConfirmSwap',
  SwapSubmitted = 'SwapSubmitted',
  SwapCompleted = 'SwapCompleted',
}

const iconByActionType: {
  [key in ActionType]: { icon: string | JSX.Element; alt?: string }
} = {
  [ActionType.AddLiquiditySubmitted]: {
    icon: '/images/up-arrow-animated.gif',
    alt: 'Up Arrow',
  },
  [ActionType.AddLiquidityComplete]: {
    icon: '/images/green-tick-animated.gif',
    alt: 'Green Tick',
  },
  [ActionType.ConfirmLiquiditySupply]: {
    icon: <AddCircleLoading />,
  },
  [ActionType.ConfirmLiquidityRemoval]: {
    icon: <AddCircleLoading />,
  },
  [ActionType.ConfirmSwap]: {
    icon: '/images/bunny-Illustration.png',
    alt: 'Confirm Swap',
  },
  [ActionType.SwapSubmitted]: {
    icon: '/images/bunny-Illustration.png',
    alt: 'Confirm Swap',
  },
  [ActionType.SwapCompleted]: {
    icon: '/images/bunny-Illustration.png',
    alt: 'Confirm Swap',
  },
}

const SWAP_TYPES = [ActionType.ConfirmSwap, ActionType.SwapSubmitted, ActionType.SwapCompleted]

interface ActionProps {
  currency0?: Currency
  currency1?: Currency
  amount0?: string
  amount1?: string

  hash?: string
  type?: ActionType
}

export const ActionModal = memo((props: ActionProps) => {
  const { type } = props

  return type && SWAP_TYPES.includes(type) ? <SwapConfirmModal {...props} /> : <LiquidityConfirmModal {...props} />
})

const LiquidityConfirmModal = ({ currency0, currency1, amount0, amount1, hash, type }: ActionProps) => {
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
      ) : type === ActionType.ConfirmLiquiditySupply || type === ActionType.ConfirmLiquidityRemoval ? (
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

type swapConfirmModalProps = ActionProps

export const SwapConfirmModal = ({ currency0, currency1, amount0, amount1, type, hash }: swapConfirmModalProps) => {
  const { t } = useTranslation()
  const userAddress = useAtomValue(addressAtom)
  const network = useAtomValue(networkAtom)

  const currentStep = useMemo(() => {
    switch (type) {
      case ActionType.SwapSubmitted:
        return ConfirmModalState.SUBMITTED
      case ActionType.SwapCompleted:
        return ConfirmModalState.COMPLETED
      default:
        return ConfirmModalState.PENDING_CONFIRMATION
    }
  }, [type])

  if (!currency0 || !currency1 || !amount0 || !amount1) {
    return null
  }

  return (
    <Column gap="20px" pb="32px">
      <Row>
        <SwapPendingModalContent
          currentStep={currentStep}
          title=""
          currencyA={currency0 as unknown as EVMCurrency}
          currencyB={currency1 as unknown as EVMCurrency}
          amountA={amount0}
          amountB={amount1}
          invert
          size="md"
          spinnerSize={84}
        />
      </Row>
      {type === ActionType.ConfirmSwap && (
        <Row justifyContent="center">
          <Text color="textSubtle" fontSize="14px" textAlign="center">
            {t('Please approve it in your wallet: %address%', { address: truncateHash(userAddress, 4) })}
          </Text>
        </Row>
      )}
      {hash ? (
        <Box m="24px 0 4px">
          <Text color="primary60">
            <Link href={getBlockExplorerLink(hash, 'transaction', network)} target="_blank">
              {t('View on explorer:')} {truncateHash(hash)}
            </Link>
          </Text>
        </Box>
      ) : null}
    </Column>
  )
}
