import { useUnifiedCurrency } from 'hooks/Tokens'
import { NonEVMChainId } from '@pancakeswap/chains'
import { usePoolInfoByQuery } from './usePoolInfoByQuery'

export const usePoolSymbol = () => {
  const poolInfo = usePoolInfoByQuery()

  const currency0 = useUnifiedCurrency(poolInfo?.mintA.address, NonEVMChainId.SOLANA)
  const currency1 = useUnifiedCurrency(poolInfo?.mintB.address, NonEVMChainId.SOLANA)

  const [poolSymbol, symbol0, symbol1] = [
    `${currency0?.symbol ?? ''} / ${currency1?.symbol ?? ''}`,
    currency0?.symbol ?? '',
    currency1?.symbol ?? '',
  ]

  return {
    poolSymbol,
    currency0,
    currency1,
    symbol0,
    symbol1,
  }
}
