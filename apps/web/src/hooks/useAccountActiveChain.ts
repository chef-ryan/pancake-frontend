import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'

export const useActiveChainId = (checkChainId?: number) => {
  const result = useAtomValue(accountActiveChainAtom)

  if (!checkChainId) return result

  const { chainId, isWrongNetwork } = result
  return {
    ...result,
    isWrongNetwork: isWrongNetwork && checkChainId !== chainId,
  }
}

export const useActiveChainIdRef = () => {
  const { chainId } = useAccountActiveChain()

  const ref = useRef(chainId)
  useEffect(() => {
    ref.current = chainId
  }, [chainId])
  return ref
}

export const useAccountActiveChain = () => {
  return useAtomValue(accountActiveChainAtom)
}

export default useAccountActiveChain
