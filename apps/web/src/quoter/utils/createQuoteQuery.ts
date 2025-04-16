import { QuoteQuery } from 'quoter/quoter.types'
import { PoolHashHelper } from './PoolHashHelper'

export function createQuoteQuery(query: Omit<QuoteQuery, 'hash'>): QuoteQuery {
  const option1 = query as QuoteQuery
  option1.hash = PoolHashHelper.hashQuoteQuery(option1)
  return option1
}
