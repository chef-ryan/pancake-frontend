import { useAtomValue, useSetAtom } from 'jotai'
import React, { useEffect } from 'react'
import { Box, Skeleton, Spinner } from '@pancakeswap/uikit'
import { useIFOPoolInfoCtx } from '../hooks/ifo/useIFOPoolInfo'
import { ifoInfoAtom, ifoPoolsAtom } from '../atom/ifo.atoms'
import { useIFOInfoCtx } from '../hooks/ifo/useIFOInfo'

export const SyncIfoContext = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const pools = useIFOPoolInfoCtx()
  const updatePools = useSetAtom(ifoPoolsAtom(id))
  const updateInfo = useSetAtom(ifoInfoAtom(id))
  const info = useIFOInfoCtx()
  const infoValue = useAtomValue(ifoInfoAtom(id))
  const poolsValue = useAtomValue(ifoPoolsAtom(id))
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

  if (!infoValue || !poolsValue) {
    return (
      <Box width="100%" minHeight="100px" display="flex">
        <Skeleton />
      </Box>
    )
  }
  return children
}
