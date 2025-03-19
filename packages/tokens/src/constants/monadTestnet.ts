import { ChainId } from '@pancakeswap/chains'
import { WETH9 } from '@pancakeswap/sdk'
import { BUSD, USDC, USDT } from './common'

export const monadTestnetTokens = {
  weth: WETH9[ChainId.MONAD_TESTNET],
  busd: BUSD[ChainId.MONAD_TESTNET],
  usdc: USDC[ChainId.MONAD_TESTNET],
  usdt: USDT[ChainId.MONAD_TESTNET],
}
