import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, Trade } from '@pancakeswap/ton-v2-sdk'
import { ChevronRightIcon, Flex, QuestionHelper, Text } from '@pancakeswap/uikit'
import { Fragment } from 'react'
import { unwrappedToken } from 'utils/tokens/unwrappedToken'

export interface AdvancedSwapDetailsProps {
  trade?: Trade<Currency, Currency, TradeType> | null
  isLoading?: boolean
}

export const SwapRoute = ({ trade }: AdvancedSwapDetailsProps) => {
  const { t } = useTranslation()
  return trade ? (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const symbol = unwrappedToken(token)?.symbol ?? token.symbol
        return (
          <Fragment key={token.wrapped.address}>
            <Flex alignItems="end">
              <Text fontSize="14px" ml="0.125rem" mr="0.125rem">
                {symbol}
              </Text>
            </Flex>
            {!isLastItem && <ChevronRightIcon width="12px" />}
          </Fragment>
        )
      })}
      {trade.route.path.length > 2 && (
        <QuestionHelper
          ml="4px"
          text={t(
            'If a multi-hop swap fails mid-way, you will receive the last successfully swapped token before the failure.',
          )}
          placement="bottom-start"
        />
      )}
    </Flex>
  ) : (
    '-'
  )
}
