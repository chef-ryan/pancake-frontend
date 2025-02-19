import { useTranslation } from '@pancakeswap/localization'
import { Currency as EVMCurrency } from '@pancakeswap/swap-sdk-core'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Box, Column, FlexGap, Grid, Row, Text } from '@pancakeswap/uikit'
import { ConfirmModalState, SwapPendingModalContent } from '@pancakeswap/widgets-internal'
import { TransactionAnimation } from 'components/Animations/TransactionAnimation'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { memo, useMemo } from 'react'
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
  ConfirmTransaction = 'ConfirmTransaction',
  TransactionSubmitted = 'TransactionSubmitted',
  TransactionComplete = 'TransactionComplete',
  ConfirmLiquiditySupply = 'ConfirmSupply',
  ConfirmLiquidityRemoval = 'ConfirmRemoval',
  ConfirmSwap = 'ConfirmSwap',
  SwapSubmitted = 'SwapSubmitted',
  SwapCompleted = 'SwapCompleted',
}

const iconByActionType: (t) => {
  [key in ActionType]?: { icon: string | JSX.Element; alt?: string }
} = (t) => ({
  [ActionType.ConfirmTransaction]: {
    icon: <TransactionAnimation type="loading" />,
  },
  [ActionType.TransactionSubmitted]: {
    icon: <TransactionAnimation type="submit" />,
  },
  [ActionType.TransactionComplete]: {
    icon: <TransactionAnimation type="longSuccess" width="96px" />,
  },
  [ActionType.ConfirmLiquiditySupply]: {
    // icon: <AddCircleLoading />,
    icon: <TransactionAnimation type="loading" />,
  },
  [ActionType.ConfirmLiquidityRemoval]: {
    // icon: <AddCircleLoading />,
    icon: <TransactionAnimation type="loading" />,
  },
  [ActionType.ConfirmSwap]: {
    icon: '/images/bunny-Illustration.png',
    alt: t('Confirm Swap'),
  },
  [ActionType.SwapSubmitted]: {
    icon: '/images/bunny-Illustration.png',
    alt: t('Confirm Swap'),
  },
  [ActionType.SwapCompleted]: {
    icon: '/images/bunny-Illustration.png',
    alt: t('Confirm Swap'),
  },
})

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

  const actionIcon = type ? iconByActionType(t)[type] : null

  return (
    <StyledFlexColumn gap="8px">
      <Grid gridTemplateColumns={['1fr 1fr 1fr']}>
        <GridColumn>
          <Box>
            {currency0 && <CurrencyLogo currency={currency0} size="40px" />}
            <FlexGap justifyContent="center" alignItems="center" gap="4px">
              {amount0 && <NumberDisplay value={amount0} maximumSignificantDigits={6} fontSize="24px" bold />}
              {currency0 && (
                <Text fontSize="24px" bold>
                  {currency0?.symbol}
                </Text>
              )}
            </FlexGap>
          </Box>
        </GridColumn>
        {actionIcon && (
          <GridColumn>
            <Box>
              {typeof actionIcon.icon === 'string' ? (
                <img src={actionIcon.icon as string} alt={actionIcon.alt} width="80px" />
              ) : (
                actionIcon.icon
              )}
            </Box>
          </GridColumn>
        )}
        <GridColumn>
          <Box>
            {currency1 && <CurrencyLogo currency={currency1} size="40px" />}
            <FlexGap justifyContent="center" alignItems="center" gap="4px">
              {amount1 && <NumberDisplay value={amount1} maximumSignificantDigits={6} fontSize="24px" bold />}
              {currency1 && (
                <Text fontSize="24px" bold>
                  {currency1?.symbol}
                </Text>
              )}
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
        <Row justifyContent="center">
          <Text color="primary60" fontSize="14px" bold>
            <Link href={getBlockExplorerLink(hash, 'transaction', network)} target="_blank">
              {t('View on explorer:')} {truncateHash(hash)}
            </Link>
          </Text>
        </Row>
      ) : null}
    </Column>
  )
}
