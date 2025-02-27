import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useNativeCurrency } from './useNativeCurrency'

export const useCurrency = (address?: string) => {
  const nativeCurrency = useNativeCurrency()
  const { data: tokenByAddress, isFetched } = useAtomValue(tokenByAddressQueryAtom(address ?? ''))
  const { data: list } = useAtomValue(fetchListAtom)

  return useMemo(() => {
    const tokenInList = list?.find((item) => item.address === address)
    if (address?.toLowerCase() === nativeCurrency.symbol.toLowerCase()) {
      return nativeCurrency
    }
    if (tokenInList) {
      return tokenInList
    }
    if (tokenByAddress && isFetched) {
      return tokenByAddress
    }
    return undefined
  }, [tokenByAddress, isFetched, list, address, nativeCurrency])
}
