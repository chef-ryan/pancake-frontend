import { useMemo } from 'react'
import { useIfoV2Context, type IfoPool } from '../contexts/IfoV2Context'
import { useIFOCurrencies } from './ifo/useIFOCurrencies'
import { useIFOInfo } from './ifo/useIFOInfo'

const useIfo = () => {
  const ctx = useIfoV2Context()
  const info = useIFOInfo()
  const { stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()

  const pools = useMemo<IfoPool[]>(() => {
    const list: IfoPool[] = []
    if (stakeCurrency0) {
      list.push({ currency: stakeCurrency0, price: info.pricePerTokens[0], raise: info.raiseAmounts[0] })
    }
    if (stakeCurrency1) {
      list.push({ currency: stakeCurrency1, price: info.pricePerTokens[1], raise: info.raiseAmounts[1] })
    }
    return list
  }, [stakeCurrency0, stakeCurrency1, info.pricePerTokens, info.raiseAmounts])

  return { ...ctx, info, pools }
}

export default useIfo
