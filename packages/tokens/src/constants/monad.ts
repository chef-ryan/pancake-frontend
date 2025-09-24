import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'

import { BUSD, USDC, USDT } from './common'

export const monadTokens = {
  weth: WETH9[ChainId.MONAD_MAINNET],
  busd: BUSD[ChainId.MONAD_MAINNET],
  usdc: USDC[ChainId.MONAD_MAINNET],
  usdt: USDT[ChainId.MONAD_MAINNET],
  wmon: new ERC20Token(
    ChainId.MONAD_MAINNET,
    '0x4200000000000000000000000000000000000006',
    18,
    'WMON',
    'Wrapped Monad',
    'https://www.monad.xyz/',
  ),
}
