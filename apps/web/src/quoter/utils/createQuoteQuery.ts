import { QuoteQuery } from 'quoter/quoter.types'
import { PoolHashHelper } from './PoolHashHelper'

export function createQuoteQuery(option: Omit<QuoteQuery, 'hash'>) {
  const option1 = option as QuoteQuery
  option1.hash = PoolHashHelper.hashQuoteQuery(option1)
  return option1
}
