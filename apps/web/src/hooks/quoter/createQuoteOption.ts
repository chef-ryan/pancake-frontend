import { PoolHashHelper } from './atom/PoolHashHelper'
import { QuoteOption } from './quoter.types'

export function createQuoteOption(option: Omit<QuoteOption, 'hash'>) {
  const option1 = option as QuoteOption
  option1.hash = PoolHashHelper.hashQuoteQuery(option1)
  return option1
}
