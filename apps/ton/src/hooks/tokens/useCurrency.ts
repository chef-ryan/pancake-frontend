import { currencyFamily } from 'atoms/currencyAtoms'
import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { CurrencyField } from 'types/currency'
import { useNativeCurrency } from './useNativeCurrency'

export const useCurrency = (field: CurrencyField, address: string) => {
  const isFetchComplete = useRef(false)
  const nativeCurrency = useNativeCurrency()

  const [currency, setCurrency] = useAtom(currencyFamily(field))

  const { data: tokenByAddress, isFetched } = useAtomValue(tokenByAddressQueryAtom(address))
  const { data: list } = useAtomValue(fetchListAtom)

  useEffect(() => {
    if (!isFetchComplete.current && address) {
      const tokenInList = list?.find((item) => item.address === address)
      if (address === nativeCurrency.symbol) {
        setCurrency(nativeCurrency)
        isFetchComplete.current = true
      } else if (tokenInList) {
        setCurrency(tokenInList)
        isFetchComplete.current = true
      } else if (tokenByAddress && isFetched) {
        setCurrency(tokenByAddress)
        isFetchComplete.current = true
      }
    }
  }, [currency, setCurrency, tokenByAddress, isFetched, list, address, nativeCurrency])

  return [currency, setCurrency] as const
}
