import { getDefaultStore } from 'jotai'
import { Address, beginCell, Cell, storeMessage } from '@ton/ton'
import { TonContext } from 'ton/context/TonContext'
import { traceEndPoints } from 'ton/context/endpoints'
import { chainIdAtom } from 'ton/atom/chainIdAtom'

import { retry } from './helpers'

export async function getTransactionByBOC(userAddress: string | Address, boc: string): Promise<string> {
  const client = TonContext.instance.getClient()

  const address = typeof userAddress === 'string' ? Address.parse(userAddress) : userAddress

  return retry(
    async () => {
      const transactions = await client.getTransactions(address, {
        limit: 3,
      })
      for (const tx of transactions) {
        const inMsg = tx.inMessage
        if (inMsg?.info.type === 'external-in') {
          const inBOC = inMsg?.body
          if (typeof inBOC === 'undefined') {
            continue
          }
          const extHash = Cell.fromBase64(boc).hash().toString('hex')
          const inHash = beginCell().store(storeMessage(inMsg)).endCell().hash().toString('hex')

          console.log(' hash BOC', extHash)
          console.log('inMsg hash', inHash)
          console.log('checking the tx', tx, tx.hash().toString('hex'))

          // Assuming `inBOC.hash()` is synchronous and returns a hash object with a `toString` method
          if (extHash === inHash) {
            console.log('[SUCCESS] Txn match!')
            const txHash = tx.hash().toString('hex')
            console.log(`Transaction Hash: ${txHash}`)
            console.log(`Transaction LT: ${tx.lt}`)
            return txHash
          }
        }
      }
      throw new Error('Transaction not found')
    },
    { retries: 30, delay: 1000 },
  )
}

export const checkTransactionApplied = async ({ hash }: { hash: string }) => {
  const store = getDefaultStore()
  const chainId = store.get(chainIdAtom)
  return retry(
    async () => {
      const traceResponse = await fetch(`${traceEndPoints[chainId]}&tx_hash=${hash}&include_actions=true`)
      const traceData = await traceResponse.json()

      if (traceData?.traces?.length) {
        return traceData
      }
      throw new Error('Transaction not applied')
    },
    { retries: 30, delay: 1000 },
  )
}
