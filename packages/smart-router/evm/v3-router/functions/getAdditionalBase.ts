import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/swap-sdk-core'
import memoize from '@pancakeswap/utils/memoize'
import { Address, checksumAddress } from 'viem'
import { ADDITIONAL_BASES, ADDITIONAL_BASES_TABLE } from '../../constants'

const fetchConfig = memoize(async () => {
  const url = `https://proofs.pancakeswap.com/cms-config/routing-base-config.json`
  try {
    const response = await fetch(url)
    const data: {
      [chainId: string]: {
        [tokenAddress: Address]: {
          address: Address
          symbol: string
          decimals: number
        }[]
      }
    } = await response.json()

    const table: ADDITIONAL_BASES_TABLE = {}
    Object.keys(data).forEach((key) => {
      const chainId = Number(key) as ChainId
      table[chainId] = {}
      for (const [address, list] of Object.entries(data[key])) {
        const src = checksumAddress(address as Address)
        const to = list.map((item) => {
          return new Token(chainId, checksumAddress(item.address), item.decimals, item.symbol, '')
        })
        table[chainId][src] = to
      }
    })
    console.log(`[routing]`, table)
    return table
  } catch (ex) {
    return ADDITIONAL_BASES
  }
})

type TokenBases = {
  [tokenAddress: Address]: Token[]
}

export async function getAdditionalBases(chainId?: ChainId): Promise<TokenBases> {
  if (!chainId) {
    return {}
  }
  const table = await fetchConfig()
  return table[chainId] ?? {}
}
