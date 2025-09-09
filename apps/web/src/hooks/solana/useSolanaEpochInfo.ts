import { useEffect, useState } from 'react'
import { EpochInfo } from '@solana/web3.js'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export const useSolanaEpochInfo = () => {
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null)

  const connection = useSolanaConnectionWithRpcAtom()

  useEffect(() => {
    let mounted = true
    connection
      .getEpochInfo()
      .then((info) => {
        if (mounted) setEpochInfo(info)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [connection])

  return epochInfo
}
