import { ChainId } from '@pancakeswap/chains'
import { Currency, ERC20Token, Token } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { Graph } from '@pancakeswap/utils/Graph'

const PAIR_SELECT_WHITELIST: Partial<Record<ChainId, [ERC20Token, ERC20Token][]>> = {
  // sUSDe/USDe
  [ChainId.BSC]: [
    [bscTokens.susde, bscTokens.usde],
    [bscTokens.olm, bscTokens.ora],
    [bscTokens.brm, bscTokens.ora],
  ],
}

function buildPairsMap() {
  const graph = new Graph<ERC20Token, [ERC20Token, ERC20Token]>((x) => x.address)

  Object.keys(PAIR_SELECT_WHITELIST).forEach((chainId) => {
    const _chainId = Number.parseInt(chainId) as ChainId
    const list = PAIR_SELECT_WHITELIST[_chainId] || []
    for (const pair of list) {
      const tokenA = pair[0]
      const tokenB = pair[1]
      graph.addEdge(tokenA, tokenB)
      graph.addEdge(tokenB, tokenA)
    }
  })
  return graph
}
const graph = buildPairsMap()

export const getWhiteListPairs = (chainId: ChainId, bases: Token[], a: Currency, b: Currency) => {
  const pairs = PAIR_SELECT_WHITELIST[chainId]
  if (!pairs) {
    return []
  }
  if (a.isNative || b.isNative) {
    return []
  }
  const A = graph.getOutgoingVertices(a)
  const B = graph.getOutgoingVertices(b)

  if (!(A.length || B.length)) {
    return []
  }
  const list: [Currency, Currency][] = []
  if (A.length) {
    list.push(...A.map((x): [Currency, Currency] => [a, x]))
  }
  if (B.length) {
    list.push(...B.map((x): [Currency, Currency] => [b, x]))
  }

  list.push(...[...A, ...B].map((x) => bases.map((base): [Currency, Currency] => [x, base])).flat())
  return list
}
