import { Currency, Native, Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import { ResultJettonData } from 'types/tonapi'

export function currencyKey(currency?: Currency): string {
  if (!currency) return 'UNKNOWN'
  return currency.isNative ? currency.symbol : currency.address
}

const tokenCache = new Map<string, Currency>()
export async function fetchTokenByAddress(address: string, chainId: TonChainId): Promise<Currency | undefined> {
  if (address === Native.onChain(TonChainId.Mainnet).symbol) return Native.onChain(TonChainId.Mainnet)
  if (address === Native.onChain(TonChainId.Testnet).symbol) return Native.onChain(TonChainId.Testnet)

  if (tokenCache.has(address)) return tokenCache.get(address)

  const result = await fetch(`/api/token?address=${address}&chainId=${chainId}`)
  if (!result.ok) throw new Error(`Failed to fetch token data for ${address} on chain ${chainId}`)

  const data: ResultJettonData = await result.json()

  const token = new Token(
    chainId,
    data.metadata.address,
    Number(data.metadata.decimals),
    data.metadata.symbol,
    data.metadata.name,
    data.metadata.image,
  )
  tokenCache.set(address, token)

  return token
}
