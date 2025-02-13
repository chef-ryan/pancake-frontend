import { useAtomValue } from 'jotai'
import { addressAtom } from 'ton/atom/addressAtom'
import { parseAddress } from 'ton/utils/address'

export const useUserAddress = () => {
  const userAddress = useAtomValue(addressAtom)
  return parseAddress(userAddress)
}
