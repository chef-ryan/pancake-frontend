import { SeverityErrorText } from '@pancakeswap/uikit'
import { warningSeverity } from 'utils/exchange'
import { ONE_BIPS } from 'config/constants/exchange'
import { Percent } from '@pancakeswap/swap-sdk-core'

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
  const severity = warningSeverity(priceImpact)
  return (
    <SeverityErrorText color={severity === 0 ? 'positive60' : undefined} fontSize="14px" severity={severity}>
      {priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? '<0.01%' : `${priceImpact.toFixed(2)}%`) : '-'}
    </SeverityErrorText>
  )
}
