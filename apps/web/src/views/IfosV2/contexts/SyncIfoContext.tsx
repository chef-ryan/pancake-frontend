import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useIFOPoolInfoCtx } from '../hooks/ifo/useIFOPoolInfo'
import { ifoInfoAtom, ifoPoolsAtom } from '../atom/ifo.atoms'
import { useIFOInfoCtx } from '../hooks/ifo/useIFOInfo'

export const SyncIfoContext = ({ id }: { id: string }) => {
  const pools = useIFOPoolInfoCtx()
  const updatePools = useSetAtom(ifoPoolsAtom(id))
  const updateInfo = useSetAtom(ifoInfoAtom(id))
  const info = useIFOInfoCtx()
  useEffect(() => {
    if (pools) {
      updatePools(pools)
    }
  }, [pools])

  useEffect(() => {
    if (info && info.offeringCurrency) {
      updateInfo(info)
    }
  }, [info])
  return null
}
