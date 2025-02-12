import { Currency, Token, TonChainId, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { TON_API } from 'config/constants/endpoints'
import { ResultJettonData } from 'types/tonapi'

export function currencyKey(currency?: Currency): string {
  if (!currency) return 'UNKNOWN'
  return currency.isNative ? currency.symbol : currency.address
}

// TODO (@penguin): Cache globally with either NextJS API or external API
const tokenCache = new Map<string, Token>()
export async function fetchTokenByAddress(address: string, network: TonNetworks): Promise<Token | undefined> {
  if (tokenCache.has(address)) return tokenCache.get(address)

  const result = await fetch(`${TON_API[network]}/v2/jettons/${address}`)
  if (!result.ok) throw new Error(`Failed to fetch token data for ${address} on ${network} network`)

  const data: ResultJettonData = await result.json()

  const token = new Token(
    network === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet,
    data.metadata.address,
    Number(data.metadata.decimals),
    data.metadata.symbol,
    data.metadata.name,
    data.metadata.image,
  )
  tokenCache.set(address, token)

  return token
}
