import { useAtom } from 'jotai'
import atomWithStorageWithErrorCatch from 'utils/atomWithStorageWithErrorCatch'

const USER_TOKEN_RISK = 'pcs:user-token-risk'

const DEFAULT_VALUE = true

const userTokenRiskAtom = atomWithStorageWithErrorCatch<boolean>(USER_TOKEN_RISK, true)

export function useUserTokenRisk() {
  return [...useAtom(userTokenRiskAtom), DEFAULT_VALUE] as const
}
