import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'

interface FetchPoolsQuery {
  protocols?: Protocol[]
  chains?: ChainId[]
  pageNo?: number
  keywords?: string
}

async function fetchAllPools() {}
