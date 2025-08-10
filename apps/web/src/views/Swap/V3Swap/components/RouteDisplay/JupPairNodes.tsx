import { Currency, SPLToken } from '@pancakeswap/sdk'
import React, { useMemo } from 'react'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { PairNode } from '../PairNode'

export type Pair = [Currency, Currency]

export interface PairNodeProps {
  pair: Pair
  text: string | React.ReactNode
  className: string
  tooltipText: string
}

export type PairNodeComponent = React.ComponentType<PairNodeProps>

interface Params {
  pairs: Pair[]
  pools: any[]
}

function SolanaPairNode({ pair, className }: Omit<PairNodeProps, 'text' | 'tooltipText'>) {
  const [input, output] = pair as [SPLToken, SPLToken]

  // why need to use useUnifiedCurrency here?
  // Because Jupiter only return token adddress,
  // so when we convert it in parseSVMTradeIntoSVMOrder,
  // we only have token address, no other info.
  // so we need to use useUnifiedCurrency to get actual token info.
  const inputCurrency = useUnifiedCurrency(input.address, input.chainId)
  const outputCurrency = useUnifiedCurrency(output.address, output.chainId)

  const tooltipText = `${inputCurrency?.symbol}/${outputCurrency?.symbol}`

  const slpTokenPair: Pair | undefined = useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return undefined
    }
    return [inputCurrency, outputCurrency] as Pair
  }, [inputCurrency, outputCurrency])

  if (!slpTokenPair) {
    return null
  }

  return <PairNode pair={slpTokenPair} text={tooltipText} className={className} tooltipText={tooltipText} />
}

export function JupPairNodes({ pairs }: Params): React.ReactNode[] | null {
  return pairs.length > 0
    ? pairs.map((p, index) => {
        return <SolanaPairNode pair={p} className="highlight" key={index} />
      })
    : null
}
