import { Contracts, Currency, getAddressCellHash, Native, TonChainId, TonContractNames } from '@pancakeswap/ton-v2-sdk'
import { isAddressEqual } from './address'
import { getJettonWalletAddress } from './jettonWalletAddress'

export async function getTokenOrder(chainId: TonChainId, token0Address: string, token1Address: string) {
  // Native token is always first
  if (isAddressEqual(token0Address, Native.onChain(chainId).wrapped.address)) {
    return { token0: token0Address, token1: token1Address, isFlipped: false }
  }

  if (isAddressEqual(token1Address, Native.onChain(chainId).wrapped.address)) {
    return { token0: token1Address, token1: token0Address, isFlipped: true }
  }

  const [routerJettonWallet0, routerJettonWallet1] = await Promise.all([
    getJettonWalletAddress(Contracts[TonContractNames.PCSRouter][chainId].address, token0Address),
    getJettonWalletAddress(Contracts[TonContractNames.PCSRouter][chainId].address, token1Address),
  ])

  const token0Hash = getAddressCellHash(routerJettonWallet0.toString())
  const token1Hash = getAddressCellHash(routerJettonWallet1.toString())

  if (token0Hash > token1Hash) {
    return { token0: token0Address, token1: token1Address, isFlipped: false }
  }

  return { token0: token1Address, token1: token0Address, isFlipped: true }
}

export async function getCurrencyOrder(currency0: Currency, currency1: Currency) {
  if (!currency0 || !currency1) return { currency0, currency1, isFlipped: false }

  if (currency0.isNative) return { currency0, currency1, isFlipped: false }
  if (currency1.isNative) return { currency0: currency1, currency1: currency0, isFlipped: true }

  const { isFlipped } = await getTokenOrder(currency0.chainId, currency0.wrapped.address, currency1.wrapped.address)

  return isFlipped
    ? { currency0: currency1, currency1: currency0, isFlipped: true }
    : { currency0, currency1, isFlipped: false }
}
