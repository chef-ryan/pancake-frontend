import { Currency, Native, Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import { API_BASE_URL } from 'config/constants/endpoints'
import mainnetList from 'public/lists/main.json'
import testnetList from 'public/lists/testnet.json'
import { ResultJettonData } from 'types/tonapi'
import { unwrappedToken } from './unwrappedToken'

export function currencyKey(currency?: Currency): string {
  const unwrapped = unwrappedToken(currency)
  if (!unwrapped) return 'UNKNOWN'
  return unwrapped.isNative ? unwrapped.symbol : unwrapped.address
}

const tokenCache = new Map<string, Currency>()
export async function fetchTokenByAddress(address: string, chainId: TonChainId): Promise<Currency | undefined> {
  if (address === Native.onChain(chainId).symbol) return Native.onChain(chainId)

  if (tokenCache.has(address)) return tokenCache.get(address)

  // Check for token in list first
  const tokensFromList = chainId === TonChainId.Mainnet ? mainnetList.tokens : testnetList.tokens
  const tokenFromList = tokensFromList.find((token) => token.address.toLowerCase() === address.toLowerCase())
  if (tokenFromList) {
    const token = new Token(
      chainId,
      tokenFromList.address,
      Number(tokenFromList.decimals),
      tokenFromList.symbol,
      tokenFromList.name,
      tokenFromList.logoURI,
    )
    tokenCache.set(address, token)
    return token
  }

  const result = await fetch(`${API_BASE_URL}/token?address=${address}&chainId=${chainId}`)
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
