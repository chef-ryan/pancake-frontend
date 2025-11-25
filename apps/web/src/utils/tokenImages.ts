import { ChainId, isSolana, NonEVMChainId } from '@pancakeswap/chains'
import { getUnifiedCurrencyAddress, Token, UnifiedCurrency, WBNB } from '@pancakeswap/sdk'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import makeBlockiesUrl from 'blockies-react-svg/dist/es/makeBlockiesUrl.mjs'
import { getBasicTokensImage } from 'components/Logo/CurrencyLogo'
import { ASSET_CDN } from 'config/constants/endpoints'
import memoize from 'lodash/memoize'
import { isAddressEqual, safeGetAddress } from 'utils'
import { zeroAddress } from 'viem'
import getTokenLogoURL from './getTokenLogoURL'

export const tokenImageChainNameMapping = {
  [ChainId.BSC]: '',
  [ChainId.ETHEREUM]: 'eth/',
  [ChainId.ZKSYNC]: 'zksync/',
  [ChainId.ARBITRUM_ONE]: 'arbitrum/',
  [ChainId.LINEA]: 'linea/',
  [ChainId.BASE]: 'base/',
  [ChainId.OPBNB]: 'opbnb/',
  [NonEVMChainId.SOLANA]: 'solana/',
}

const getImageUrlFromToken = (token?: UnifiedCurrency) => {
  let address = token?.isNative ? token.wrapped.address : token?.address
  if (token && token.chainId === ChainId.BSC && !token.isNative && isAddressEqual(token.address, zeroAddress)) {
    address = WBNB[ChainId.BSC].wrapped.address
  }

  return token
    ? token.isNative && token.chainId !== ChainId.BSC
      ? `${ASSET_CDN}/web/native/${token.chainId}.png`
      : `https://tokens.pancakeswap.finance/images/${tokenImageChainNameMapping[token.chainId]}${
          isSolana(token.chainId) && !token.isNative ? token.address : safeGetAddress(address)
        }.png`
    : ''
}

const _getCurrencyLogoSrcs = (currency?: UnifiedCurrency & { logoURI?: string | undefined }) => {
  const allUrls = () => {
    if (currency?.isNative) return [getImageUrlFromToken(currency)]
    if (currency?.isToken) {
      const uriLocations =
        typeof currency === 'object' && 'logoURI' in currency && currency.logoURI ? uriToHttp(currency.logoURI) : []
      const imageUri = getImageUrlFromToken(currency)
      const basicTokenImage = getBasicTokensImage(currency)
      const tokenLogoURL = getTokenLogoURL(currency as Token)
      return [...uriLocations, imageUri, tokenLogoURL, basicTokenImage]
    }
    return []
  }
  const addr = currency ? getUnifiedCurrencyAddress(currency) : undefined
  const pxImage = addr ? makeBlockiesUrl(addr) : undefined
  const list = allUrls()?.filter((x): x is string => Boolean(x))
  list.push(pxImage)
  return list
}

export const getCurrencyLogoSrcs = memoize(_getCurrencyLogoSrcs, (currency) => {
  const chainId = currency?.chainId ?? undefined
  const address = currency ? getUnifiedCurrencyAddress(currency) : undefined
  const logoURI =
    typeof currency === 'object' && currency !== null && 'logoURI' in currency && currency.logoURI
      ? currency.logoURI
      : ''

  return `${chainId}-${address}-${logoURI}`
})
