import { ChainId } from '@pancakeswap/chains'
import { useHttpLocations } from '@pancakeswap/hooks'
import { Currency, Token, WBNB } from '@pancakeswap/sdk'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import {
  ImageProps,
  TokenImage as UIKitTokenImage,
  TokenPairImage as UIKitTokenPairImage,
  TokenPairImageProps as UIKitTokenPairImageProps,
  TokenPairLogo as UIKitTokenPairLogo,
} from '@pancakeswap/uikit'
import uriToHttp from '@pancakeswap/utils/uriToHttp'
import { getBasicTokensImage } from 'components/Logo/CurrencyLogo'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useMemo } from 'react'
import { isAddressEqual, safeGetAddress } from 'utils'
import getTokenLogoURL from 'utils/getTokenLogoURL'
import { zeroAddress } from 'viem'

interface TokenPairImageProps extends Omit<UIKitTokenPairImageProps, 'primarySrc' | 'secondarySrc'> {
  primaryToken: Currency
  secondaryToken: Currency
  withChainLogo?: boolean
}

export const tokenImageChainNameMapping = {
  [ChainId.BSC]: '',
  [ChainId.ETHEREUM]: 'eth/',
  [ChainId.POLYGON_ZKEVM]: 'polygon-zkevm/',
  [ChainId.ZKSYNC]: 'zksync/',
  [ChainId.ARBITRUM_ONE]: 'arbitrum/',
  [ChainId.LINEA]: 'linea/',
  [ChainId.BASE]: 'base/',
  [ChainId.OPBNB]: 'opbnb/',
}

export const getImageUrlFromToken = (token: Currency) => {
  let address = token?.isNative ? token.wrapped.address : token?.address
  if (token && token.chainId === ChainId.BSC && !token.isNative && isAddressEqual(token.address, zeroAddress)) {
    address = WBNB[ChainId.BSC].wrapped.address
  }

  return token
    ? token.isNative && token.chainId !== ChainId.BSC
      ? `${ASSET_CDN}/web/native/${token.chainId}.png`
      : `https://tokens.pancakeswap.finance/images/${tokenImageChainNameMapping[token.chainId]}${safeGetAddress(
          address,
        )}.png`
    : ''
}

export const getImageUrlsFromToken = (token: Currency & { logoURI?: string | undefined }) => {
  const uriLocations = token?.logoURI ? uriToHttp(token?.logoURI) : []
  const imageUri = getImageUrlFromToken(token)
  return [...uriLocations, imageUri]
}

const useCurrencyLogoSrcs = (currency: Currency & { logoURI?: string | undefined }) => {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)
  const imageUrls = getImageUrlsFromToken(currency)
  const basicTokenImage = getBasicTokensImage(currency)

  return useMemo(() => {
    if (currency?.isNative) return []
    if (currency?.isToken) {
      const tokenLogoURL = getTokenLogoURL(currency as Token)
      if (currency instanceof WrappedTokenInfo) {
        if (!tokenLogoURL) return [...imageUrls, ...uriLocations, basicTokenImage]
        return [...imageUrls, ...uriLocations, tokenLogoURL, basicTokenImage]
      }
      if (!tokenLogoURL) return [...imageUrls, basicTokenImage]
      return [...imageUrls, tokenLogoURL, basicTokenImage]
    }
    return []
  }, [currency, uriLocations, imageUrls, basicTokenImage])
}

export const getChainLogoUrlFromChainId = (chainId: number) => `${ASSET_CDN}/web/chains/${chainId}.png`

export const TokenPairImage: React.FC<React.PropsWithChildren<TokenPairImageProps>> = ({
  primaryToken,
  secondaryToken,
  withChainLogo = false,
  ...props
}) => {
  const chainLogo = withChainLogo ? getChainLogoUrlFromChainId(primaryToken.chainId) : undefined
  return (
    <UIKitTokenPairImage
      primarySrc={getImageUrlFromToken(primaryToken)}
      secondarySrc={getImageUrlFromToken(secondaryToken)}
      chainLogoSrc={chainLogo}
      {...props}
    />
  )
}

export const TokenPairLogo: React.FC<React.PropsWithChildren<TokenPairImageProps>> = ({
  primaryToken,
  secondaryToken,
  withChainLogo = false,
  ...props
}) => {
  const chainLogo = useMemo(
    () => (withChainLogo ? [getChainLogoUrlFromChainId(primaryToken.chainId)] : []),
    [withChainLogo, primaryToken.chainId],
  )
  const primarySrcs = useCurrencyLogoSrcs(primaryToken as Currency & { logoURI?: string | undefined })
  const secondarySrcs = useCurrencyLogoSrcs(secondaryToken as Currency & { logoURI?: string | undefined })
  return (
    <UIKitTokenPairLogo primarySrcs={primarySrcs} secondarySrcs={secondarySrcs} chainLogoSrcs={chainLogo} {...props} />
  )
}

interface TokenImageProps extends ImageProps {
  token: Token
}

export const TokenImage: React.FC<React.PropsWithChildren<TokenImageProps>> = ({ token, ...props }) => {
  return <UIKitTokenImage src={getImageUrlFromToken(token)} {...props} />
}
