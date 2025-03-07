import { atom, useAtom } from 'jotai'
import { useEffect, useCallback } from 'react'
import { TonContext } from 'ton/context/TonContext'

export const blockNumberAtom = atom<number | null>(null)

export function useBlockNumber() {
  const [blockNumber, setBlockNumber] = useAtom(blockNumberAtom)
  const client = TonContext.instance.getClient()

  const getLatestBlock = useCallback(async () => {
    try {
      const block = await client.getMasterchainInfo()
      setBlockNumber(block.latestSeqno)
    } catch (error) {
      console.error('Error fetching block:', error)
    }
  }, [client, setBlockNumber])

  useEffect(() => {
    getLatestBlock()

    const interval = setInterval(getLatestBlock, 5000)
    return () => clearInterval(interval)
  }, [getLatestBlock])

  return blockNumber
}
