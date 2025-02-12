import { Currency } from '@pancakeswap/ton-v2-sdk'
import { currencyFamily } from 'atoms/currencyAtoms'
import { useAtom } from 'jotai'
import { CurrencyField } from 'types/currency'

const currencyCache = new Map<string, Currency>()

export const useCurrency = (field: CurrencyField, searchParam?: string) => {
  const currencyAtom = useAtom(currencyFamily(field))
  // const [currency] = currencyAtom

  // const { data: list } = useAtomValue(fetchListAtom)

  // if (isAddress(searchParam)) {
  // }

  // return currencyAtom
}
