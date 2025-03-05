import { useAtom } from 'jotai'
import atomWithStorageWithErrorCatch from 'utils/atomWithStorageWithErrorCatch'

const USER_SHOW_TESTNET = 'pcs:user-show-testnet'

const DEFAULT_VALUE = false

const userShowTestnetAtom = atomWithStorageWithErrorCatch<boolean>(USER_SHOW_TESTNET, DEFAULT_VALUE)

export function useUserShowTestnet() {
  return [...useAtom(userShowTestnetAtom), DEFAULT_VALUE] as const
}
