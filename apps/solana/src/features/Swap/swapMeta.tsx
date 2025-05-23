import { Trans } from '@pancakeswap/localization'

export const getTxMeta = ({ values = {} }: { values?: Record<string, unknown> }) => {
  return {
    title: <Trans>Swap</Trans>,
    description: <Trans {...values}>Swap %amountA% %symbolA% for %amountB% %symbolB%.</Trans>,
    txHistoryTitle: <Trans>Swap</Trans>,
    txHistoryDesc: <Trans {...values}>Swap %amountA% %symbolA% for %amountB% %symbolB%.</Trans>,
    txValues: values
  }
}
